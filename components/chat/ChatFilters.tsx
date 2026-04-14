import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { FilterType } from '../../hooks/useChatsList';

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
  if (!isVisible) return null;

  return (
    <View style={styles.filterContainer}>
      <TouchableOpacity 
        style={[styles.filterChip, activeFilter === 'all' && styles.activeFilterChip]} 
        onPress={() => setActiveFilter('all')}
      >
        <Text style={[styles.filterText, activeFilter === 'all' && styles.activeFilterText]}>All</Text>
      </TouchableOpacity>
      <TouchableOpacity 
        style={[styles.filterChip, activeFilter === 'unread' && styles.activeFilterChip]} 
        onPress={() => setActiveFilter('unread')}
      >
        <Text style={[styles.filterText, activeFilter === 'unread' && styles.activeFilterText]}>Unread</Text>
      </TouchableOpacity>
      <TouchableOpacity 
        style={[styles.filterChip, activeFilter === 'groups' && styles.activeFilterChip]} 
        onPress={() => setActiveFilter('groups')}
      >
        <Text style={[styles.filterText, activeFilter === 'groups' && styles.activeFilterText]}>Groups</Text>
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
});
