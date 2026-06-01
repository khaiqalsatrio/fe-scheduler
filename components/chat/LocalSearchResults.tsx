import React from 'react';
import { StyleSheet, View, Text, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';

interface LocalSearchResultsProps {
  localSearchResults: any[];
  isSearchingLocalLoading: boolean;
  setIsSearchingInside: (val: boolean) => void;
}

export function LocalSearchResults({
  localSearchResults,
  isSearchingLocalLoading,
  setIsSearchingInside,
}: LocalSearchResultsProps) {
  return (
    <FlatList
      data={localSearchResults}
      keyExtractor={(item) => item.id}
      ListEmptyComponent={() => (
        <View style={styles.searchEmptyContainer}>
          {isSearchingLocalLoading ? <ActivityIndicator color="#25D366" /> : <Text style={styles.searchEmptyText}>Tidak ada pesan ditemukan</Text>}
        </View>
      )}
      renderItem={({ item }) => (
        <TouchableOpacity style={styles.localSearchResultItem} onPress={() => setIsSearchingInside(false)}>
          <Text style={styles.localSearchResultTime}>{new Date(item.created_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', hour12: false })}</Text>
          <Text style={styles.localSearchResultText}>{item.content}</Text>
        </TouchableOpacity>
      )}
      style={styles.list}
      contentContainerStyle={styles.listContent}
    />
  );
}

const styles = StyleSheet.create({
  list: { flex: 1 },
  listContent: { paddingVertical: 10, paddingHorizontal: 15 },
  searchEmptyContainer: { padding: 20, alignItems: 'center' },
  searchEmptyText: { color: '#999', fontSize: 14 },
  localSearchResultItem: { padding: 15, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: '#EEE', backgroundColor: '#FFF' },
  localSearchResultTime: { fontSize: 10, color: '#999', marginBottom: 4 },
  localSearchResultText: { fontSize: 14, color: '#333' },
});
