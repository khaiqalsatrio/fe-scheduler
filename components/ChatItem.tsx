import React from 'react';
import { StyleSheet, Text, View, Image, TouchableOpacity } from 'react-native';
import { User, Users, Check, VolumeX, Pin } from 'lucide-react-native';
import { CONFIG } from '../constants/Config';
import { useTheme } from '../context/ThemeContext';

interface ChatItemProps {
  name: string;
  lastMessage: string;
  time: string;
  avatar?: string;
  isGroup?: boolean;
  isOnline?: boolean;
  unreadCount?: number;
  onPress?: () => void;
  onLongPress?: () => void;
  isSelected?: boolean;
  isMuted?: boolean;
  isPinned?: boolean;
}

export const ChatItem: React.FC<ChatItemProps> = ({
  name,
  lastMessage,
  time,
  avatar,
  isGroup,
  isOnline,
  unreadCount,
  onPress,
  onLongPress,
  isSelected,
  isMuted,
  isPinned,
}) => {
  const { isDarkMode } = useTheme();

  const getAvatarUrl = (avatarStr?: string) => {
    if (!avatarStr) return null;
    if (avatarStr.startsWith('/')) {
      return `${CONFIG.API_BASE_URL}${avatarStr}`;
    }
    return avatarStr;
  };

  const formattedAvatar = getAvatarUrl(avatar);

  return (
    <TouchableOpacity 
      style={[styles.container, isDarkMode && styles.containerDark, isSelected && (isDarkMode ? styles.selectedContainerDark : styles.selectedContainer)]} 
      onPress={onPress} 
      onLongPress={onLongPress}
      activeOpacity={0.7}
    >
      <View style={styles.avatarContainer}>
        {formattedAvatar ? (
          <Image source={{ uri: formattedAvatar }} style={styles.avatar} />
        ) : (
          <View style={[styles.avatar, styles.placeholderAvatar]}>
            {isGroup ? (
              <Users color="#4285F4" size={24} />
            ) : (
              <User color="#999" size={24} />
            )}
          </View>
        )}
        {isOnline && <View style={styles.onlineBadge} />}
        {isSelected && (
          <View style={styles.selectionOverlay}>
            <Check color="#FFF" size={16} />
          </View>
        )}
      </View>
      <View style={[styles.content, isDarkMode && styles.contentDark]}>
        <View style={styles.header}>
          <Text style={[styles.name, isDarkMode && styles.textDark]}>{name}</Text>
          <Text style={[styles.time, (unreadCount ?? 0) > 0 ? styles.timeUnread : (isDarkMode ? styles.textGrayDark : null)]}>{time}</Text>
        </View>
        <View style={styles.footer}>
          <Text style={[styles.lastMessage, isDarkMode && styles.textGrayDark]} numberOfLines={1}>
            {lastMessage}
          </Text>
          {isMuted && (
            <VolumeX color="#999" size={16} style={{ marginLeft: 8 }} />
          )}
          <View style={{ flexDirection: 'row', alignItems: 'center', marginLeft: 8 }}>
            {isPinned && (
              <Pin size={14} color="#999" style={{ transform: [{ rotate: '45deg' }], marginRight: unreadCount ? 8 : 0 }} fill="#999" />
            )}
            {unreadCount ? (
              <View style={styles.unreadBadge}>
                <Text style={styles.unreadText}>{unreadCount}</Text>
              </View>
            ) : null}
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    paddingLeft: 15,
    alignItems: 'center',
    backgroundColor: '#FFF',
  },
  containerDark: {
    backgroundColor: '#121212',
  },
  avatarContainer: {
    position: 'relative',
    paddingVertical: 12,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#F0F0F0',
  },
  placeholderAvatar: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#E8F0FE',
  },
  onlineBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#25D366',
    borderWidth: 2,
    borderColor: '#FFF',
  },
  content: {
    flex: 1,
    marginLeft: 15,
    paddingRight: 15,
    paddingVertical: 15,
    justifyContent: 'center',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.08)',
  },
  contentDark: {
    borderBottomColor: '#222',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  name: {
    fontSize: 16,
    fontWeight: '700',
    color: '#000',
  },
  time: {
    fontSize: 12,
    color: '#999',
  },
  timeUnread: {
    color: '#25D366',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  lastMessage: {
    fontSize: 14,
    color: '#666',
    flex: 1,
    marginRight: 10,
  },
  textDark: {
    color: '#FFF',
  },
  textGrayDark: {
    color: '#AAA',
  },
  unreadBadge: {
    backgroundColor: '#25D366',
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 6,
  },
  unreadText: {
    color: '#FFF',
    fontSize: 11,
    fontWeight: '700',
  },
  selectedContainer: {
    backgroundColor: '#E7F5FE', // Light blue tint like WA selection
  },
  selectedContainerDark: {
    backgroundColor: '#1A2A2A',
  },
  selectionOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#25D366', // WA green
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    opacity: 0.8,
  },
});
