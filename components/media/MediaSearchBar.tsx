import React from 'react';
import { View, TextInput, StyleSheet } from 'react-native';
import { Search } from 'lucide-react-native';
import { useTheme } from '../../context/ThemeContext';

interface MediaSearchBarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

export function MediaSearchBar({ searchQuery, onSearchChange }: MediaSearchBarProps) {
  const { isDarkMode } = useTheme();

  return (
    <View style={[styles.searchContainer, isDarkMode && styles.searchContainerDark]}>
      <Search color={isDarkMode ? "#9CA3AF" : "#9CA3AF"} size={18} />
      <TextInput
        style={[styles.searchText, isDarkMode && styles.textDark, { flex: 1, height: '100%' }]}
        placeholder="Cari file..."
        placeholderTextColor="#9CA3AF"
        value={searchQuery}
        onChangeText={onSearchChange}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#E5E5E5',
    marginHorizontal: 20,
    marginBottom: 10,
    paddingHorizontal: 16,
    height: 44,
    borderRadius: 8,
    gap: 8,
  },
  searchContainerDark: {
    backgroundColor: '#1E1E1E',
    borderColor: '#333',
  },
  searchText: {
    color: '#9CA3AF',
    fontSize: 14,
    fontWeight: '400',
  },
  textDark: {
    color: '#FFF',
  },
});
