import React from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet } from 'react-native';
import { User, Trash2 } from 'lucide-react-native';
import { useTheme } from '../../context/ThemeContext';

interface GroupMemberItemProps {
  item: any;
  isLast: boolean;
  currentUser: any;
  isAdminUser: boolean;
  onMemberClick: (item: any) => void;
  onRemoveMember: (userId: string, memberName: string) => void;
}

export function GroupMemberItem({
  item,
  isLast,
  currentUser,
  isAdminUser,
  onMemberClick,
  onRemoveMember,
}: GroupMemberItemProps) {
  const { isDarkMode } = useTheme();

  return (
    <TouchableOpacity 
      style={[
        styles.memberItem, 
        isDarkMode && styles.cardDark,
        isLast && styles.lastMemberItem
      ]}
      onPress={() => onMemberClick(item)}
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
            onPress={() => onRemoveMember(item.userId, item.user?.name || 'Anggota')}
            style={styles.removeIconBtn}
          >
            <Trash2 color="#FF3B30" size={18} />
          </TouchableOpacity>
        )}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
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
  avatarImg: {
    width: 45,
    height: 45,
    borderRadius: 22.5,
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
  textDark: {
    color: '#FFF',
  },
  textGrayDark: {
    color: '#AAA',
  },
});
