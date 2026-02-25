import { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

interface Club {
  id: string;
  name: string;
  description: string;
  location: string;
  sport_type: string;
  member_count: number;
  creator_id: string;
  is_private: boolean;
}

export default function Clubs() {
  const navigation = useNavigation();
  const { user } = useAuth();
  const [clubs, setClubs] = useState<Club[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Color palette for club avatars
  const clubColors = [
    '#4A7C59', // Green
    '#5B8C9E', // Blue
    '#9B6B9E', // Purple
    '#D97757', // Orange
    '#7B9E5B', // Lime
    '#9E5B7C', // Pink
    '#5B7C9E', // Steel Blue
    '#9E8C5B', // Gold
    '#5B9E8C', // Teal
    '#9E5B5B', // Red
  ];

  // Generate consistent color based on club ID
  const getClubColor = (clubId: string) => {
    let hash = 0;
    for (let i = 0; i < clubId.length; i++) {
      hash = clubId.charCodeAt(i) + ((hash << 5) - hash);
    }
    const index = Math.abs(hash) % clubColors.length;
    return clubColors[index];
  };

  useEffect(() => {
    loadClubs();
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadClubs();
    }, [])
  );

  const loadClubs = async () => {
    try {
      const { data, error } = await supabase
        .from('clubs')
        .select('*')
        .order('member_count', { ascending: false });

      if (error) throw error;
      setClubs(data || []);
    } catch (error) {
      console.error('Error loading clubs:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadClubs();
  };

  const filteredClubs = clubs.filter((club) => {
    const matchesSearch = 
      (club.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (club.location || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (club.sport_type || '').toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  const renderClub = ({ item }: { item: Club }) => {
    const clubInitial = item.name.charAt(0).toUpperCase();
    const clubColor = getClubColor(item.id);
    
    return (
      <TouchableOpacity 
        style={styles.clubCard}
        onPress={() => navigation.navigate('ClubDetail' as never, { clubId: item.id } as never)}
      >
        <View style={styles.clubHeader}>
          <View style={[styles.clubLogo, { backgroundColor: clubColor }]}>
            <Text style={styles.clubLogoText}>{clubInitial}</Text>
          </View>
          <View style={styles.clubInfo}>
            <View style={styles.clubNameRow}>
              <Text style={styles.clubName}>{item.name}</Text>
              {item.is_private && <Text style={styles.privateIcon}>🔒</Text>}
            </View>
            <Text style={styles.clubLocation}>📍 {item.location}</Text>
            <Text style={styles.clubMembers}>👥 {item.member_count} members</Text>
          </View>
        </View>
        
        {item.description && (
          <Text style={styles.clubDescription} numberOfLines={2}>
            {item.description}
          </Text>
        )}

        <View style={styles.clubFooter}>
          <View style={styles.sportBadge}>
            <Text style={styles.sportBadgeText}>{item.sport_type}</Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#4A7C59" />
        <Text style={styles.loadingText}>Loading clubs...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Clubs</Text>
        <TouchableOpacity 
          style={styles.createButton}
          onPress={() => navigation.navigate('CreateClub' as never)}
        >
          <Text style={styles.createButtonText}>+ Create</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.searchContainer}>
        <Text style={styles.searchIcon}>🔍</Text>
        <TextInput
          style={styles.searchInput}
          placeholder="Search clubs..."
          placeholderTextColor="#999"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {filteredClubs.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyIcon}>👥</Text>
          <Text style={styles.emptyTitle}>No clubs yet</Text>
          <Text style={styles.emptyText}>
            Be the first to create a club!
          </Text>
        </View>
      ) : (
        <FlatList
          data={filteredClubs}
          renderItem={renderClub}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor="#4A7C59"
            />
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'white',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: 20,
    backgroundColor: 'white',
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#4A7C59',
  },
  createButton: {
    backgroundColor: '#4A7C59',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  createButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 20,
    marginBottom: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
  },
  searchIcon: {
    fontSize: 20,
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#000',
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  clubCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  clubHeader: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  clubLogo: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#4A7C59',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  clubLogoText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
  },
  clubInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  clubNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  clubName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
    marginRight: 8,
  },
  privateIcon: {
    fontSize: 14,
  },
  clubLocation: {
    fontSize: 13,
    color: '#666',
    marginBottom: 2,
  },
  clubMembers: {
    fontSize: 13,
    color: '#666',
  },
  clubDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
    lineHeight: 20,
  },
  clubFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sportBadge: {
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  sportBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#4A7C59',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#000',
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
});
