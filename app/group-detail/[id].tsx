import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, FlatList, TouchableOpacity, Image, SafeAreaView, Platform, StatusBar, ActivityIndicator, Alert, TextInput } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ChevronLeft, Pencil, Users, User, LogOut, Search, Link as LinkIcon, Plus, X, Trash2 } from 'lucide-react-native';
import { ChatService } from '../../services/chatService';
import { AuthService } from '../../services/authService';
import { ConfirmModal } from '../../components/ConfirmModal';
import { useTheme } from '../../context/ThemeContext';

export default function GroupDetailScreen() {
  const { id, title, type } = useLocalSearchParams();
  const router = useRouter();
  const { isDarkMode } = useTheme();
  
  const [members, setMembers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [groupName, setGroupName] = useState(title as string);
  const [isEditingName, setIsEditingName] = useState(false);
  const [newName, setNewName] = useState(title as string);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [isAdminUser, setIsAdminUser] = useState(false);

  // --- Search States ---
  const [isSearching, setIsSearching] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // --- Modal States ---
  const [isLeaveModalVisible, setIsLeaveModalVisible] = useState(false);
  const [isRemoveModalVisible, setIsRemoveModalVisible] = useState(false);
  const [memberToRemove, setMemberToRemove] = useState<{id: string, name: string} | null>(null);

  useEffect(() => {
    const init = async () => {
      const user = await AuthService.getCurrentUser();
      setCurrentUser(user);
      fetchMembers();
    };
    init();
  }, [id]);

  useEffect(() => {
    if (currentUser && members.length > 0) {
      const me = members.find(m => m.userId === currentUser.id);
      setIsAdminUser(me?.role === 'admin');
    }
  }, [currentUser, members]);

  const fetchMembers = async () => {
    setIsLoading(true);
    try {
      const data = await ChatService.getGroupMembers(id as string);
      setMembers(data);
    } catch (error) {
      console.error('Fetch members error:', error);
      Alert.alert('Error', 'Gagal mengambil daftar anggota.');
    } finally {
      setIsLoading(false);
    }
  };

  const filteredMembers = React.useMemo(() => {
    if (!searchQuery.trim()) return members;
    return members.filter(m => 
      m.user?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.user?.bio?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [members, searchQuery]);

  const handleUpdateName = async () => {
    if (!newName.trim()) return;
    try {
      await ChatService.updateGroupInfo(id as string, { title: newName });
      setGroupName(newName);
      setIsEditingName(false);
    } catch (error) {
      Alert.alert('Error', 'Gagal mengubah nama grup.');
    }
  };

  const handleRemoveMember = (userId: string, memberName: string) => {
    if (!isAdminUser) return;
    setMemberToRemove({ id: userId, name: memberName });
    setIsRemoveModalVisible(true);
  };

  const confirmRemoveMember = async () => {
    if (!memberToRemove) return;
    setIsRemoveModalVisible(false);
    try {
      setIsLoading(true);
      await ChatService.removeMember(id as string, memberToRemove.id);
      fetchMembers(); // Refresh list
    } catch (error) {
      Alert.alert('Error', 'Gagal menghapus anggota.');
    } finally {
      setIsLoading(false);
      setMemberToRemove(null);
    }
  };

  const handleLeaveGroup = () => {
    if (!currentUser) return;
    setIsLeaveModalVisible(true);
  };

  const confirmLeaveGroup = async () => {
    setIsLeaveModalVisible(false);
    try {
      setIsLoading(true);
      await ChatService.removeMember(id as string, currentUser.id); 
      if (type === 'channel') {
        router.replace('/(tabs)/channel' as any);
      } else {
        router.replace('/(tabs)/chats');
      }
    } catch (error) {
      Alert.alert('Error', 'Gagal keluar grup.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleMemberClick = async (item: any) => {
    if (item.userId === currentUser?.id) return;
    
    try {
      setIsLoading(true);
      const dmConversation = await ChatService.createOrGetDm(item.userId);
      router.push(`/chat/${dmConversation.id}`);
    } catch (error) {
      Alert.alert('Error', 'Gagal memulai percakapan.');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const renderMember = ({ item, index }: { item: any, index: number }) => {
    // Determine if this is the last member item in the filtered list
    const isLast = index === filteredMembers.length - 1;
    return (
      <TouchableOpacity 
        style={[
          styles.memberItem, 
          isDarkMode && styles.cardDark,
          isLast && styles.lastMemberItem
        ]}
        onPress={() => handleMemberClick(item)}
        activeOpacity={item.userId === currentUser?.id ? 1 : 0.7}
      >
        <View style={[styles.memberAvatar, isDarkMode && styles.memberAvatarDark]}>
          {item.user?.avatar_url ? (
            <Image source={{ uri: item.user.avatar_url }} style={styles.avatarImg} />
          ) : (
            <User color="#999" size={24} />
          )}
        </View>
        <View style={styles.memberInfo}>
          <Text style={[styles.memberName, isDarkMode && styles.textDark]} numberOfLines={1}>
            {item.user?.name || 'User'} {item.userId === currentUser?.id && '(Anda)'}
          </Text>
          <Text style={[styles.memberBio, isDarkMode && styles.textGrayDark]} numberOfLines={1}>
            {item.user?.bio || 'Haii, saya menggunakan ChatAja!'}
          </Text>
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          {item.role === 'admin' && (
            <View style={styles.adminBadge}>
              <Text style={styles.adminText}>Admin</Text>
            </View>
          )}
          {isAdminUser && item.userId !== currentUser?.id && (
            <TouchableOpacity 
              onPress={() => handleRemoveMember(item.userId, item.user?.name || 'Anggota')}
              style={styles.removeIconBtn}
            >
              <Trash2 color="#FF3B30" size={18} />
            </TouchableOpacity>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={[styles.container, isDarkMode && styles.containerDark]}>
      <StatusBar barStyle={isDarkMode ? "light-content" : "dark-content"} />
      
      {/* Custom Header */}
      <View style={[styles.header, isDarkMode && styles.headerDark]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ChevronLeft color="#00A884" size={28} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, isDarkMode && styles.textDark]}>{type === 'channel' ? 'Info Channel' : 'Info Grup'}</Text>
      </View>

      <FlatList
        data={filteredMembers}
        keyExtractor={(item) => item.id}
        renderItem={renderMember}
        ListHeaderComponent={() => (
          <>
            <View style={[styles.profileSection, isDarkMode && styles.cardDark]}>
              <View style={styles.avatarWrapper}>
                <View style={[styles.largeAvatar, isDarkMode && styles.largeAvatarDark]}>
                  <Users color="#3B82F6" size={80} />
                </View>
              </View>

              <View style={styles.nameSection}>
                {isEditingName ? (
                  <View style={styles.editNameRow}>
                    <TextInput
                      style={styles.nameInput}
                      value={newName}
                      onChangeText={setNewName}
                      autoFocus
                    />
                    <TouchableOpacity onPress={handleUpdateName} style={styles.saveBtn}>
                      <Text style={styles.saveBtnText}>Simpan</Text>
                    </TouchableOpacity>
                  </View>
                ) : (
                  <View style={styles.nameRow}>
                    <Text style={[styles.groupNameText, isDarkMode && styles.textDark]}>{groupName}</Text>
                    <TouchableOpacity onPress={() => setIsEditingName(true)}>
                      <Pencil color="#00A884" size={18} style={{ marginLeft: 10 }} />
                    </TouchableOpacity>
                  </View>
                )}
                <Text style={[styles.memberSubtitle, isDarkMode && styles.textGrayDark]}>{type === 'channel' ? 'Channel' : 'Grup'} · {members.length} Anggota</Text>
              </View>
            </View>

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
                  <Text style={[styles.membersCount, isDarkMode && styles.textDark]}>{members.length} anggota</Text>
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
              filteredMembers.length === 0 && { borderBottomLeftRadius: 20, borderBottomRightRadius: 20, borderBottomWidth: 0 }
            ]}>
              <TouchableOpacity style={[styles.addMemberRow, isDarkMode && styles.cardDark]}>
                <View style={styles.actionIconCircle}>
                  <Plus color="#FFF" size={22} />
                </View>
                <Text style={styles.actionText}>Tambah anggota</Text>
              </TouchableOpacity>
            </View>
          </>
        )}
        ListFooterComponent={() => (
          <View style={styles.footer}>
            <TouchableOpacity style={[styles.leaveRow, isDarkMode && styles.cardDark]} onPress={handleLeaveGroup}>
              <LogOut color="#FF3B30" size={22} />
              <Text style={styles.leaveText}>{type === 'channel' ? 'Keluar Channel' : 'Keluar Grup'}</Text>
            </TouchableOpacity>
            <View style={{ height: 50 }} />
          </View>
        )}
        refreshing={isLoading}
        onRefresh={fetchMembers}
        contentContainerStyle={styles.listContent}
      />
      <ConfirmModal
        visible={isLeaveModalVisible}
        onClose={() => setIsLeaveModalVisible(false)}
        onConfirm={confirmLeaveGroup}
        title={type === 'channel' ? "Keluar Channel" : "Keluar Grup"}
        message={`Apakah Anda yakin ingin keluar dari ${type === 'channel' ? 'channel' : 'grup'} ini?`}
        confirmText="Keluar"
        type="destructive"
      />

      <ConfirmModal
        visible={isRemoveModalVisible}
        onClose={() => {
          setIsRemoveModalVisible(false);
          setMemberToRemove(null);
        }}
        onConfirm={confirmRemoveMember}
        title="Hapus Anggota"
        message={`Apakah Anda yakin ingin menghapus ${memberToRemove?.name} dari ${type === 'channel' ? 'channel' : 'grup'} ini?`}
        confirmText="Hapus"
        type="destructive"
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F0F2F5',
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  containerDark: {
    backgroundColor: '#121212',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    height: 60,
    backgroundColor: '#F0F2F5',
  },
  headerDark: {
    backgroundColor: '#121212',
  },
  backButton: {
    padding: 5,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 20,
    color: '#000',
  },
  profileSection: {
    backgroundColor: '#FFF',
    alignItems: 'center',
    paddingTop: 30,
    marginHorizontal: 15,
    marginTop: 15,
    borderRadius: 20,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  avatarWrapper: {
    position: 'relative',
    marginBottom: 20,
  },
  largeAvatar: {
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: '#E0EEFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  largeAvatarDark: {
    backgroundColor: '#1E3A8A',
  },
  avatarImg: {
    width: 150,
    height: 150,
    borderRadius: 75,
  },
  nameSection: {
    alignItems: 'center',
    paddingHorizontal: 20,
    width: '100%',
    paddingBottom: 20,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  editNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
  },
  nameInput: {
    flex: 1,
    fontSize: 22,
    fontWeight: '700',
    borderBottomWidth: 2,
    borderBottomColor: '#00A884',
    paddingVertical: 5,
    color: '#000',
  },
  saveBtn: {
    marginLeft: 10,
    backgroundColor: '#00A884',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 8,
  },
  saveBtnText: {
    color: '#FFF',
    fontWeight: '700',
  },
  groupNameText: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  memberSubtitle: {
    fontSize: 15,
    color: '#666',
  },
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
    elevation: 2, // Only elevation on the top or wrap everything? 
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
  inviteRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    backgroundColor: '#FFF',
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
  memberItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    backgroundColor: '#FFF',
    marginHorizontal: 15,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#F0F0F0',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  cardDark: {
    backgroundColor: '#1E1E1E',
    borderBottomColor: '#333',
  },
  lastMemberItem: {
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    borderBottomWidth: 0,
    marginBottom: 20,
  },
  memberAvatar: {
    width: 45,
    height: 45,
    borderRadius: 22.5,
    backgroundColor: '#F0F0F0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  memberAvatarDark: {
    backgroundColor: '#333',
  },
  memberInfo: {
    flex: 1,
  },
  memberName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111',
  },
  memberBio: {
    fontSize: 13,
    color: '#666',
    marginTop: 2,
  },
  adminBadge: {
    borderWidth: 1,
    borderColor: '#00A884',
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  adminText: {
    fontSize: 10,
    color: '#00A884',
    fontWeight: '700',
  },
  removeIconBtn: {
    padding: 8,
    marginLeft: 5,
  },
  footer: {
    marginTop: 10,
  },
  leaveRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    backgroundColor: '#FFF',
    marginHorizontal: 15,
    marginTop: 10,
    borderRadius: 20,
  },
  leaveText: {
    fontSize: 16,
    color: '#FF3B30',
    marginLeft: 15,
    fontWeight: '500',
  },
  listContent: {
    paddingBottom: 20,
  },
  textDark: {
    color: '#FFF',
  },
  textGrayDark: {
    color: '#AAA',
  },
});
