import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, SafeAreaView, TouchableOpacity, TextInput, FlatList, Platform, StatusBar, ActivityIndicator, Image, ScrollView, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { ChevronLeft, Search, User, Users, UserPlus, X, CheckCircle2 } from 'lucide-react-native';
import ChatService from '../services/chatService';
import { useTheme } from '../context/ThemeContext';

type UserData = {
  id: string;
  name: string;
  username: string;
  avatar: string | null;
  position: string | null;
  nik: string | null;
  instansi?: string; // Menambahkan instansi untuk mock
  tag?: string; // Menambahkan tag untuk mock (Speaker/Mentor)
};

export default function NewChatScreen() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [categories, setCategories] = useState<string[]>(['Semua']);
  const [selectedCategory, setSelectedCategory] = useState('Semua');
  const [users, setUsers] = useState<UserData[]>([]);
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isCreatingChat, setIsCreatingChat] = useState(false);
  const { isDarkMode } = useTheme();

  useEffect(() => {
    // Debounce pencarian untuk optimalisasi (500ms)
    const delayDebounceFn = setTimeout(() => {
      fetchUsers();
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const data = await ChatService.searchUsers(searchQuery);
      
      // Menggunakan data dari /users, fallback ke mock jika null untuk estetika UI
      const enhancedData = data.map((item: any, index: number) => ({
        ...item,
        instansi: item.company || (index % 3 === 0 ? 'Telkom' : index % 3 === 1 ? 'Bukalapak' : 'Shopee'),
        tag: index === 0 ? 'Speaker' : index === 2 ? 'Mentor' : index === 4 || index === 8 ? 'Speaker' : null
      }));
      
      setUsers(enhancedData);

      // EXTRACTION: Ambil kategori unik dari position dan tags
      const roles = enhancedData.map((u: any) => u.position).filter(Boolean);
      const tags = enhancedData.map((u: any) => u.tag).filter(Boolean);
      const allPossible = Array.from(new Set(['Semua', ...tags, ...roles]));
      
      setCategories(allPossible);
    } catch (error) {
      console.warn('Error fetching users:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleSelectUser = (userId: string) => {
    setSelectedUserIds(prev => {
      if (prev.includes(userId)) {
        return prev.filter(id => id !== userId);
      } else {
        return [...prev, userId];
      }
    });
  };

  const handleStartChat = async () => {
    if (selectedUserIds.length === 0) return;
    
    if (selectedUserIds.length === 1) {
      // Single Chat (DM)
      setIsCreatingChat(true);
      try {
        const data = await ChatService.createConversation('dm', null, selectedUserIds[0]);
        const selectedUser = users.find(u => u.id === selectedUserIds[0]);
        router.push({
          pathname: '/chat/[id]',
          params: { id: data.id, name: selectedUser?.name || 'Chat' }
        });
      } catch (error: any) {
        console.warn('Error starting DM:', error);
        const errorMessage = error.response?.data?.message;
        const alertMessage = Array.isArray(errorMessage) ? errorMessage.join('\\n') : (typeof errorMessage === 'string' ? errorMessage : 'Gagal memulai chat');
        Alert.alert('Gagal', alertMessage);
      } finally {
        setIsCreatingChat(false);
      }
    } else {
      // Group Chat Diskusi - Navigate to create group screen
      const selectedParticipants = users.filter(u => selectedUserIds.includes(u.id));
        
      router.push({
        pathname: '/create-group',
        params: { 
          participantData: JSON.stringify(selectedParticipants)
        }
      });
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name?.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          user.position?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'Semua' || 
                            (selectedCategory === 'Speaker' && user.tag === 'Speaker') ||
                            (selectedCategory === 'Mentor' && user.tag === 'Mentor') ||
                            (user.position?.toLowerCase().includes(selectedCategory.toLowerCase()));
    
    return matchesSearch && matchesCategory;
  });

  const renderCategoryChips = () => (
    <View style={styles.chipsWrapper}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipsContent}>
        {categories.map((cat) => (
          <TouchableOpacity 
            key={cat} 
            onPress={() => setSelectedCategory(cat)}
            style={[styles.chip, isDarkMode && styles.chipDark, selectedCategory === cat && styles.chipActive]}
          >
            <Text style={[styles.chipText, isDarkMode && styles.textGrayDark, selectedCategory === cat && styles.chipTextActive]}>
              {cat}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );


  return (
    <SafeAreaView style={[styles.safeArea, isDarkMode && styles.safeAreaDark]}>
      <StatusBar barStyle={isDarkMode ? "light-content" : "dark-content"} />
      <View style={styles.container}>
        {/* HEADER */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <ChevronLeft color={isDarkMode ? "#FFF" : "#000"} size={26} />
          </TouchableOpacity>
          <View style={styles.headerTextContainer}>
            <Text style={[styles.headerTitle, isDarkMode && styles.textDark]}>Cari Koneksi</Text>
            <Text style={[styles.headerSubtitle, isDarkMode && styles.textGrayDark]}>Bangun koneksi baru, kembangkan jaringanmu</Text>
          </View>
        </View>

        {/* SEARCH BAR */}
        <View style={styles.searchContainer}>
          <View style={[styles.searchInputContainer, isDarkMode && styles.searchInputContainerDark]}>
            <Search color="#9EA5B1" size={20} />
            <TextInput 
              placeholder="Cari nama, role, atau instansi" 
              style={[styles.searchInput, isDarkMode && styles.textDark]} 
              placeholderTextColor="#9EA5B1" 
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>
        </View>

        {/* CATEGORY CHIPS */}
        {renderCategoryChips()}

        {/* SELECTED USERS CHIPS (NEW) */}
        {selectedUserIds.length > 0 && (
          <View style={[styles.selectedContainer, isDarkMode && styles.selectedContainerDark]}>
            <Text style={[styles.selectedStatusText, isDarkMode && styles.textGrayDark]}>{selectedUserIds.length} dipilih</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.selectedChipsScroll}>
              {selectedUserIds.map(id => {
                const user = users.find(u => u.id === id);
                if (!user) return null;
                return (
                  <View key={id} style={[styles.selectedPersonChip, isDarkMode && styles.selectedPersonChipDark]}>
                    <Text style={[styles.selectedPersonName, isDarkMode && styles.textDark]}>
                      {user.name.split(' ')[0]}
                    </Text>
                    <TouchableOpacity onPress={() => toggleSelectUser(id)} style={styles.removeChipButton}>
                      <X color="#9EA5B1" size={14} />
                    </TouchableOpacity>
                  </View>
                );
              })}
            </ScrollView>
          </View>
        )}

        {/* CONTACT LIST */}
        {isLoading ? (
          <View style={styles.centerContainer}>
            <ActivityIndicator size="large" color="#27AE60" />
          </View>
        ) : (
          <FlatList
            data={filteredUsers}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => {
              const isSelected = selectedUserIds.includes(item.id);
              return (
                <TouchableOpacity 
                  style={[styles.userItem, isDarkMode && styles.userItemDark, isSelected && [styles.userItemSelected, isDarkMode && styles.userItemSelectedDark]]} 
                  onPress={() => toggleSelectUser(item.id)}
                  activeOpacity={0.7}
                >
                  <View style={styles.avatarWrapper}>
                    {item.avatar ? (
                      <Image source={{ uri: item.avatar }} style={styles.avatarImage} />
                    ) : (
                      <View style={[styles.avatarPlaceholder, isDarkMode && styles.avatarPlaceholderDark]}>
                        <User color="#BCC1C9" size={24} />
                      </View>
                    )}
                    {isSelected && (
                      <View style={[styles.checkBadge, isDarkMode && { backgroundColor: '#1E1E1E' }]}>
                        <CheckCircle2 color={isDarkMode ? "#1E1E1E" : "#FFF"} size={14} fill="#27AE60" />
                      </View>
                    )}
                  </View>
                  <View style={styles.userInfo}>
                    <View style={styles.nameRow}>
                      <Text style={[styles.userName, isDarkMode && styles.textDark]} numberOfLines={1}>{item.name}</Text>
                      {item.tag && (
                        <View style={styles.badge}>
                          <Text style={styles.badgeText}>{item.tag}</Text>
                        </View>
                      )}
                    </View>
                    <Text style={styles.userSubInfo} numberOfLines={1}>
                      {item.position || 'Member'} <Text style={styles.bullet}>·</Text> {item.instansi || 'Telkom'}
                    </Text>
                  </View>
                </TouchableOpacity>
              );
            }}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={
              <View style={styles.centerContainer}>
                <Text style={styles.emptyText}>Tidak ada koneksi ditemukan</Text>
              </View>
            }
          />
        )}

        {/* FOOTER BUTTON */}
        <View style={[styles.footer, isDarkMode && styles.footerDark]}>
          <TouchableOpacity 
            style={[styles.mainChatButton, selectedUserIds.length === 0 && [styles.chatButtonDisabled, isDarkMode && styles.chatButtonDisabledDark]]}
            disabled={selectedUserIds.length === 0 || isCreatingChat}
            onPress={handleStartChat}
            activeOpacity={0.8}
          >
            {isCreatingChat ? (
              <ActivityIndicator color="#FFF" />
            ) : (
              <Text style={styles.mainChatButtonText}>
                {selectedUserIds.length > 1 ? 'Buat Grup Diskusi' : 'Mulai Chat'}
              </Text>
            )}
          </TouchableOpacity>
          <Text style={styles.footerInstruction}>Pilih peserta untuk mulai koneksi</Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFF',
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  safeAreaDark: {
    backgroundColor: '#121212',
  },
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 15,
    alignItems: 'center',
  },
  backButton: {
    marginRight: 15,
  },
  headerTextContainer: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#000',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 13,
    color: '#9EA5B1',
    fontWeight: '500',
  },
  divider: {
    height: 1.5,
    backgroundColor: '#F3F4F6',
  },
  dividerDark: {
    backgroundColor: '#333',
  },
  selectedContainer: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: '#FAFAFA',
  },
  selectedContainerDark: {
    backgroundColor: '#1E1E1E',
  },
  selectedStatusText: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '600',
    marginBottom: 8,
  },
  selectedChipsScroll: {
    flexDirection: 'row',
  },
  selectedPersonChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 8,
  },
  selectedPersonChipDark: {
    backgroundColor: '#333',
    borderColor: '#444',
  },
  selectedPersonName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111',
    marginRight: 6,
  },
  removeChipButton: {
    padding: 2,
  },
  searchContainer: {
    paddingHorizontal: 20,
    paddingVertical: 12, // Dikurangi agar lebih rapat
    marginBottom: 0,     // Dihilangkan agar garis bawah naik
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    borderRadius: 24,
    paddingHorizontal: 16,
    height: 48,
  },
  searchInputContainerDark: {
    backgroundColor: '#1E1E1E',
  },
  searchInput: {
    flex: 1,
    marginLeft: 10,
    fontSize: 15,
    color: '#333',
    fontWeight: '500',
  },
  chipsWrapper: {
    marginBottom: 15,
  },
  chipsContent: {
    paddingHorizontal: 20,
    paddingVertical: 4,
  },
  chip: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 18,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 10,
  },
  chipDark: {
    backgroundColor: '#1E1E1E',
  },
  chipActive: {
    backgroundColor: '#27AE60',
  },
  chipText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#6B7280',
  },
  chipTextActive: {
    color: '#FFF',
  },
  listContent: {
    paddingBottom: 150,
  },
  userItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
    backgroundColor: '#FFF',
  },
  userItemDark: {
    backgroundColor: '#121212',
  },
  userItemSelected: {
    backgroundColor: '#F0F9F1',
  },
  userItemSelectedDark: {
    backgroundColor: '#1B2C21',
  },
  avatarWrapper: {
    marginRight: 16,
  },
  checkBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    zIndex: 10,
    backgroundColor: '#FFF',
    borderRadius: 7,
  },
  avatarImage: {
    width: 52,
    height: 52,
    borderRadius: 26,
  },
  avatarPlaceholder: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarPlaceholderDark: {
    backgroundColor: '#333',
  },
  userInfo: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  userName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111',
    marginRight: 8,
  },
  badge: {
    backgroundColor: 'rgba(124, 58, 237, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#7C3AED',
  },
  userSubInfo: {
    fontSize: 14,
    color: '#9EA5B1',
    fontWeight: '500',
  },
  bullet: {
    fontSize: 18,
    color: '#27AE60',
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFF',
    paddingHorizontal: 20,
    paddingTop: 15,
    paddingBottom: Platform.OS === 'ios' ? 30 : 20,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    alignItems: 'center',
  },
  footerDark: {
    backgroundColor: '#121212',
    borderTopColor: '#333',
  },
  mainChatButton: {
    width: '100%',
    height: 54,
    borderRadius: 27,
    backgroundColor: '#27AE60',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    elevation: 4,
    shadowColor: '#27AE60',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  chatButtonDisabled: {
    backgroundColor: '#D1D5DB',
    shadowOpacity: 0,
    elevation: 0,
  },
  chatButtonDisabledDark: {
    backgroundColor: '#444',
  },
  mainChatButtonText: {
    color: '#FFF',
    fontSize: 17,
    fontWeight: '800',
  },
  footerInstruction: {
    fontSize: 12,
    color: '#9EA5B1',
    fontWeight: '600',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 60,
  },
  emptyText: {
    color: '#9EA5B1',
    fontSize: 15,
    fontWeight: '500',
  },
  textDark: {
    color: '#FFF',
  },
  textGrayDark: {
    color: '#AAA',
  },
});
