import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, TextInput } from 'react-native';
import { ChevronLeft, X, User, Users, Search, MoreVertical } from 'lucide-react-native';
import { useTheme } from '../../context/ThemeContext';

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
  const { isDarkMode } = useTheme();

  if (isSearchingInside) {
    return (
      <View style={[styles.searchHeaderInside, isDarkMode && styles.searchHeaderInsideDark]}>
        <TouchableOpacity onPress={() => { setIsSearchingInside(false); setLocalSearchQuery(''); }} style={styles.backButton}>
          <ChevronLeft color={isDarkMode ? "#FFF" : "#555"} size={24} />
        </TouchableOpacity>
        <TextInput
          autoFocus
          placeholder="Cari dalam chat..."
          placeholderTextColor={isDarkMode ? "#AAA" : "#999"}
          style={[styles.searchInputInside, isDarkMode && styles.textDark]}
          value={localSearchQuery}
          onChangeText={setLocalSearchQuery}
        />
        {localSearchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setLocalSearchQuery('')}>
            <X color={isDarkMode ? "#FFF" : "#999"} size={20} />
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
        onPress={onHeaderInfoPress}
      >
        <View style={[styles.headerAvatar, isDarkMode && styles.headerAvatarDark, (chatType === 'group' || chatType === 'channel') && { backgroundColor: isDarkMode ? '#1E3A8A' : '#E0EEFF' }]}>
          {(chatType === 'group' || chatType === 'channel') ? <Users color="#3B82F6" size={22} /> : <User color={isDarkMode ? "#CCC" : "#999"} size={22} />}
        </View>
        <View style={styles.headerTextContainer}>
          <Text style={[styles.headerTitle, isDarkMode && styles.textDark]} numberOfLines={1}>{name || 'Chat'}</Text>
          <Text style={[styles.headerSubtitle, isDarkMode && styles.textGrayDark]}>{(chatType === 'group' || chatType === 'channel') ? `${memberCount} Anggota` : 'Last seen recently'}</Text>
        </View>
      </TouchableOpacity>
      <View style={styles.headerActions}>
        <TouchableOpacity style={styles.headerButton} onPress={onSearchPress}>
          <Search color={isDarkMode ? "#FFF" : "#555"} size={22} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.headerButton} onPress={onMenuPress}>
          <MoreVertical color={isDarkMode ? "#FFF" : "#555"} size={22} />
        </TouchableOpacity>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  headerInfo: { flex: 1, flexDirection: 'row', alignItems: 'center', marginLeft: 5 },
  headerAvatar: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#E1E1E1', justifyContent: 'center', alignItems: 'center', marginRight: 10 },
  headerAvatarDark: { backgroundColor: '#333' },
  headerTextContainer: { flex: 1 },
  headerTitle: { fontSize: 17, fontWeight: '700', color: '#000' },
  headerSubtitle: { fontSize: 12, color: '#666' },
  headerActions: { flexDirection: 'row', alignItems: 'center' },
  headerButton: { padding: 8 },
  backButton: { padding: 4 },
  searchHeaderInside: { flex: 1, flexDirection: 'row', alignItems: 'center', paddingRight: 10 },
  searchHeaderInsideDark: { backgroundColor: '#1E1E1E' },
  searchInputInside: { flex: 1, height: 40, fontSize: 16, color: '#333', marginLeft: 5 },
  textDark: { color: '#FFF' },
  textGrayDark: { color: '#AAA' },
});
