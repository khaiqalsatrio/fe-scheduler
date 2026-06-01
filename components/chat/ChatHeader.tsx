import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, TextInput } from 'react-native';
import { ChevronLeft, X, User, Users, Search, MoreVertical } from 'lucide-react-native';

interface ChatHeaderProps {
  isSearchingInside: boolean;
  localSearchQuery: string;
  setLocalSearchQuery: (text: string) => void;
  setIsSearchingInside: (val: boolean) => void;
  onBack: () => void;
  onHeaderInfoPress: () => void;
  chatType: string;
  memberCount: number;
  name: string;
  onSearchPress: () => void;
  onMenuPress: () => void;
}

export function ChatHeader({
  isSearchingInside,
  localSearchQuery,
  setLocalSearchQuery,
  setIsSearchingInside,
  onBack,
  onHeaderInfoPress,
  chatType,
  memberCount,
  name,
  onSearchPress,
  onMenuPress
}: ChatHeaderProps) {
  if (isSearchingInside) {
    return (
      <View style={styles.searchHeaderInside}>
        <TouchableOpacity onPress={() => { setIsSearchingInside(false); setLocalSearchQuery(''); }} style={styles.backButton}>
          <ChevronLeft color="#555" size={24} />
        </TouchableOpacity>
        <TextInput
          autoFocus
          placeholder="Cari dalam chat..."
          style={styles.searchInputInside}
          value={localSearchQuery}
          onChangeText={setLocalSearchQuery}
        />
        {localSearchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setLocalSearchQuery('')}>
            <X color="#999" size={20} />
          </TouchableOpacity>
        )}
      </View>
    );
  }

  return (
    <>
      <TouchableOpacity onPress={onBack} style={styles.backButton}>
        <ChevronLeft color="#22C55E" size={28} />
      </TouchableOpacity>
      <TouchableOpacity 
        style={styles.headerInfo} 
        disabled={chatType !== 'group' && chatType !== 'channel'} 
        onPress={onHeaderInfoPress}
      >
        <View style={[styles.headerAvatar, (chatType === 'group' || chatType === 'channel') && { backgroundColor: '#E0EEFF' }]}>
          {(chatType === 'group' || chatType === 'channel') ? <Users color="#3B82F6" size={22} /> : <User color="#999" size={22} />}
        </View>
        <View style={styles.headerTextContainer}>
          <Text style={styles.headerTitle} numberOfLines={1}>{name || 'Chat'}</Text>
          <Text style={styles.headerSubtitle}>{(chatType === 'group' || chatType === 'channel') ? `${memberCount} Anggota` : 'Last seen recently'}</Text>
        </View>
      </TouchableOpacity>
      <View style={styles.headerActions}>
        <TouchableOpacity style={styles.headerButton} onPress={onSearchPress}>
          <Search color="#555" size={22} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.headerButton} onPress={onMenuPress}>
          <MoreVertical color="#555" size={22} />
        </TouchableOpacity>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  headerInfo: { flex: 1, flexDirection: 'row', alignItems: 'center', marginLeft: 5 },
  headerAvatar: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#E1E1E1', justifyContent: 'center', alignItems: 'center', marginRight: 10 },
  headerTextContainer: { flex: 1 },
  headerTitle: { fontSize: 17, fontWeight: '700', color: '#000' },
  headerSubtitle: { fontSize: 12, color: '#666' },
  headerActions: { flexDirection: 'row', alignItems: 'center' },
  headerButton: { padding: 8 },
  backButton: { padding: 4 },
  searchHeaderInside: { flex: 1, flexDirection: 'row', alignItems: 'center', paddingRight: 10 },
  searchInputInside: { flex: 1, height: 40, fontSize: 16, color: '#333', marginLeft: 5 },
});
