import { supabase } from '../lib/supabase';

export interface ValidationResult {
  valid: boolean;
  reason?: string;
  errorMessage?: string;
}

class TextModerationService {
  private profanityList: string[] = [];
  private lastFetch: number = 0;
  private readonly CACHE_DURATION = 60 * 60 * 1000; // 1 hour

  // Validate a message before submission
  async validateMessage(message: string): Promise<ValidationResult> {
    if (!message || message.trim().length === 0) {
      return {
        valid: false,
        reason: 'empty',
        errorMessage: 'Message cannot be empty',
      };
    }

    // Check for profanity
    if (await this.containsProfanity(message)) {
      return {
        valid: false,
        reason: 'profanity',
        errorMessage: 'Message contains inappropriate language',
      };
    }

    // Check for spam patterns
    if (this.isSpam(message)) {
      return {
        valid: false,
        reason: 'spam',
        errorMessage: 'Message appears to be spam',
      };
    }

    return { valid: true };
  }

  // Check for profanity
  async containsProfanity(text: string): Promise<boolean> {
    await this.ensureProfanityListLoaded();

    const lowerText = text.toLowerCase();
    
    // Check for exact matches and variations
    for (const word of this.profanityList) {
      const pattern = new RegExp(`\\b${word}\\b`, 'i');
      if (pattern.test(lowerText)) {
        return true;
      }
      
      // Check for variations with special characters
      const sanitized = lowerText.replace(/[^a-z0-9]/g, '');
      const wordSanitized = word.replace(/[^a-z0-9]/g, '');
      if (sanitized.includes(wordSanitized)) {
        return true;
      }
    }

    return false;
  }

  // Check for spam patterns
  isSpam(text: string): boolean {
    // Check for excessive capitalization (>70% uppercase in messages >10 chars)
    if (text.length > 10) {
      const uppercaseCount = (text.match(/[A-Z]/g) || []).length;
      const letterCount = (text.match(/[A-Za-z]/g) || []).length;
      
      if (letterCount > 0 && (uppercaseCount / letterCount) > 0.7) {
        return true;
      }
    }

    // Check for repeated characters (>5 consecutive identical characters)
    const repeatedPattern = /(.)\1{5,}/;
    if (repeatedPattern.test(text)) {
      return true;
    }

    return false;
  }

  // Get profanity filter configuration
  async getProfanityFilter(): Promise<string[]> {
    await this.ensureProfanityListLoaded();
    return [...this.profanityList];
  }

  // Ensure profanity list is loaded and cached
  private async ensureProfanityListLoaded(): Promise<void> {
    const now = Date.now();
    
    // Use cache if available and not expired
    if (this.profanityList.length > 0 && (now - this.lastFetch) < this.CACHE_DURATION) {
      return;
    }

    try {
      const { data, error } = await supabase
        .from('profanity_filter')
        .select('word')
        .eq('active', true);

      if (error) throw error;

      this.profanityList = (data || []).map(row => row.word.toLowerCase());
      this.lastFetch = now;
    } catch (error) {
      console.error('Error loading profanity filter:', error);
      
      // Fallback to basic list if database fetch fails
      if (this.profanityList.length === 0) {
        this.profanityList = [
          'fuck', 'shit', 'ass', 'bitch', 'bastard', 'damn', 'crap', 'piss'
        ];
      }
    }
  }

  // Clear cache (useful for testing or manual refresh)
  clearCache(): void {
    this.profanityList = [];
    this.lastFetch = 0;
  }
}

export default new TextModerationService();
