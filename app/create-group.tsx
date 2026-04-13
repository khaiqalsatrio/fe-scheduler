import React, { useState, useMemo } from 'react';
import { StyleSheet, View, Text, SafeAreaView, TouchableOpacity, TextInput, ScrollView, Platform, StatusBar, ActivityIndicator, Alert, Image } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { ChevronLeft, Users, Camera, User } from 'lucide-react-native';
import ChatService from '../services/chatService';

export default function CreateGroupScreen() {
  const router = useRouter();
  const { participantData } = useLocalSearchParams<{ participantData: string }>();
  const [groupTitle, setGroupTitle] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  // Parse partisipan dari JSON
  const participants = useMemo(() => {
    try {
      return participantData ? JSON.parse(participantData) : [];
    } catch (e) {
      console.error('Error parsing participantData:', e);
      return [];
    }
  }, [participantData]);

  const handleCreateGroup = async () => {
    if (!groupTitle.trim()) return;

    setIsCreating(true);
    try {
      const participantIds = participants.map((p: any) => p.id).join(',');
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
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <ChevronLeft color="#000" size={28} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Buat Grup</Text>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* GROUP AVATAR SECTION */}
          <View style={styles.avatarSection}>
            <View style={styles.groupAvatarCircle}>
              <Users color="#1967D2" size={48} />
            </View>
          </View>

          {/* INPUT NAME SECTION */}
          <View style={styles.inputSection}>
            <Text style={styles.inputLabel}>Nama Grup</Text>
            <View style={styles.textInputContainer}>
              <TextInput
                style={styles.textInput}
                placeholder="Nama grup"
                placeholderTextColor="#9EA5B1"
                value={groupTitle}
                onChangeText={setGroupTitle}
              />
            </View>
          </View>

          {/* MEMBERS LIST SECTION */}
          <View style={styles.membersSection}>
            <Text style={styles.membersLabel}>Anggota ({participants.length})</Text>
            {participants.map((user: any) => (
              <View key={user.id} style={styles.memberCard}>
                <View style={styles.memberAvatarContainer}>
                  {user.avatar ? (
                    <Image source={{ uri: user.avatar }} style={styles.memberAvatar} />
                  ) : (
                    <View style={styles.memberAvatarPlaceholder}>
                      <User color="#BCC1C9" size={20} />
                    </View>
                  )}
                </View>
                <View style={styles.memberInfo}>
                  <Text style={styles.memberName}>{user.name}</Text>
                  <Text style={styles.memberSubText}>
                    {user.position || 'Member'} <Text style={styles.bullet}>·</Text> {user.instansi || 'Telkom'}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        </ScrollView>

        {/* FOOTER ACTION */}
        <View style={styles.footer}>
          <TouchableOpacity 
            style={[styles.createButton, groupTitle.trim() ? styles.createButtonActive : styles.createButtonDisabled]}
            disabled={!groupTitle.trim() || isCreating}
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
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFF',
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 15,
    alignItems: 'center',
    backgroundColor: '#FFF',
  },
  backButton: {
    marginRight: 15,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#000',
  },
  content: {
    flex: 1,
  },
  avatarSection: {
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 30,
  },
  groupAvatarCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#E0EEFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  inputSection: {
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111',
    marginBottom: 8,
  },
  textInputContainer: {
    backgroundColor: '#F3F4F6',
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
  },
  membersLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111',
    marginBottom: 16,
  },
  memberCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    marginBottom: 10,
  },
  memberAvatarContainer: {
    marginRight: 12,
  },
  memberAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
  },
  memberAvatarPlaceholder: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#E5E7EB',
    justifyContent: 'center',
    alignItems: 'center',
  },
  memberInfo: {
    flex: 1,
  },
  memberName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#111',
    marginBottom: 2,
  },
  memberSubText: {
    fontSize: 12,
    color: '#6B7280',
  },
  bullet: {
    color: '#27AE60',
    fontWeight: '900',
  },
  footer: {
    padding: 20,
    backgroundColor: '#FFF',
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  createButton: {
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#27AE60',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  createButtonActive: {
    backgroundColor: '#27AE60',
  },
  createButtonDisabled: {
    backgroundColor: '#D1D5DB',
    shadowOpacity: 0,
  },
  createButtonText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#FFF',
  },
});
