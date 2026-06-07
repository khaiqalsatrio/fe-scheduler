import React from 'react';
import { View, Text, TouchableOpacity, TextInput, StyleSheet } from 'react-native';
import { Users, Pencil } from 'lucide-react-native';
import { useTheme } from '../../context/ThemeContext';

interface GroupProfileSectionProps {
  type: string;
  membersCount: number;
  groupName: string;
  isEditingName: boolean;
  newName: string;
  setNewName: (name: string) => void;
  setIsEditingName: (editing: boolean) => void;
  onUpdateName: () => void;
}

export function GroupProfileSection({
  type,
  membersCount,
  groupName,
  isEditingName,
  newName,
  setNewName,
  setIsEditingName,
  onUpdateName,
}: GroupProfileSectionProps) {
  const { isDarkMode } = useTheme();

  return (
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
            <TouchableOpacity onPress={onUpdateName} style={styles.saveBtn}>
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
        <Text style={[styles.memberSubtitle, isDarkMode && styles.textGrayDark]}>
          {type === 'channel' ? 'Channel' : 'Grup'} · {membersCount} Anggota
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
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
  cardDark: {
    backgroundColor: '#1E1E1E',
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
  textDark: {
    color: '#FFF',
  },
  textGrayDark: {
    color: '#AAA',
  },
});
