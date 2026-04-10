import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  FlatList,
  Image,
  TouchableOpacity,
  TextInput,
  Modal,
  Pressable,
  Platform,
} from 'react-native';
import { router } from 'expo-router';
import { MessageSquare, Mail, Linkedin, Search, X, UserCircle, Briefcase, MapPin } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';

// Tipe Data
type Attendee = {
  id: string;
  name: string;
  title: string;
  company: string;
  avatar: string;
  bio?: string;
};

const attendeesData: Attendee[] = [
  {
    id: '1',
    name: 'David Kim',
    title: 'Product Manager',
    company: 'Google',
    avatar: 'https://images.pexels.com/photos/1681010/pexels-photo-1681010.jpeg?auto=compress&cs=tinysrgb&w=200',
    bio: 'Fokus dalam mengembangkan produk AI untuk mempermudah produktivitas korporat kelas dunia.',
  },
  {
    id: '2',
    name: 'Emma Rodriguez',
    title: 'Data Scientist',
    company: 'Microsoft',
    avatar: 'https://images.pexels.com/photos/3756679/pexels-photo-3756679.jpeg?auto=compress&cs=tinysrgb&w=200',
    bio: 'Ahli riset algoritmik prediktif. Menikmati kopi dan membangun model machine learning yang inovatif.',
  },
  {
    id: '3',
    name: 'Alex Thompson',
    title: 'UX Designer',
    company: 'Meta',
    avatar: 'https://images.pexels.com/photos/2379005/pexels-photo-2379005.jpeg?auto=compress&cs=tinysrgb&w=200',
    bio: 'Menghubungkan interaksi manusia dan sistem komputer ke dalam bentuk antarmuka visual yang imersif.',
  },
  {
    id: '4',
    name: 'Priya Sharma',
    title: 'Engineering Manager',
    company: 'Amazon',
    avatar: 'https://images.pexels.com/photos/1130626/pexels-photo-1130626.jpeg?auto=compress&cs=tinysrgb&w=200',
    bio: 'Pemimpin divisi cloud infrastructure engineering di ranah teknologi e-commerce logistik.',
  },
  {
    id: '5',
    name: 'Michael Chen',
    title: 'Marketing Director',
    company: 'Salesforce',
    avatar: 'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=200',
    bio: 'Meramu strategi pemasaran lintas benua dan memastikan pertumbuhan nilai brand di pasar global.',
  },
];

