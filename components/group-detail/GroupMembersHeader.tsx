import React from 'react';
import { View, Text, TouchableOpacity, TextInput, StyleSheet } from 'react-native';
import { Search, X, Plus } from 'lucide-react-native';
import { useTheme } from '../../context/ThemeContext';

interface GroupMembersHeaderProps {
  membersCount: number;
  isSearching: boolean;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  setIsSearching: (searching: boolean) => void;
  hasNoMembers: boolean;
}

export function GroupMembersHeader({
  membersCount,
  isSearching,
  searchQuery,
  setSearchQuery,
  setIsSearching,
  hasNoMembers
}: GroupMembersHeaderProps) {
  const { isDarkMode } = useTheme();

  return (
    <>
      <View style={styles.membersHeader}>
        {isSearching ? (
          <View style={[styles.searchContainer, isDarkMode && styles.searchContainerDark]}>
            <TextInput
              style={[styles.searchInput, isDarkMode && styles.textDark]}
              placeholder="Cari nama anggota..."
              value={searchQuery}
              onChangeText={setSearchQuery}
              autoFocus
            />
            <TouchableOpacity onPress={() => { setIsSearching(false); setSearchQuery(''); }}>
              <X color="#666" size={20} />
            </TouchableOpacity>
          </View>
        ) : (
          <>
            <Text style={[styles.membersCount, isDarkMode && styles.textDark]}>{membersCount} anggota</Text>
            <TouchableOpacity 
              style={[styles.searchCircleBtn, isDarkMode && styles.searchCircleBtnDark]}
              onPress={() => setIsSearching(true)}
            >
              <Search color="#00A884" size={18} />
            </TouchableOpacity>
          </>
        )}
      </View>

      <View style={[
        styles.mainCard,
        isDarkMode && styles.cardDark,
        hasNoMembers && { borderBottomLeftRadius: 20, borderBottomRightRadius: 20, borderBottomWidth: 0 }
      ]}>
        <TouchableOpacity style={[styles.addMemberRow, isDarkMode && styles.cardDark]}>
          <View style={styles.actionIconCircle}>
            <Plus color="#FFF" size={22} />
          </View>
          <Text style={styles.actionText}>Tambah anggota</Text>
        </TouchableOpacity>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  membersHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginTop: 25,
    marginBottom: 10,
    width: '100%',
    minHeight: 40,
  },
  searchContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8E8E8',
    borderRadius: 20,
    paddingHorizontal: 15,
    height: 40,
  },
  searchContainerDark: {
    backgroundColor: '#333',
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: '#000',
    marginRight: 10,
  },
  membersCount: {
    fontSize: 16,
    color: '#000',
    fontWeight: '600',
  },
  searchCircleBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#E8E8E8',
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchCircleBtnDark: {
    backgroundColor: '#333',
  },
  mainCard: {
    backgroundColor: '#FFF',
    marginHorizontal: 15,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  addMemberRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    backgroundColor: '#FFF',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#F0F0F0',
  },
  cardDark: {
    backgroundColor: '#1E1E1E',
    borderBottomColor: '#333',
  },
  actionIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#00A884',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  actionText: {
    fontSize: 16,
    color: '#00A884',
    fontWeight: '600',
  },
  textDark: {
    color: '#FFF',
  },
});
