import React from 'react';
import { StyleSheet, View, TextInput } from 'react-native';
import { Search } from 'lucide-react-native';

interface ChatSearchBarProps {
  value: string;
  onChangeText: (text: string) => void;
}

export const ChatSearchBar: React.FC<ChatSearchBarProps> = ({
  value,
  onChangeText,
}) => {
  return (
    <View style={styles.searchContainer}>
      <View style={styles.searchInputContainer}>
        <Search color="#999" size={20} />
        <TextInput
          placeholder="Search...."
          style={styles.searchInput}
          placeholderTextColor="#999"
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
});
