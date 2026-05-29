import { StyleSheet, View, Text, TextInput, FlatList, TouchableOpacity, Image, ScrollView } from 'react-native';
import React from 'react';
import { Search, MoreHorizontal, MoreVertical, Calendar, Gift, Wand2 } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function MediaScreen() {
  const insets = useSafeAreaInsets();
  
  const documents = [
    { id: '1', title: 'Workshop_day1_AICOE', info: '2MB, Modified in Olah Rasio Room by Rafi...' },
    { id: '2', title: 'Workshop_day1_AICOE', info: '2MB, Modified in Olah Rasio Room by Rafi...' },
    { id: '3', title: 'Workshop_day1_AICOE', info: '2MB, Modified in Olah Rasio Room by Rafi...' },
  ];

  const actions = [
    { id: '1', title: 'Rekap presentasi narasumber', icon: Calendar },
    { id: '2', title: 'Buatkan laporan kegiatan', icon: Gift },
    { id: '3', title: 'Buatkan MoM diskusi', icon: Wand2 },
  ];

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.logoContainer}>
          <Image
            source={require('../../assets/images/logo.png')}
            style={styles.logoImage}
          />
          <Text style={styles.headerTitle}>ChatAja!</Text>
        </View>
        <TouchableOpacity style={styles.menuButton}>
          <MoreHorizontal color="#000" size={20} />
        </TouchableOpacity>
      </View>

      {/* Search Bar / Ask Agent */}
      <TouchableOpacity 
        style={styles.searchContainer}
        activeOpacity={0.8}
      >
        <Search color="#9CA3AF" size={18} />
        <Text style={styles.searchText}>Ask ChatAja Agent</Text>
      </TouchableOpacity>
      
      <ScrollView>
        {/* Document List */}
        <View style={styles.docList}>
          {documents.map((doc) => (
            <View key={doc.id} style={styles.docItem}>
              <View style={styles.pdfIconContainer}>
                <Text style={styles.pdfIconText}>PDF</Text>
              </View>
              <View style={styles.docInfo}>
                <Text style={styles.docTitle}>{doc.title}</Text>
                <Text style={styles.docSubtitle} numberOfLines={1}>{doc.info}</Text>
              </View>
              <TouchableOpacity style={styles.docMoreBtn}>
                <MoreVertical color="#000" size={18} />
              </TouchableOpacity>
            </View>
          ))}
        </View>

        {/* Action Section */}
        <View style={styles.actionSection}>
          <Text style={styles.sectionTitle}>Buat Dokumen</Text>
          {actions.map((action, index) => {
            const Icon = action.icon;
            return (
              <TouchableOpacity key={action.id} style={[styles.actionItem, index !== actions.length - 1 && styles.actionItemBorder]}>
                <Icon color="#E06B32" size={18} style={styles.actionIcon} />
                <Text style={styles.actionText}>{action.title}</Text>
              </TouchableOpacity>
            )
          })}
        </View>
      </ScrollView>

      {/* Floating Robot Mascot FAB */}
      <TouchableOpacity 
        style={styles.floatingMascot} 
        activeOpacity={0.8}
      >
        <Image
          source={require('../../assets/images/Adobe Express - file (11) 1.png')}
          style={styles.mascotFabImage}
          resizeMode="contain"
        />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  logoImage: {
    width: 32,
    height: 32,
    borderRadius: 16,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#000',
  },
  menuButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    marginHorizontal: 20,
    marginBottom: 16,
    paddingHorizontal: 16,
    height: 44,
    borderRadius: 22,
    gap: 8,
  },
  searchText: {
    color: '#9CA3AF',
    fontSize: 14,
    fontWeight: '500',
  },
  docList: {
    paddingHorizontal: 16,
    marginBottom: 10,
  },
  docItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  pdfIconContainer: {
    width: 36,
    height: 44,
    backgroundColor: '#DE3B32',
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  pdfIconText: {
    color: '#FFF',
    fontSize: 10,
    fontWeight: 'bold',
  },
  docInfo: {
    flex: 1,
    paddingRight: 10,
  },
  docTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111',
    marginBottom: 4,
  },
  docSubtitle: {
    fontSize: 12,
    color: '#888',
  },
  docMoreBtn: {
    padding: 4,
  },
  actionSection: {
    marginTop: 10,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#9CA3AF',
    marginBottom: 4,
  },
  actionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
  },
  actionItemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  actionIcon: {
    marginRight: 12,
  },
  actionText: {
    fontSize: 14,
    color: '#374151',
  },
  floatingMascot: {
    position: 'absolute',
    bottom: 24,
    right: 16,
    width: 80,
    height: 80,
    zIndex: 10,
  },
  mascotFabImage: {
    width: '100%',
    height: '100%',
  }
});
