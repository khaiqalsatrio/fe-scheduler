import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, FlatList, TouchableOpacity, SafeAreaView, Platform, StatusBar, Image, ActivityIndicator, RefreshControl } from 'react-native';
import { MessageCircle, Users, Hash } from 'lucide-react-native';
import { ChannelService } from '../../services/channelService';

interface ChannelItemProps {
  id: string;
  title: string;
  category: string;
  lastMessage: string;
  time: string;
  joined: boolean;
  memberCount: number;
  unreadCount?: number;
  emoji: string;
  color: string;
}

const ChannelCard = ({ item }: { item: ChannelItemProps }) => (
  <TouchableOpacity style={styles.channelItem}>
    <View style={[styles.avatarContainer, { backgroundColor: item.color }]}>
      <Text style={styles.avatarEmoji}>{item.emoji}</Text>
    </View>
    
    <View style={styles.contentContainer}>
      <View style={styles.headerRow}>
        <View style={styles.titleWrapper}>
          <Hash size={18} color="#94A3B8" />
          <Text style={styles.channelTitle}>{item.title}</Text>
          {item.joined && (
            <View style={styles.joinedBadge}>
              <Text style={styles.joinedText}>Joined</Text>
            </View>
          )}
        </View>
        <Text style={styles.timeText}>{item.time}</Text>
      </View>
      
      <Text style={styles.categoryText}>{item.category}</Text>
      
      <View style={styles.bottomRow}>
        <Text style={styles.lastMessage} numberOfLines={1}>{item.lastMessage}</Text>
        <View style={styles.statsWrapper}>
          <View style={styles.memberCountWrapper}>
            <Users size={12} color="#94A3B8" />
            <Text style={styles.memberCountText}>{item.memberCount}</Text>
          </View>
          {item.unreadCount && item.unreadCount > 0 && (
            <View style={styles.unreadBadge}>
              <Text style={styles.unreadText}>{item.unreadCount}</Text>
            </View>
          )}
        </View>
      </View>
    </View>
  </TouchableOpacity>
);

export default function ChannelScreen() {
  const [channels, setChannels] = useState<ChannelItemProps[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchChannelsData = async () => {
    try {
      const [regularRes, recommendedRes] = await Promise.all([
        ChannelService.getChannels().catch(() => null),
        ChannelService.getRecommendedChannels().catch(() => null)
      ]);
      
      let mergedData: any[] = [];
      if (regularRes && regularRes.status && regularRes.data) {
        mergedData = [...regularRes.data];
      }
      if (recommendedRes && recommendedRes.status && recommendedRes.data) {
        // Gabungkan tanpa duplikat id
        recommendedRes.data.forEach(item => {
          if (!mergedData.find(x => x.id === item.id)) {
            mergedData.push(item);
          }
        });
      }

      const mappedData = mergedData.map(item => ({
        id: item.id || Math.random().toString(),
        title: item.title || item.name || 'Unnamed Channel',
        category: item.category || 'General',
        lastMessage: item.lastMessage || '...',
        time: item.time || '',
        joined: item.joined || false,
        memberCount: item.memberCount || 0,
        unreadCount: item.unreadCount || 0,
        emoji: item.emoji || '💬',
        color: item.color || '#F1F5F9',
      }));
      setChannels(mappedData);
    } catch (error) {
      console.error('Failed to fetch channels:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchChannelsData();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchChannelsData();
  };

  if (loading && !refreshing) {
    return (
      <SafeAreaView style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color="#7C3AED" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.logoRow}>
          <Image 
            source={require('../../assets/images/logo.png')} 
            style={styles.logoImage} 
          />
          <Text style={styles.headerTitle}>Channel</Text>
        </View>
      </View>

      <FlatList
        data={channels}
        keyExtractor={(item) => item.id}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#7C3AED']} />
        }
        ListHeaderComponent={() => (
          <View style={styles.infoBox}>
            <MessageCircle size={20} color="#7C3AED" style={styles.infoIcon} />
            <Text style={styles.infoText}>
              Ruang diskusi berbasis minat. Join channel untuk mulai berpartisipasi!
            </Text>
          </View>
        )}
        ListEmptyComponent={() => (
          <View style={{ padding: 40, alignItems: 'center' }}>
            <Text style={{ color: '#64748B', textAlign: 'center', fontSize: 14 }}>
              Saat ini belum ada channel yang tersedia.
            </Text>
          </View>
        )}
        renderItem={({ item }) => <ChannelCard item={item} />}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF',
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#FFF',
  },
  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoImage: {
    width: 32,
    height: 32,
    marginRight: 10,
    borderRadius: 8,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#000',
  },
  infoBox: {
    flexDirection: 'row',
    backgroundColor: '#FAF5FF',
    marginHorizontal: 20,
    marginVertical: 10,
    padding: 15,
    borderRadius: 12,
    alignItems: 'center',
  },
  infoIcon: {
    marginRight: 12,
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    color: '#5B21B6',
    lineHeight: 18,
    fontWeight: '500',
  },
  listContent: {
    paddingBottom: 20,
  },
  channelItem: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  avatarContainer: {
    width: 54,
    height: 54,
    borderRadius: 27,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  avatarEmoji: {
    fontSize: 24,
  },
  contentContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  titleWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  channelTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1E293B',
  },
  joinedBadge: {
    backgroundColor: '#10B981',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    marginLeft: 8,
  },
  joinedText: {
    color: '#FFF',
    fontSize: 10,
    fontWeight: '700',
  },
  timeText: {
    fontSize: 12,
    color: '#94A3B8',
  },
  categoryText: {
    fontSize: 13,
    color: '#64748B',
    marginBottom: 6,
    fontWeight: '500',
  },
  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  lastMessage: {
    flex: 1,
    fontSize: 14,
    color: '#475569',
    marginRight: 10,
  },
  statsWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  memberCountWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  memberCountText: {
    fontSize: 12,
    color: '#94A3B8',
    fontWeight: '500',
  },
  unreadBadge: {
    backgroundColor: '#10B981',
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  unreadText: {
    color: '#FFF',
    fontSize: 11,
    fontWeight: '700',
  },
});
