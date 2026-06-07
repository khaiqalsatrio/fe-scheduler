import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Image, SafeAreaView, Platform, StatusBar, ScrollView, ActivityIndicator, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ChevronLeft, ChevronRight, User, MessageSquare, Phone, Video, Info, Bell, Image as ImageIcon, Link as LinkIcon, FileText, Ban, Trash2, MoreVertical } from 'lucide-react-native';
import { ChatService } from '../../services/chatService';
import { AuthService } from '../../services/authService';
import { ConfirmModal } from '../../components/ConfirmModal';

export default function UserProfileScreen() {
  const { id, title } = useLocalSearchParams();
  const router = useRouter();

  const [targetUser, setTargetUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<any>(null);

  const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);

  useEffect(() => {
    const init = async () => {
      const user = await AuthService.getCurrentUser();
      setCurrentUser(user);
      fetchUserProfile(user?.id);
    };
    init();
  }, [id]);

  const fetchUserProfile = async (myUserId: string | undefined) => {
    setIsLoading(true);
    try {
      // Assuming id is conversation ID
      const data = await ChatService.getGroupMembers(id as string);
      if (data && data.length > 0) {
        // Find the user who is not me
        const otherMember = data.find((m: any) => m.userId !== myUserId);
        if (otherMember) {
          setTargetUser(otherMember.user);
        } else if (data.length === 1) {
          // Chatting with self
          setTargetUser(data[0].user);
        }
      }
    } catch (error) {
      console.error('Fetch user profile error:', error);
      Alert.alert('Error', 'Gagal mengambil detail profil.');
    } finally {
      setIsLoading(false);
    }
  };

  const confirmDeleteChat = async () => {
    setIsDeleteModalVisible(false);
    try {
      setIsLoading(true);
      await ChatService.deleteConversation(id as string);
      router.replace('/(tabs)/chats');
    } catch (error) {
      Alert.alert('Error', 'Gagal menghapus percakapan.');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color="#37ee68ff" />
      </View>
    );
  }

  const profileName = targetUser?.name || title || 'User';
  const profileBio = targetUser?.bio || 'Haii, saya menggunakan aplikasi ini!';
  const profileAvatar = targetUser?.avatar_url;
  const brandColor = "#10C855"; // Green color

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFF" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ChevronLeft color={brandColor} size={28} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Info Kontak</Text>
        <TouchableOpacity style={styles.headerMoreButton}>
          <MoreVertical color={brandColor} size={24} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Profile Info Section */}
        <View style={styles.profileSection}>
          <View style={styles.avatarWrapper}>
            {profileAvatar ? (
              <Image source={{ uri: profileAvatar }} style={styles.largeAvatarImg} />
            ) : (
              <View style={styles.largeAvatarPlaceholder}>
                <User color="#FFF" size={60} />
              </View>
            )}
            <View style={styles.onlineIndicator} />
          </View>
          <Text style={styles.nameText}>{profileName}</Text>
          <Text style={styles.emailText}>{targetUser?.email || `${profileName.toLowerCase().replace(/\s+/g, '')}@gmail.com`}</Text>

          {/* Action Buttons */}
          <View style={styles.actionRow}>
            <TouchableOpacity style={styles.actionBtn} onPress={() => router.back()}>
              <MessageSquare color={brandColor} size={20} />
              <Text style={styles.actionBtnText}>Chat</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionBtn}>
              <Phone color={brandColor} size={20} />
              <Text style={styles.actionBtnText}>Audio</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionBtn}>
              <Video color={brandColor} size={20} />
              <Text style={styles.actionBtnText}>Video</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Bio / About Section */}
        <View style={styles.cardSection}>
          <Text style={styles.sectionTitle}>Info</Text>
          <Text style={styles.infoText}>{profileBio}</Text>
          <Text style={styles.dateText}>20 Januari 2024</Text>
        </View>

        {/* Media & Docs Section */}
        <TouchableOpacity style={styles.cardSectionRow}>
          <Text style={styles.rowTitle}>Media, tautan, dan dok</Text>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Text style={styles.rowValue}>0</Text>
            <ChevronRight color="#999" size={20} />
          </View>
        </TouchableOpacity>

        {/* Settings Section */}
        <View style={styles.cardSection}>
          <TouchableOpacity style={styles.actionItemRow}>
            <Bell color="#444" size={22} style={styles.actionItemIcon} />
            <Text style={styles.actionItemText}>Bisukan notifikasi</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.actionItemRow, { borderBottomWidth: 0, paddingBottom: 5 }]}>
            <ImageIcon color="#444" size={22} style={styles.actionItemIcon} />
            <Text style={styles.actionItemText}>Simpan ke rol kamera</Text>
          </TouchableOpacity>

          {/* Media Placeholders */}
          <View style={styles.mediaPlaceholdersRow}>
            <View style={styles.mediaPlaceholder}>
              <ImageIcon color="#888" size={24} />
            </View>
            <View style={styles.mediaPlaceholder}>
              <LinkIcon color="#888" size={24} />
            </View>
            <View style={styles.mediaPlaceholder}>
              <FileText color="#888" size={24} />
            </View>
          </View>
        </View>

        {/* Destructive Actions */}
        <View style={[styles.cardSection, { marginBottom: 30 }]}>
          <TouchableOpacity style={styles.actionItemRow}>
            <Ban color="#D32F2F" size={22} style={styles.actionItemIcon} />
            <Text style={[styles.actionItemText, { color: '#D32F2F' }]}>Blokir {profileName}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.actionItemRow, { borderBottomWidth: 0 }]} onPress={() => setIsDeleteModalVisible(true)}>
            <Trash2 color="#D32F2F" size={22} style={styles.actionItemIcon} />
            <Text style={[styles.actionItemText, { color: '#D32F2F' }]}>Hapus chat</Text>
          </TouchableOpacity>
        </View>

      </ScrollView>

      <ConfirmModal
        visible={isDeleteModalVisible}
        onClose={() => setIsDeleteModalVisible(false)}
        onConfirm={confirmDeleteChat}
        title={`Hapus chat dengan ${profileName}?`}
        message="Pesan akan dihapus dari semua perangkat."
        confirmText="Hapus"
        type="destructive"
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAFA',
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 15,
    height: 60,
    backgroundColor: '#FAFAFA',
  },
  backButton: {
    padding: 5,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#000',
    flex: 1,
    marginLeft: 15,
  },
  headerMoreButton: {
    padding: 5,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  profileSection: {
    backgroundColor: '#FFF',
    alignItems: 'center',
    paddingVertical: 25,
    marginBottom: 8,
  },
  avatarWrapper: {
    marginBottom: 15,
    position: 'relative',
  },
  largeAvatarImg: {
    width: 120,
    height: 120,
    borderRadius: 60,
  },
  largeAvatarPlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#CCC',
    justifyContent: 'center',
    alignItems: 'center',
  },
  onlineIndicator: {
    position: 'absolute',
    bottom: 5,
    right: 5,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#10C855',
    borderWidth: 3,
    borderColor: '#FFF',
  },
  nameText: {
    fontSize: 22,
    fontWeight: '700',
    color: '#111',
    marginBottom: 4,
  },
  emailText: {
    fontSize: 13,
    color: '#666',
    marginBottom: 20,
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    width: '100%',
    paddingHorizontal: 20,
    gap: 15,
  },
  actionBtn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#EAF9F0',
    paddingVertical: 12,
    borderRadius: 12,
  },
  actionBtnText: {
    marginTop: 6,
    fontSize: 13,
    color: '#10C855',
    fontWeight: '600',
  },
  cardSection: {
    backgroundColor: '#FFF',
    marginBottom: 8,
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  cardSectionRow: {
    backgroundColor: '#FFF',
    marginBottom: 8,
    paddingHorizontal: 20,
    paddingVertical: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: 14,
    color: '#555',
    fontWeight: '700',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 16,
    color: '#111',
    lineHeight: 22,
  },
  dateText: {
    fontSize: 13,
    color: '#888',
    marginTop: 6,
  },
  rowTitle: {
    fontSize: 16,
    color: '#111',
  },
  rowValue: {
    fontSize: 15,
    color: '#666',
    marginRight: 5,
  },
  actionItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#EEE',
  },
  actionItemIcon: {
    marginRight: 15,
  },
  actionItemText: {
    fontSize: 16,
    color: '#111',
  },
  mediaPlaceholdersRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 15,
  },
  mediaPlaceholder: {
    flex: 1,
    aspectRatio: 1,
    backgroundColor: '#E5E5E5',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  }
});
