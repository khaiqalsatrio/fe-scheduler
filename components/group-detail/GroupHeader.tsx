import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { ChevronLeft } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '../../context/ThemeContext';

export function GroupHeader({ type }: { type: string }) {
  const router = useRouter();
  const { isDarkMode } = useTheme();
  
  return (
    <View style={[styles.header, isDarkMode && styles.headerDark]}>
      <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
        <ChevronLeft color="#00A884" size={28} />
      </TouchableOpacity>
      <Text style={[styles.headerTitle, isDarkMode && styles.textDark]}>
        {type === 'channel' ? 'Info Channel' : 'Info Grup'}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    height: 60,
    backgroundColor: '#F0F2F5',
  },
  headerDark: {
    backgroundColor: '#121212',
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
  textDark: {
    color: '#FFF',
  },
});
