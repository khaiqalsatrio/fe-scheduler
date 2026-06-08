import { useState, useEffect, useMemo, useCallback } from 'react';
import { Alert } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { ChatService } from '../services/chatService';
import { AuthService } from '../services/authService';

export function useGroupDetail(id: string, initialTitle: string, type: string) {
  const router = useRouter();
  
  const [members, setMembers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [groupName, setGroupName] = useState(initialTitle);
  const [isEditingName, setIsEditingName] = useState(false);
  const [newName, setNewName] = useState(initialTitle);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [isAdminUser, setIsAdminUser] = useState(false);

  // --- Search States ---
  const [isSearching, setIsSearching] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // --- Modal States ---
  const [isLeaveModalVisible, setIsLeaveModalVisible] = useState(false);
  const [isRemoveModalVisible, setIsRemoveModalVisible] = useState(false);
  const [memberToRemove, setMemberToRemove] = useState<{id: string, name: string} | null>(null);

  useFocusEffect(
    useCallback(() => {
      const init = async () => {
        const user = await AuthService.getCurrentUser();
        setCurrentUser(user);
        fetchMembers();
      };
      if (id) {
        init();
      }
    }, [id])
  );

  useEffect(() => {
    if (currentUser && members.length > 0) {
      const me = members.find(m => m.userId === currentUser.id);
      setIsAdminUser(me?.role === 'admin');
    }
  }, [currentUser, members]);

  const fetchMembers = async () => {
    setIsLoading(true);
    try {
      const data = await ChatService.getGroupMembers(id);
      setMembers(data);
    } catch (error) {
      console.error('Fetch members error:', error);
      Alert.alert('Error', 'Gagal mengambil daftar anggota.');
    } finally {
      setIsLoading(false);
    }
  };

  const filteredMembers = useMemo(() => {
    if (!searchQuery.trim()) return members;
    return members.filter(m => 
      m.user?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.user?.bio?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [members, searchQuery]);

  const handleUpdateName = async () => {
    if (!newName.trim()) return;
    try {
      await ChatService.updateGroupInfo(id, { title: newName });
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
      await ChatService.removeMember(id, memberToRemove.id);
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
      await ChatService.removeMember(id, currentUser.id); 
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

  return {
    members,
    filteredMembers,
    isLoading,
    groupName,
    isEditingName,
    setIsEditingName,
    newName,
    setNewName,
    currentUser,
    isAdminUser,
    isSearching,
    setIsSearching,
    searchQuery,
    setSearchQuery,
    isLeaveModalVisible,
    setIsLeaveModalVisible,
    isRemoveModalVisible,
    setIsRemoveModalVisible,
    memberToRemove,
    setMemberToRemove,
    fetchMembers,
    handleUpdateName,
    handleRemoveMember,
    confirmRemoveMember,
    handleLeaveGroup,
    confirmLeaveGroup,
    handleMemberClick,
  };
}
