import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, FlatList, Image, TextInput, TouchableOpacity, Dimensions, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Search, MessageCircle, MapPin } from 'lucide-react-native';
import { sessions } from '../../data/sessions';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - 48) / 2; // 2 columns with padding

export default function SpeakersScreen() {
  const [searchQuery, setSearchQuery] = useState('');

  // Extract unique speakers
  const allSpeakers = sessions.flatMap((session) => session.speakers);
  const uniqueSpeakers = Array.from(
    new Map(allSpeakers.map((speaker) => [speaker.id, speaker])).values()
  );

  // Filter based on search query
  const filteredSpeakers = uniqueSpeakers.filter(speaker =>
    speaker.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    speaker.company.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const renderSpeaker = ({ item }: { item: typeof uniqueSpeakers[0] }) => (
    <View style={styles.speakerCard}>
      <Image source={{ uri: item.avatar }} style={styles.speakerImage} />

      <View style={styles.speakerInfo}>
        <Text style={styles.speakerName} numberOfLines={1}>{item.name}</Text>
        <Text style={styles.speakerTitle} numberOfLines={1}>{item.title}</Text>

        <View style={styles.companyRow}>
          <MapPin size={12} color="#00BCD4" />
          <Text style={styles.speakerCompany} numberOfLines={1}>{item.company}</Text>
        </View>
      </View>

      <TouchableOpacity style={styles.connectButton} activeOpacity={0.8}>
        <MessageCircle size={16} color="#FFF" />
        <Text style={styles.connectText}>Sapa</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header bergradien */}
      <LinearGradient colors={['#00BCD4', '#0097A7']} style={styles.header}>
        <Text style={styles.headerTitle}>Pembicara Utama</Text>
        <Text style={styles.headerSubtitle}>Temui para ahli industri global</Text>

        <View style={styles.searchContainer}>
          <Search color="#999" size={20} />
          <TextInput
            style={styles.searchInput}
            placeholder="Cari nama atau perusahaan..."
            placeholderTextColor="#999"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </LinearGradient>

      {/* Grid List */}
      <FlatList
        data={filteredSpeakers}
        keyExtractor={(item) => item.id}
        renderItem={renderSpeaker}
        numColumns={2}
        contentContainerStyle={styles.listContent}
        columnWrapperStyle={styles.columnWrapper}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Search size={48} color="#CCC" />
            <Text style={styles.emptyText}>Tidak ada pembicara ditemukan</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  header: {
    paddingTop: Platform.OS === 'ios' ? 50 : 30, // SafeArea spacing
    paddingBottom: 25,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 3,
    borderBottomRightRadius: 3,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    zIndex: 10,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#FFF',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
    marginBottom: 20,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    borderRadius: 15,
    paddingHorizontal: 15,
    height: 48,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
  },
  searchInput: {
    flex: 1,
    marginLeft: 10,
    fontSize: 15,
    color: '#333',
  },
  listContent: {
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 30,
  },
  columnWrapper: {
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  speakerCard: {
    width: CARD_WIDTH,
    backgroundColor: '#FFF',
    borderRadius: 20,
    padding: 15,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
  },
  speakerImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: '#E0F7FA',
  },
  speakerInfo: {
    alignItems: 'center',
    width: '100%',
    marginBottom: 12,
  },
  speakerName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 4,
    textAlign: 'center',
  },
  speakerTitle: {
    fontSize: 12,
    color: '#666',
    marginBottom: 6,
    textAlign: 'center',
  },
  companyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  speakerCompany: {
    fontSize: 11,
    color: '#00BCD4',
    fontWeight: '600',
  },
  connectButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#00BCD4',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 12,
    width: '100%',
    gap: 6,
  },
  connectText: {
    color: '#FFF',
    fontSize: 13,
    fontWeight: '700',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 60,
  },
  emptyText: {
    marginTop: 12,
    fontSize: 16,
    color: '#999',
    fontWeight: '500',
  },
});
