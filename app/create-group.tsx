import React, { useState, useMemo } from 'react';
import { StyleSheet, View, Text, SafeAreaView, TouchableOpacity, TextInput, ScrollView, Platform, StatusBar, ActivityIndicator, Alert, Image } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { ArrowLeft, Users, Camera, User, CheckCircle2, Circle } from 'lucide-react-native';
import ChatService from '../services/chatService';
import { useChatsList } from '../hooks/useChatsList';
import { useTheme } from '../context/ThemeContext';

export default function CreateGroupScreen() {
  const router = useRouter();
  const { isDarkMode } = useTheme();
  const { participantData } = useLocalSearchParams<{ participantData: string }>();
  const [groupTitle, setGroupTitle] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  const { chats, fetchChatsFromBE } = useChatsList();
  const [selectedMemberIds, setSelectedMemberIds] = useState<string[]>([]);

  React.useEffect(() => {
    fetchChatsFromBE();
  }, [fetchChatsFromBE]);

  // Parse partisipan dari JSON (Dari new-chat.tsx jika ada)
  const initialParticipants = useMemo(() => {
    try {
      return participantData ? JSON.parse(participantData) : [];
    } catch (e) {
      console.error('Error parsing participantData:', e);
      return [];
    }
  }, [participantData]);

  // Initialize selected members from initialParticipants
  React.useEffect(() => {
    if (initialParticipants.length > 0 && selectedMemberIds.length === 0) {
      setSelectedMemberIds(initialParticipants.map((p: any) => p.id));
    }
  }, [initialParticipants]);

  // Combine initial participants with chats to show all available individual contacts
  const availableMembers = useMemo(() => {
    const uniqueMembers = new Map<string, any>();

    // Add any from initialParticipants first
    initialParticipants.forEach((p: any) => {
      if (p.id) {
        uniqueMembers.set(p.id, {
          id: p.id,
          name: p.name,
          avatar: p.avatar,
          position: p.position || 'Member',
          instansi: p.instansi || 'Telkom'
        });
      }
    });

    // Add from chats if not already present
    chats.forEach(c => {
      if (!c.isGroup && c.recipientId && !uniqueMembers.has(c.recipientId)) {
        uniqueMembers.set(c.recipientId, {
          id: c.recipientId,
          name: c.name,
          avatar: c.avatar,
          position: 'Member',
          instansi: 'Telkom'
        });
      }
    });
    
    return Array.from(uniqueMembers.values());
  }, [chats, initialParticipants]);

  const toggleSelectMember = (id: string) => {
    setSelectedMemberIds(prev => 
      prev.includes(id) ? prev.filter(mId => mId !== id) : [...prev, id]
    );
  };

  const handleCreateGroup = async () => {
    if (!groupTitle.trim() || selectedMemberIds.length === 0) {
      Alert.alert('Perhatian', 'Nama grup dan minimal 1 anggota harus diisi');
      return;
    }

    setIsCreating(true);
    try {
      const participantIds = selectedMemberIds.join(',');
      const data = await ChatService.createConversation('group', groupTitle.trim(), participantIds);

      if (data.id) {
        router.push({
          pathname: '/chat/[id]',
          params: { id: data.id, name: groupTitle.trim() }
        });
      } else {
        Alert.alert('Gagal', 'Gagal membuat grup');
      }
    } catch (error: any) {
      console.error('Error creating group:', error);
      const msg = error.response?.data?.message || 'Terjadi kesalahan saat membuat grup';
      Alert.alert('Error', msg);
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <SafeAreaView style={[styles.safeArea, isDarkMode && styles.safeAreaDark]}>
      <StatusBar barStyle={isDarkMode ? "light-content" : "dark-content"} backgroundColor={isDarkMode ? "#121212" : "#F8F9FA"} />
      <View style={[styles.container, isDarkMode && styles.containerDark]}>
        <View style={[styles.header, isDarkMode && styles.headerDark]}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <ArrowLeft color="#27AE60" size={24} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, isDarkMode && styles.textDark]}>Buat Grup</Text>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* GROUP AVATAR SECTION */}
          <View style={styles.avatarSection}>
            <View style={styles.avatarWrapper}>
              <View style={[styles.groupAvatarCircle, isDarkMode && styles.groupAvatarCircleDark]}>
                <Users color="#27AE60" size={44} />
              </View>
              <View style={[styles.cameraBadge, isDarkMode && styles.cameraBadgeDark]}>
                <Camera color="#FFF" size={14} />
              </View>
            </View>
            <Text style={styles.addPhotoText}>TAMBAHKAN FOTO</Text>
          </View>

          {/* INPUT NAME SECTION */}
          <View style={styles.inputSection}>
            <Text style={[styles.inputLabel, isDarkMode && styles.textGrayDark]}>Nama Grup</Text>
            <View style={[styles.textInputContainer, isDarkMode && styles.textInputContainerDark]}>
              <TextInput
                style={[styles.textInput, isDarkMode && styles.textDark]}
                placeholder="Nama grup"
                placeholderTextColor="#9EA5B1"
                value={groupTitle}
                onChangeText={setGroupTitle}
              />
            </View>
          </View>

          {/* MEMBERS LIST SECTION */}
          <View style={styles.membersSection}>
            <View style={styles.membersHeader}>
              <Text style={[styles.membersLabel, isDarkMode && styles.textDark]}>Pilih Anggota ({selectedMemberIds.length})</Text>
              <TouchableOpacity>
                <Text style={styles.seeAllText}>LIHAT SEMUA</Text>
              </TouchableOpacity>
            </View>
            
            {availableMembers.map((user: any) => {
              const isSelected = selectedMemberIds.includes(user.id);
              return (
                <TouchableOpacity 
                  key={user.id} 
                  style={[
                    styles.memberCard, 
                    isDarkMode && styles.memberCardDark,
                    isSelected && styles.memberCardSelected,
                    isSelected && isDarkMode && styles.memberCardSelectedDark
                  ]}
                  onPress={() => toggleSelectMember(user.id)}
                  activeOpacity={0.7}
                >
                  <View style={styles.memberAvatarContainer}>
                    {user.avatar ? (
                      <Image source={{ uri: user.avatar }} style={styles.memberAvatar} />
                    ) : (
                      <View style={[styles.memberAvatarPlaceholder, isDarkMode && styles.memberAvatarPlaceholderDark]}>
                        <User color="#9EA5B1" size={20} />
                      </View>
                    )}
                    {isSelected && (
                      <View style={[styles.checkBadge, isDarkMode && styles.checkBadgeDark]}>
                        <CheckCircle2 color={isDarkMode ? "#121212" : "#FFF"} size={14} fill="#0E7943" />
                      </View>
                    )}
                  </View>
                  <View style={styles.memberInfo}>
                    <Text style={[styles.memberName, isDarkMode && styles.textDark]}>{user.name}</Text>
                    <Text style={[styles.memberSubText, isDarkMode && styles.textGrayDark]}>
                      {user.position || 'Member'} <Text style={styles.bullet}>·</Text> {user.instansi || 'Telkom'}
                    </Text>
                  </View>
                  {!isSelected && (
                    <View style={styles.unselectedIndicator}>
                      <Circle color={isDarkMode ? "#444" : "#C9D0E0"} size={22} />
                    </View>
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        </ScrollView>

        {/* FOOTER ACTION */}
        <View style={[styles.footerContainer, isDarkMode && styles.footerContainerDark]}>
          <View style={[styles.footer, isDarkMode && styles.footerDark]}>
            <TouchableOpacity 
              style={[
                styles.createButton, 
                (groupTitle.trim() && selectedMemberIds.length > 0) ? styles.createButtonActive : styles.createButtonDisabled,
                !(groupTitle.trim() && selectedMemberIds.length > 0) && isDarkMode && styles.createButtonDisabledDark
              ]}
              disabled={!groupTitle.trim() || selectedMemberIds.length === 0 || isCreating}
              onPress={handleCreateGroup}
              activeOpacity={0.8}
            >
              {isCreating ? (
                <ActivityIndicator color="#FFF" />
              ) : (
                <Text style={styles.createButtonText}>Buat Grup</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F8F9FA', // Main background color matched
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  header: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 15,
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
  },
  backButton: {
    marginRight: 15,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111',
  },
  content: {
    flex: 1,
  },
  avatarSection: {
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 30,
  },
  avatarWrapper: {
    position: 'relative',
  },
  groupAvatarCircle: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: '#E8F5EE', // Light blue background
    justifyContent: 'center',
    alignItems: 'center',
  },
  cameraBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#27AE60',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#F8F9FA',
  },
  addPhotoText: {
    marginTop: 12,
    color: '#27AE60',
    fontSize: 12,
    fontWeight: '700',
  },
  inputSection: {
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#555',
    marginBottom: 8,
  },
  textInputContainer: {
    backgroundColor: '#F2F5FF',
    borderRadius: 12,
    paddingHorizontal: 16,
    height: 52,
    justifyContent: 'center',
  },
  textInput: {
    fontSize: 16,
    color: '#111',
    fontWeight: '500',
  },
  membersSection: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  membersHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  membersLabel: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111',
  },
  seeAllText: {
    color: '#27AE60',
    fontSize: 12,
    fontWeight: '700',
  },
  memberCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    backgroundColor: '#F1F4FA',
    borderRadius: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  memberCardSelected: {
    backgroundColor: '#F0F9F1',
    borderColor: '#27AE60',
  },
  memberAvatarContainer: {
    marginRight: 12,
    position: 'relative',
  },
  checkBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    zIndex: 10,
    backgroundColor: '#FFF',
    borderRadius: 10,
  },
  memberAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  memberAvatarPlaceholder: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#E5E7EB',
    justifyContent: 'center',
    alignItems: 'center',
  },
  memberInfo: {
    flex: 1,
  },
  memberName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111',
    marginBottom: 2,
  },
  memberSubText: {
    fontSize: 13,
    color: '#555',
  },
  bullet: {
    color: '#9EA5B1',
    fontWeight: '900',
  },
  unselectedIndicator: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  footerContainer: {
    backgroundColor: '#F8F9FA',
  },
  footer: {
    padding: 20,
    backgroundColor: '#FFF',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 10,
  },
  createButton: {
    height: 56,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  createButtonActive: {
    backgroundColor: '#27AE60',
  },
  createButtonDisabled: {
    backgroundColor: '#C9D0E0',
  },
  createButtonDisabledDark: {
    backgroundColor: '#333',
  },
  createButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFF',
  },
  safeAreaDark: { backgroundColor: '#121212' },
  containerDark: { backgroundColor: '#121212' },
  headerDark: { backgroundColor: '#121212' },
  textDark: { color: '#FFF' },
  textGrayDark: { color: '#9EA5B1' },
  groupAvatarCircleDark: { backgroundColor: '#1A1D36' },
  cameraBadgeDark: { borderColor: '#121212' },
  textInputContainerDark: { backgroundColor: '#1A1A1A' },
  memberCardDark: { backgroundColor: '#1A1A1A' },
  memberCardSelectedDark: { backgroundColor: '#1A2F22', borderColor: '#27AE60' },
  memberAvatarPlaceholderDark: { backgroundColor: '#333' },
  checkBadgeDark: { backgroundColor: '#121212' },
  footerContainerDark: { backgroundColor: '#121212' },
  footerDark: { backgroundColor: '#1E1E1E', borderTopWidth: 1, borderTopColor: '#333', shadowOpacity: 0, elevation: 0 },
});
