import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, FlatList, TouchableOpacity, Image, SafeAreaView, Platform, StatusBar, ActivityIndicator, Alert, TextInput } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ChevronLeft, Pencil, Users, User, LogOut, Search, Link as LinkIcon, Plus } from 'lucide-react-native';
import { ChatService } from '../../services/chatService';

export default function GroupDetailScreen() {
  const { id, title } = useLocalSearchParams();
  const router = useRouter();
  
  const [members, setMembers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [groupName, setGroupName] = useState(title as string);
  const [isEditingName, setIsEditingName] = useState(false);
  const [newName, setNewName] = useState(title as string);

  useEffect(() => {
    fetchMembers();
  }, [id]);

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

  const handleLeaveGroup = () => {
    Alert.alert(
      'Keluar Grup',
      'Apakah Anda yakin ingin keluar dari grup ini?',
      [
        { text: 'Batal', style: 'cancel' },
        { 
          text: 'Keluar', 
          style: 'destructive', 
          onPress: async () => {
            try {
              await ChatService.removeMember(id as string, 'me'); 
              router.replace('/(tabs)/chats');
            } catch (error) {
              Alert.alert('Error', 'Gagal keluar grup.');
            }
          }
        }
      ]
    );
  };

  const renderMember = ({ item, index }: { item: any, index: number }) => {
    // Determine if this is the last member item in the card
    const isLast = index === members.length - 1;
    return (
      <View style={[
        styles.memberItem, 
        isLast && styles.lastMemberItem
      ]}>
        <View style={styles.memberAvatar}>
          {item.user?.avatar_url ? (
            <Image source={{ uri: item.user.avatar_url }} style={styles.avatarImg} />
          ) : (
            <User color="#999" size={24} />
          )}
        </View>
        <View style={styles.memberInfo}>
          <Text style={styles.memberName} numberOfLines={1}>
            {item.user?.name || 'User'} {item.userId === 'me' && '(Anda)'}
          </Text>
          <Text style={styles.memberBio} numberOfLines={1}>
            {item.user?.bio || 'Haii, saya menggunakan ChatAja!'}
          </Text>
        </View>
        {item.role === 'admin' && (
          <View style={styles.adminBadge}>
            <Text style={styles.adminText}>Admin</Text>
          </View>
        )}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      
      {/* Custom Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ChevronLeft color="#00A884" size={28} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Info grup</Text>
      </View>

      <FlatList
        data={members}
        keyExtractor={(item) => item.id}
        renderItem={renderMember}
        ListHeaderComponent={() => (
          <>
            <View style={styles.profileSection}>
              <View style={styles.avatarWrapper}>
                <View style={styles.largeAvatar}>
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
                    <Text style={styles.groupNameText}>{groupName}</Text>
                    <TouchableOpacity onPress={() => setIsEditingName(true)}>
                      <Pencil color="#00A884" size={18} style={{ marginLeft: 10 }} />
                    </TouchableOpacity>
                  </View>
                )}
                <Text style={styles.memberSubtitle}>Grup · {members.length} Anggota</Text>
              </View>
            </View>

            <View style={styles.membersHeader}>
              <Text style={styles.membersCount}>{members.length} anggota</Text>
              <TouchableOpacity style={styles.searchCircleBtn}>
                <Search color="#00A884" size={18} />
              </TouchableOpacity>
            </View>

            <View style={styles.mainCard}>
              <TouchableOpacity style={styles.addMemberRow}>
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
            <TouchableOpacity style={styles.leaveRow} onPress={handleLeaveGroup}>
              <LogOut color="#FF3B30" size={22} />
              <Text style={styles.leaveText}>Keluar grup</Text>
            </TouchableOpacity>
            <View style={{ height: 50 }} />
          </View>
        )}
        refreshing={isLoading}
        onRefresh={fetchMembers}
        contentContainerStyle={styles.listContent}
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    height: 60,
    backgroundColor: '#FFF',
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
});
