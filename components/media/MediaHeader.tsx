import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { MoreHorizontal } from 'lucide-react-native';
import { useTheme } from '../../context/ThemeContext';

interface MediaHeaderProps {
  onToggleSelectionMode: () => void;
}

export function MediaHeader({ onToggleSelectionMode }: MediaHeaderProps) {
  const { isDarkMode } = useTheme();

  return (
    <View style={[styles.header, isDarkMode && styles.containerDark]}>
      <View style={styles.logoContainer}>
        <Image
          source={require('../../assets/images/logo.png')}
          style={styles.logoImage}
        />
        <Text style={[styles.headerTitle, isDarkMode && styles.textDark]}>Files</Text>
      </View>
      <TouchableOpacity style={[styles.menuButton, isDarkMode && styles.menuButtonDark]} onPress={onToggleSelectionMode}>
        <MoreHorizontal color={isDarkMode ? "#FFF" : "#000"} size={20} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  containerDark: {
    backgroundColor: '#121212',
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  logoImage: {
    width: 32,
    height: 32,
    borderRadius: 16,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#000',
  },
  textDark: {
    color: '#FFF',
  },
  menuButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuButtonDark: {
    backgroundColor: '#1E1E1E',
  },
});