export default function NetworkingScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProfile, setSelectedProfile] = useState<Attendee | null>(null);

  const handleChatPress = (id: string, name: string) => {
    setSelectedProfile(null); // Tutup modal jika chat dibuka
    router.push({
      pathname: '/chat/[id]',
      params: { id, name },
    });
  };

  // Filter Search
  const filteredAttendees = attendeesData.filter(
    (att) =>
      att.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      att.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      att.company.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const renderAttendee = ({ item }: { item: Attendee }) => (
    <TouchableOpacity
      style={styles.attendeeCard}
      activeOpacity={0.7}
      onPress={() => setSelectedProfile(item)}
    >
      <Image source={{ uri: item.avatar }} style={styles.attendeeImage} />

      <View style={styles.attendeeInfo}>
        <Text style={styles.attendeeName} numberOfLines={1}>{item.name}</Text>
        <Text style={styles.attendeeTitle} numberOfLines={1}>{item.title}</Text>
        <View style={styles.companyBadge}>
          <Briefcase size={12} color="#00BCD4" style={{ marginRight: 4 }} />
          <Text style={styles.attendeeCompany} numberOfLines={1}>{item.company}</Text>
        </View>
      </View>

      <TouchableOpacity
        style={styles.primaryActionButton}
        onPress={() => handleChatPress(item.id, item.name)}
        activeOpacity={0.8}
      >
        <MessageSquare size={18} color="#FFF" />
      </TouchableOpacity>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header Premium */}
      <LinearGradient colors={['#00BCD4', '#0097A7']} style={styles.header}>
        <View style={styles.headerTopRow}>
          <View>
            <Text style={styles.headerTitle}>Jejaring</Text>
            <Text style={styles.headerSubtitle}>Bangun koneksi industri Anda</Text>
          </View>
          {/* Ikon Profil Anda */}
          <TouchableOpacity
            style={styles.myProfileBtn}
            activeOpacity={0.8}
            onPress={() => router.push('/profile')}
          >
            <UserCircle size={32} color="#FFF" />
          </TouchableOpacity>
        </View>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <Search color="#999" size={20} />
          <TextInput
            style={styles.searchInput}
            placeholder="Cari kolega, jabatan, instansi..."
            placeholderTextColor="#999"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <X size={18} color="#999" />
            </TouchableOpacity>
          )}
        </View>
      </LinearGradient>

      {/* Daftar Eksekutif */}
      <FlatList
        data={filteredAttendees}
        keyExtractor={(item) => item.id}
        renderItem={renderAttendee}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Search size={48} color="#CCC" />
            <Text style={styles.emptyText}>Tidak ada koneksi yang cocok.</Text>
          </View>
        }
      />

      {/* MODAL PROFIL DETAIL */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={selectedProfile !== null}
        onRequestClose={() => setSelectedProfile(null)}
      >
        <Pressable style={styles.modalOverlay} onPress={() => setSelectedProfile(null)}>
          <Pressable style={styles.modalContent} onPress={(e) => e.stopPropagation()}>
            {selectedProfile && (
              <>
                <TouchableOpacity style={styles.closeModalBtn} onPress={() => setSelectedProfile(null)}>
                  <X size={24} color="#666" />
                </TouchableOpacity>

                <View style={styles.modalHeaderInfo}>
                  <Image source={{ uri: selectedProfile.avatar }} style={styles.modalAvatar} />
                  <Text style={styles.modalName}>{selectedProfile.name}</Text>
                  <Text style={styles.modalTitle}>{selectedProfile.title}</Text>

                  <View style={styles.modalCompanyBadge}>
                    <MapPin size={14} color="#00BCD4" />
                    <Text style={styles.modalCompanyText}>{selectedProfile.company}</Text>
                  </View>
                </View>

                {/* Deskripsi Bio */}
                <View style={styles.bioContainer}>
                  <Text style={styles.bioTitle}>Tentang</Text>
                  <Text style={styles.bioText}>
                    {selectedProfile.bio ? selectedProfile.bio : "Peserta ini belum membagikan bio singkat."}
                  </Text>
                </View>

                {/* Tombol Aksi di Modal */}
                <View style={styles.modalActionsRow}>
                  <TouchableOpacity
                    style={styles.modalMainBtn}
                    activeOpacity={0.8}
                    onPress={() => handleChatPress(selectedProfile.id, selectedProfile.name)}
                  >
                    <MessageSquare size={20} color="#FFF" />
                    <Text style={styles.modalMainBtnText}>Mulai Obrolan</Text>
                  </TouchableOpacity>

                  <View style={styles.modalSecBtns}>
                    <TouchableOpacity style={styles.modalIconBtn} activeOpacity={0.7}>
                      <Mail size={22} color="#666" />
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.modalIconBtn} activeOpacity={0.7}>
                      <Linkedin size={22} color="#0A66C2" />
                    </TouchableOpacity>
                  </View>
                </View>
              </>
            )}
          </Pressable>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  header: {
    paddingTop: Platform.OS === 'ios' ? 50 : 30, // Area aman
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
  headerTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#FFF',
  },
  headerSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
    marginTop: 2,
  },
  myProfileBtn: {
    padding: 2,
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
    paddingTop: 16,
    paddingBottom: 30,
  },
  attendeeCard: {
    backgroundColor: '#FFF',
    borderRadius: 20,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
  },
  attendeeImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 2,
    borderColor: '#E0F7FA',
  },
  attendeeInfo: {
    flex: 1,
    marginLeft: 16,
  },
  attendeeName: {
    fontSize: 17,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 2,
  },
  attendeeTitle: {
    fontSize: 13,
    color: '#666',
    marginBottom: 6,
  },
  companyBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0F8FF',
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  attendeeCompany: {
    fontSize: 12,
    color: '#00BCD4',
    fontWeight: '700',
  },
  primaryActionButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#00BCD4',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#00BCD4',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    marginLeft: 10,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 80,
  },
  emptyText: {
    marginTop: 15,
    fontSize: 16,
    color: '#999',
    fontWeight: '500',
  },

  /* MODAL STYLES */
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFF',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    paddingTop: 30,
    paddingHorizontal: 25,
    paddingBottom: Platform.OS === 'ios' ? 40 : 25,
    elevation: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -5 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
  },
  closeModalBtn: {
    position: 'absolute',
    top: 20,
    right: 20,
    zIndex: 10,
    padding: 5,
  },
  modalHeaderInfo: {
    alignItems: 'center',
    marginBottom: 25,
  },
  modalAvatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 15,
    borderWidth: 4,
    borderColor: '#E0F7FA',
  },
  modalName: {
    fontSize: 24,
    fontWeight: '800',
    color: '#1A1A1A',
    marginBottom: 5,
  },
  modalTitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 10,
  },
  modalCompanyBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E0F7FA',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
    gap: 6,
  },
  modalCompanyText: {
    fontSize: 14,
    color: '#0097A7',
    fontWeight: '700',
  },
  bioContainer: {
    backgroundColor: '#F8F9FA',
    padding: 15,
    borderRadius: 15,
    marginBottom: 25,
  },
  bioTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#333',
    marginBottom: 8,
  },
  bioText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 22,
  },
  modalActionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 15,
  },
  modalMainBtn: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: '#00BCD4',
    paddingVertical: 14,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 15,
    elevation: 3,
    shadowColor: '#00BCD4',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    gap: 8,
  },
  modalMainBtnText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '700',
  },
  modalSecBtns: {
    flexDirection: 'row',
    gap: 12,
  },
  modalIconBtn: {
    width: 50,
    height: 50,
    backgroundColor: '#F0F0F0',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 25,
  },
});
