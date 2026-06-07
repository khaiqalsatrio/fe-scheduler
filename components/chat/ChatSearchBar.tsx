import React from 'react';
import { StyleSheet, View, TextInput } from 'react-native';
import { Search } from 'lucide-react-native';
import { useTheme } from '../../context/ThemeContext';

interface ChatSearchBarProps {
  value: string;
  onChangeText: (text: string) => void;
}

export const ChatSearchBar: React.FC<ChatSearchBarProps> = ({
  value,
  onChangeText,
}) => {
  const { isDarkMode } = useTheme();

  return (
    <View style={[styles.searchContainer, isDarkMode && styles.searchContainerDark]}>
      <View style={[styles.searchInputContainer, isDarkMode && styles.searchInputContainerDark]}>
        <Search color="#999" size={20} />
        <TextInput
          placeholder="Search...."
          style={[styles.searchInput, isDarkMode && styles.textDark]}
          placeholderTextColor={isDarkMode ? "#666" : "#999"}
          value={value}
          onChangeText={onChangeText}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  searchContainer: {
    paddingHorizontal: 15,
    paddingVertical: 10,
    backgroundColor: '#FFF',
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0F2F5',
    borderRadius: 24,
    paddingHorizontal: 15,
    height: 44,
  },
  searchInput: {
    flex: 1,
    marginLeft: 10,
    fontSize: 16,
    color: '#333',
  },
  searchContainerDark: {
    backgroundColor: '#121212',
    borderTopColor: '#222',
  },
  searchInputContainerDark: {
    backgroundColor: '#1A1A1A',
  },
  textDark: {
    color: '#FFF',
  },
});
