import React from 'react';
import { StyleSheet, View, Text, FlatList, TouchableOpacity, SafeAreaView, Platform, StatusBar, Image } from 'react-native';
import { MessageCircle, Users, Hash } from 'lucide-react-native';

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

const CHANNELS: ChannelItemProps[] = [
  {
    id: '1',
    title: 'Move & Energy',
    category: 'Olah Raga',
    lastMessage: 'Besok pagi ada yang mau joggi...',
    time: '15:20',
    joined: true,
    memberCount: 45,
    unreadCount: 3,
    emoji: '🏃',
    color: '#E0F2FE',
  },
  {
    id: '2',
    title: 'Culinary & Art',
    category: 'Olah Rasa',
    lastMessage: 'Ada rekomendasi tempat maka...',
    time: '14:45',
    joined: true,
    memberCount: 68,
    unreadCount: 5,
    emoji: '🎨',
    color: '#FEE2E2',
  },
  {
    id: '3',
    title: 'Mind & Purpose',
    category: 'Olah Ruh',
    lastMessage: 'Insight terbesar kalian dari event ...',
    time: '13:30',
    joined: false,
    memberCount: 52,
    emoji: '🧠',
    color: '#F3E8FF',
  },
  {
    id: '4',
    title: 'Networking Circle',
    category: 'Olah Relasi',
    lastMessage: 'Ada yang dari Telkom regional?',
    time: '12:15',
    joined: true,
    memberCount: 120,
    unreadCount: 8,
    emoji: '🤝',
    color: '#FEF3C7',
  },
  {
    id: '5',
    title: 'AI in Action',
    category: 'GenAI & ML Discussion',
    lastMessage: 'Use case AI apa yang paling im...',
    time: '11:50',
    joined: true,
    memberCount: 95,
    unreadCount: 2,
    emoji: '🤖',
    color: '#E0F2FE',
  },
  {
    id: '6',
    title: 'Data Talks',
    category: 'Data Engineering & Analytics',
    lastMessage: 'Masalah terbesar di data kalian a...',
    time: '10:30',
    joined: false,
    memberCount: 78,
    emoji: '📊',
    color: '#DCFCE7',
  },
];

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
        data={CHANNELS}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={() => (
          <View style={styles.infoBox}>
            <MessageCircle size={20} color="#7C3AED" style={styles.infoIcon} />
            <Text style={styles.infoText}>
              Ruang diskusi berbasis minat. Join channel untuk mulai berpartisipasi!
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
