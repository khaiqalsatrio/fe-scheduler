import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, Image, ScrollView, Platform, StatusBar } from 'react-native';
import { useRouter } from 'expo-router';
import { X, User, CreditCard, Bell, History, LogOut, ChevronRight } from 'lucide-react-native';

export default function ProfileScreen() {
  const router = useRouter();

  const handleBack = () => {
    router.back();
  };

  const handleLogout = () => {
    // Navigate back to the onboarding/root
    router.replace('/');
  };

  const MenuListItem = ({ icon, title, description, isLast = false }: { icon: any, title: string, description: string, isLast?: boolean }) => (
    <TouchableOpacity
      style={[styles.menuItem, isLast && styles.noBorder]}
      activeOpacity={0.7}
    >
      <View style={styles.menuIconContainer}>
        {icon}
      </View>
      <View style={styles.menuTextContainer}>
        <Text style={styles.menuTitle}>{title}</Text>
        <Text style={styles.menuDescription}>{description}</Text>
      </View>
      <ChevronRight size={20} color="#CCC" />
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.container}>
        {/* HEADER */}
        <View style={styles.header}>
          <TouchableOpacity onPress={handleBack} style={styles.closeButton}>
            <X size={28} color="#000" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Profile</Text>
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          {/* USER INFO */}
          <View style={styles.userInfoSection}>
            <Image
              source={{ uri: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=500&q=80' }}
              style={styles.avatar}
            />
            <View style={styles.userTextContainer}>
              <Text style={styles.userName}>Khaiqal Satrio</Text>
              <Text style={styles.userPhone}>+62 812-3456-7890</Text>
            </View>
          </View>

          {/* MENU CARD */}
          <View style={styles.menuCard}>
            <MenuListItem
              icon={<User size={22} color="#999" />}
              title="Personal Data"
              description="Edit nama, email, alamat"
            />
            <MenuListItem
              icon={<CreditCard size={22} color="#999" />}
              title="Bank Account"
              description="Untuk reimbursement klaim"
            />
            <MenuListItem
              icon={<Bell size={22} color="#999" />}
              title="Notifications"
              description="Atur preferensi notifikasi"
            />
            <MenuListItem
              icon={<History size={22} color="#999" />}
              title="Payment History"
              description="Riwayat pembayaran premi"
              isLast={true}
            />
          </View>

          {/* LOGOUT BUTTON */}
          <TouchableOpacity
            style={styles.logoutButton}
            activeOpacity={0.8}
            onPress={handleLogout}
          >
            <LogOut size={20} color="#E53935" />
            <Text style={styles.logoutText}>Log Out</Text>
          </TouchableOpacity>

          {/* APP VERSION */}
          <View style={styles.footer}>
            <Text style={styles.versionText}>App Version 2.4.0 (Build 20240219)</Text>
          </View>
        </ScrollView>
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
    backgroundColor: '#FAFBFC', // Very light grey background
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 15,
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  closeButton: {
    padding: 5,
    marginRight: 15,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#000',
  },
  scrollContent: {
    paddingHorizontal: 15,
    paddingTop: 20,
    paddingBottom: 40,
  },
  userInfoSection: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    padding: 15,
    borderRadius: 15,
    marginBottom: 25,
    // Add subtle shadow for iOS
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    // Add elevation for Android
    elevation: 2,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#F0F0F0',
  },
  userTextContainer: {
    marginLeft: 15,
  },
  userName: {
    fontSize: 20,
    fontWeight: '800',
    color: '#000',
    marginBottom: 4,
  },
  userPhone: {
    fontSize: 14,
    color: '#999',
    fontWeight: '500',
  },
  menuCard: {
    backgroundColor: '#FFF',
    borderRadius: 15,
    overflow: 'hidden',
    marginBottom: 30,
    // Shadow/Elevation
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F5F5F5',
  },
  noBorder: {
    borderBottomWidth: 0,
  },
  menuIconContainer: {
    width: 24,
    alignItems: 'center',
    marginRight: 15,
  },
  menuTextContainer: {
    flex: 1,
  },
  menuTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#000',
    marginBottom: 2,
  },
  menuDescription: {
    fontSize: 12,
    color: '#999',
    fontWeight: '500',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 12,
    paddingVertical: 14,
    marginBottom: 30,
    gap: 10,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#E53935',
  },
  footer: {
    alignItems: 'center',
  },
  versionText: {
    fontSize: 12,
    color: '#BBB',
    fontWeight: '500',
  },
});
