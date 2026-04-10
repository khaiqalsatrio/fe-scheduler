import React, { useState } from 'react';
import { StyleSheet, View, Text, SafeAreaView, TouchableOpacity, TextInput, ScrollView, FlatList, Platform, StatusBar } from 'react-native';
import { useRouter } from 'expo-router';
import { ChevronLeft, Search, User } from 'lucide-react-native';

const CATEGORIES = ['Semua', 'Speaker', 'Designer', 'PM', 'Engineer'];

const DUMMY_CONNECTIONS = [
  { id: '1', name: 'Bima Santoso', badge: 'Speaker', role: 'Product Manager • Telkom' },
  { id: '2', name: 'Kia Rahma', role: 'Data Analyst • Telkom' },
  { id: '3', name: 'Andi Wijaya', badge: 'Mentor', role: 'UI/UX Designer • Gojek' },
  { id: '4', name: 'Sarah Putri', role: 'Frontend Engineer • Tokopedia' },
  { id: '5', name: 'Dimas Prakoso', badge: 'Speaker', role: 'Product Manager • Bukalapak' },
  { id: '6', name: 'Lisa Amelia', role: 'Backend Engineer • Shopee' },
  { id: '7', name: 'Reza Firmansyah', role: 'Software Engineer • Traveloka' },
];

export default function NewConnectionScreen() {
  const router = useRouter();
  const [activeCategory, setActiveCategory] = useState('Semua');
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const renderConnectionItem = ({ item }: { item: typeof DUMMY_CONNECTIONS[0] }) => {
    const isSelected = selectedId === item.id;
    return (
      <TouchableOpacity 
        style={[styles.connectionItem, isSelected && styles.connectionItemSelected]} 
        onPress={() => setSelectedId(item.id)}
        activeOpacity={0.7}
      >
        <View style={styles.avatarContainer}>
          <User color="#999" size={24} />
        </View>
        <View style={styles.connectionInfo}>
          <View style={styles.nameRow}>
            <Text style={styles.connectionName}>{item.name}</Text>
            {item.badge && (
              <View style={styles.badgeContainer}>
                <Text style={styles.badgeText}>{item.badge}</Text>
              </View>
            )}
          </View>
          <Text style={styles.connectionRole}>{item.role}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <ChevronLeft color="#000" size={28} />
          </TouchableOpacity>
          <View style={styles.headerTextContainer}>
            <Text style={styles.headerTitle}>Cari Koneksi</Text>
            <Text style={styles.headerSubtitle}>Bangun koneksi baru, kembangkan jaringanmu</Text>
          </View>
        </View>

        {/* Search */}
        <View style={styles.searchContainer}>
          <View style={styles.searchInputContainer}>
            <Search color="#999" size={20} />
            <TextInput 
              placeholder="Cari nama, role, atau instansi" 
              style={styles.searchInput} 
              placeholderTextColor="#999" 
            />
          </View>
        </View>

        {/* Categories */}
        <View style={styles.categoriesContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoriesScroll}>
            {CATEGORIES.map((cat) => (
              <TouchableOpacity
                key={cat}
                style={[styles.categoryChip, activeCategory === cat && styles.categoryChipActive]}
                onPress={() => setActiveCategory(cat)}
              >
                <Text style={[styles.categoryText, activeCategory === cat && styles.categoryTextActive]}>
                  {cat}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* List */}
        <FlatList
          data={DUMMY_CONNECTIONS}
          keyExtractor={(item) => item.id}
          renderItem={renderConnectionItem}
          contentContainerStyle={styles.listContent}
        />

        {/* Footer */}
        <View style={styles.footer}>
          <TouchableOpacity 
            style={[styles.actionButton, selectedId ? styles.actionButtonActive : styles.actionButtonDisabled]}
            disabled={!selectedId}
          >
            <Text style={[styles.actionButtonText, selectedId ? styles.actionButtonTextActive : styles.actionButtonTextDisabled]}>
              Mulai Chat
            </Text>
          </TouchableOpacity>
          <Text style={styles.footerInfoText}>Pilih peserta untuk mulai koneksi</Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFF',
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    paddingHorizontal: 15,
    paddingVertical: 15,
    alignItems: 'center',
  },
  backButton: {
    marginRight: 10,
  },
  headerTextContainer: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#000',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 13,
    color: '#666',
  },
  searchContainer: {
    paddingHorizontal: 15,
    marginBottom: 15,
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0F2F5',
    borderRadius: 20,
    paddingHorizontal: 15,
    height: 48,
  },
  searchInput: {
    flex: 1,
    marginLeft: 10,
    fontSize: 15,
    color: '#333',
  },
  categoriesContainer: {
    marginBottom: 10,
  },
  categoriesScroll: {
    paddingHorizontal: 15,
    paddingBottom: 10,
  },
  categoryChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    marginRight: 10,
  },
  categoryChipActive: {
    backgroundColor: '#25D366',
    borderColor: '#25D366',
  },
  categoryText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  categoryTextActive: {
    color: '#FFF',
    fontWeight: '600',
  },
  listContent: {
    paddingBottom: 120, // space for footer
  },
  connectionItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingHorizontal: 15,
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#EEE',
    backgroundColor: '#FFF',
  },
  connectionItemSelected: {
    backgroundColor: '#F3FCF5', // subtle green background
  },
  avatarContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#E8F0FE',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  connectionInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  connectionName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#000',
    marginRight: 8,
  },
  badgeContainer: {
    backgroundColor: '#F3E5F5',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  badgeText: {
    color: '#9C27B0',
    fontSize: 10,
    fontWeight: '800',
  },
  connectionRole: {
    fontSize: 14,
    color: '#666',
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFF',
    paddingHorizontal: 15,
    paddingTop: 15,
    paddingBottom: Platform.OS === 'ios' ? 30 : 20,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#EEE',
  },
  actionButton: {
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  actionButtonActive: {
    backgroundColor: '#25D366',
  },
  actionButtonDisabled: {
    backgroundColor: '#D1D5DB', // light gray
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: '700',
  },
  actionButtonTextActive: {
    color: '#FFF',
  },
  actionButtonTextDisabled: {
    color: '#FFF', // Alternatively, a slightly darker gray if bg is too light
  },
  footerInfoText: {
    textAlign: 'center',
    fontSize: 12,
    color: '#999',
  },
});
