import { supabase } from '../lib/supabase';
import AsyncStorage from '@react-native-async-storage/async-storage';

const BLOCK_CACHE_KEY = 'blocked_users_cache';
const CACHE_EXPIRY_MS = 5 * 60 * 1000; // 5 minutes

interface BlockedUser {
  id: string;
  blocked_id: string;
  blocked_user: {
    full_name: string;
    email: string;
  };
  created_at: string;
}

interface BlockCache {
  blockedIds: string[];
  timestamp: number;
}

class BlockingService {
  private blockCache: Set<string> = new Set();
  private cacheTimestamp: number = 0;

  // Block a user
  async blockUser(blockerId: string, blockedId: string): Promise<void> {
    if (blockerId === blockedId) {
      throw new Error('Cannot block yourself');
    }

    const { error } = await supabase
      .from('user_blocks')
      .insert([{
        blocker_id: blockerId,
        blocked_id: blockedId,
      }]);

    if (error) {
      // If already blocked, ignore the error
      if (error.code === '23505') { // unique_violation
        return;
      }
      throw error;
    }

    // Update cache
    this.blockCache.add(blockedId);
    await this.saveCacheToStorage(blockerId);
  }

  // Unblock a user
  async unblockUser(blockerId: string, blockedId: string): Promise<void> {
    const { error } = await supabase
      .from('user_blocks')
      .delete()
      .eq('blocker_id', blockerId)
      .eq('blocked_id', blockedId);

    if (error) throw error;

    // Update cache
    this.blockCache.delete(blockedId);
    await this.saveCacheToStorage(blockerId);
  }

  // Check if a user is blocked (bidirectional)
  async isBlocked(userId1: string, userId2: string): Promise<boolean> {
    try {
      // Try using the RPC function first
      const { data, error } = await supabase
        .rpc('is_user_blocked', {
          user1_id: userId1,
          user2_id: userId2,
        });

      if (error) {
        // If function doesn't exist, fall back to direct query
        if (error.code === 'PGRST202') {
          return await this.isBlockedFallback(userId1, userId2);
        }
        console.error('Error checking block status:', error);
        return false;
      }

      return data || false;
    } catch (error) {
      console.error('Error checking block status:', error);
      return false;
    }
  }

  // Fallback method if RPC function doesn't exist
  private async isBlockedFallback(userId1: string, userId2: string): Promise<boolean> {
    const { data, error } = await supabase
      .from('user_blocks')
      .select('id')
      .or(`and(blocker_id.eq.${userId1},blocked_id.eq.${userId2}),and(blocker_id.eq.${userId2},blocked_id.eq.${userId1})`)
      .limit(1);

    if (error) {
      console.error('Error in fallback block check:', error);
      return false;
    }

    return (data && data.length > 0) || false;
  }

  // Get list of blocked users for a user
  async getBlockedUsers(blockerId: string): Promise<BlockedUser[]> {
    const { data, error } = await supabase
      .from('user_blocks')
      .select(`
        id,
        blocked_id,
        created_at,
        blocked_user:profiles!user_blocks_blocked_id_fkey (
          full_name,
          email
        )
      `)
      .eq('blocker_id', blockerId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    // Transform data to handle profiles array
    return (data || []).map((block: any) => ({
      ...block,
      blocked_user: Array.isArray(block.blocked_user) 
        ? block.blocked_user[0] 
        : block.blocked_user,
    }));
  }

  // Get blocked user IDs (bidirectional) - for filtering
  async getBlockedUserIds(userId: string): Promise<string[]> {
    // Check cache first
    if (this.isCacheValid()) {
      return Array.from(this.blockCache);
    }

    // Try to load from storage
    const cachedData = await this.loadCacheFromStorage(userId);
    if (cachedData) {
      this.blockCache = new Set(cachedData.blockedIds);
      this.cacheTimestamp = cachedData.timestamp;
      return cachedData.blockedIds;
    }

    // Fetch from database
    try {
      const { data, error } = await supabase
        .rpc('get_blocked_user_ids', { user_id: userId });

      if (error) {
        // If function doesn't exist, fall back to direct query
        if (error.code === 'PGRST202') {
          return await this.getBlockedUserIdsFallback(userId);
        }
        console.error('Error fetching blocked users:', error);
        return [];
      }

      const blockedIds = (data || []).map((row: any) => row.blocked_user_id);
      this.blockCache = new Set(blockedIds);
      this.cacheTimestamp = Date.now();
      await this.saveCacheToStorage(userId);

      return blockedIds;
    } catch (error) {
      console.error('Error fetching blocked users:', error);
      return [];
    }
  }

  // Fallback method if RPC function doesn't exist
  private async getBlockedUserIdsFallback(userId: string): Promise<string[]> {
    // Get users I blocked
    const { data: blocked, error: error1 } = await supabase
      .from('user_blocks')
      .select('blocked_id')
      .eq('blocker_id', userId);

    // Get users who blocked me
    const { data: blockers, error: error2 } = await supabase
      .from('user_blocks')
      .select('blocker_id')
      .eq('blocked_id', userId);

    if (error1 || error2) {
      console.error('Error in fallback blocked users fetch:', error1 || error2);
      return [];
    }

    const blockedIds = [
      ...(blocked || []).map(b => b.blocked_id),
      ...(blockers || []).map(b => b.blocker_id),
    ];

    // Remove duplicates and cache
    const uniqueIds = [...new Set(blockedIds)];
    this.blockCache = new Set(uniqueIds);
    this.cacheTimestamp = Date.now();
    await this.saveCacheToStorage(userId);

    return uniqueIds;
  }

  // Filter content based on blocks
  async filterBlockedContent<T>(
    items: T[],
    getUserId: (item: T) => string,
    currentUserId: string
  ): Promise<T[]> {
    const blockedIds = await this.getBlockedUserIds(currentUserId);
    const blockedSet = new Set(blockedIds);

    return items.filter(item => {
      const itemUserId = getUserId(item);
      return !blockedSet.has(itemUserId);
    });
  }

  // Refresh block cache
  async refreshBlockCache(userId: string): Promise<void> {
    this.clearBlockCache();
    await this.getBlockedUserIds(userId);
  }

  // Clear block cache
  clearBlockCache(): void {
    this.blockCache.clear();
    this.cacheTimestamp = 0;
  }

  // Check if cache is valid
  private isCacheValid(): boolean {
    return this.blockCache.size > 0 && 
           (Date.now() - this.cacheTimestamp) < CACHE_EXPIRY_MS;
  }

  // Save cache to AsyncStorage
  private async saveCacheToStorage(userId: string): Promise<void> {
    try {
      const cacheData: BlockCache = {
        blockedIds: Array.from(this.blockCache),
        timestamp: this.cacheTimestamp,
      };
      await AsyncStorage.setItem(
        `${BLOCK_CACHE_KEY}_${userId}`,
        JSON.stringify(cacheData)
      );
    } catch (error) {
      console.error('Error saving block cache:', error);
    }
  }

  // Load cache from AsyncStorage
  private async loadCacheFromStorage(userId: string): Promise<BlockCache | null> {
    try {
      const cached = await AsyncStorage.getItem(`${BLOCK_CACHE_KEY}_${userId}`);
      if (!cached) return null;

      const cacheData: BlockCache = JSON.parse(cached);
      
      // Check if cache is expired
      if ((Date.now() - cacheData.timestamp) >= CACHE_EXPIRY_MS) {
        return null;
      }

      return cacheData;
    } catch (error) {
      console.error('Error loading block cache:', error);
      return null;
    }
  }
}

export default new BlockingService();
