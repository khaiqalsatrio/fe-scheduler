import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Image, Platform, StatusBar } from 'react-native';
import { ArrowLeft, Pin, Bell, BellOff, Archive, Trash2, MoreVertical } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { ChatListItem } from '../../types/chat';
import { useTheme } from '../../context/ThemeContext';

interface ChatListHeaderProps {
  selectedChatIds: string[];
  setSelectedChatIds: (ids: string[]) => void;
  chats: ChatListItem[];
  onPin: () => void;
  onMute: () => void;
  onArchive: () => void;
  onDelete: () => void;
  isSelectionMode?: boolean;
  onEnterSelectionMode?: () => void;
  onCloseSelection?: () => void;
}

export const ChatListHeader: React.FC<ChatListHeaderProps> = ({
  selectedChatIds,
  setSelectedChatIds,
  chats,
  onPin,
  onMute,
  onArchive,
  onDelete,
  isSelectionMode,
  onEnterSelectionMode,
  onCloseSelection,
}) => {
  const router = useRouter();
  const { isDarkMode } = useTheme();
  const isSelected = selectedChatIds.length > 0 || !!isSelectionMode;

  const selectedChats = chats.filter(c => selectedChatIds.includes(c.id));
  const allPinned = selectedChats.every(c => c.isPinned);
  const allMuted = selectedChats.every(c => c.isMuted);

  return (
    <View style={[styles.headerSafeArea, isDarkMode && styles.headerSafeAreaDark, isSelected && styles.headerSelected]}>
      {isSelected ? (
        <View style={styles.header}>
          <View style={styles.logoContainer}>
            <TouchableOpacity onPress={() => {
              setSelectedChatIds([]);
              if (onCloseSelection) onCloseSelection();
            }} style={styles.backButton}>
              <ArrowLeft color="#FFF" size={24} />
            </TouchableOpacity>
            <Text style={styles.headerTitleSelected}>{selectedChatIds.length}</Text>
          </View>
          <View style={styles.headerIcons}>
            <TouchableOpacity style={styles.iconButton} onPress={onPin}>
              <Pin
                color="#FFF"
                size={24}
                style={{ transform: [{ rotate: '45deg' }] }}
                fill={allPinned ? "#FFF" : "transparent"}
              />
            </TouchableOpacity>
            <TouchableOpacity style={styles.iconButton} onPress={onMute}>
              {allMuted ? (
                <Bell color="#FFF" size={24} />
              ) : (
                <BellOff color="#FFF" size={24} />
              )}
            </TouchableOpacity>
            <TouchableOpacity style={styles.iconButton} onPress={onArchive}>
              <Archive color="#FFF" size={24} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.iconButton} onPress={onDelete}>
              <Trash2 color="#FFF" size={24} />
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        <View style={styles.header}>
          <View style={styles.logoContainer}>
            <Image
              source={require('../../assets/images/logo.png')}
              style={styles.logoImage}
            />
            <Text style={[styles.headerTitle, isDarkMode && styles.textDark]}>Chat</Text>
          </View>
          <View style={styles.headerIcons}>
            <TouchableOpacity style={styles.iconButton} onPress={onEnterSelectionMode}>
              <MoreVertical color={isDarkMode ? "#FFF" : "#333"} size={24} />
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  headerSafeArea: {
    backgroundColor: '#FFF',
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    zIndex: 10,
  },
  headerSafeAreaDark: {
    backgroundColor: '#121212',
    borderBottomWidth: 1,
    borderBottomColor: '#222',
    elevation: 0,
    shadowOpacity: 0,
  },
  textDark: {
    color: '#FFF',
  },
  headerSelected: {
    backgroundColor: '#005C4B',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 15,
    height: 60,
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    marginRight: 20,
    padding: 4,
  },
  logoImage: {
    width: 36,
    height: 36,
    borderRadius: 18,
    marginRight: 10,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#000',
  },
  headerTitleSelected: {
    fontSize: 20,
    fontWeight: '600',
    color: '#FFF',
  },
  headerIcons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconButton: {
    padding: 8,
    marginLeft: 5,
  },
});
