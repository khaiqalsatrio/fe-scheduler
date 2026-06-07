import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { FilterType } from '../../hooks/useChatsList';
import { useTheme } from '../../context/ThemeContext';

interface ChatFiltersProps {
  activeFilter: FilterType;
  setActiveFilter: (filter: FilterType) => void;
  isVisible: boolean;
}

export const ChatFilters: React.FC<ChatFiltersProps> = ({
  activeFilter,
  setActiveFilter,
  isVisible,
}) => {
  const { isDarkMode } = useTheme();

  if (!isVisible) return null;

  return (
    <View style={[styles.filterContainer, isDarkMode && styles.filterContainerDark]}>
      <TouchableOpacity 
        style={[styles.filterChip, isDarkMode && styles.filterChipDark, activeFilter === 'all' && (isDarkMode ? styles.activeFilterChipDark : styles.activeFilterChip)]} 
        onPress={() => setActiveFilter('all')}
      >
        <Text style={[styles.filterText, isDarkMode && styles.filterTextDark, activeFilter === 'all' && (isDarkMode ? styles.activeFilterTextDark : styles.activeFilterText)]}>All</Text>
      </TouchableOpacity>
      <TouchableOpacity 
        style={[styles.filterChip, isDarkMode && styles.filterChipDark, activeFilter === 'unread' && (isDarkMode ? styles.activeFilterChipDark : styles.activeFilterChip)]} 
        onPress={() => setActiveFilter('unread')}
      >
        <Text style={[styles.filterText, isDarkMode && styles.filterTextDark, activeFilter === 'unread' && (isDarkMode ? styles.activeFilterTextDark : styles.activeFilterText)]}>Unread</Text>
      </TouchableOpacity>
      <TouchableOpacity 
        style={[styles.filterChip, isDarkMode && styles.filterChipDark, activeFilter === 'groups' && (isDarkMode ? styles.activeFilterChipDark : styles.activeFilterChip)]} 
        onPress={() => setActiveFilter('groups')}
      >
        <Text style={[styles.filterText, isDarkMode && styles.filterTextDark, activeFilter === 'groups' && (isDarkMode ? styles.activeFilterTextDark : styles.activeFilterText)]}>Groups</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  filterContainer: {
    flexDirection: 'row',
    paddingHorizontal: 15,
    paddingBottom: 12,
    backgroundColor: '#FFF',
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginRight: 8,
  },
  activeFilterChip: {
    backgroundColor: '#D1FAE5',
    borderColor: '#D1FAE5',
  },
  filterText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6B7280',
  },
  activeFilterText: {
    color: '#065F46',
  },
  filterContainerDark: {
    backgroundColor: '#121212',
  },
  filterChipDark: {
    backgroundColor: '#1A1A1A',
    borderColor: '#333',
  },
  filterTextDark: {
    color: '#AAA',
  },
  activeFilterChipDark: {
    backgroundColor: '#075E54',
    borderColor: '#075E54',
  },
  activeFilterTextDark: {
    color: '#FFF',
  },
});
