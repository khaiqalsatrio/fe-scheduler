import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, Image, ScrollView, Platform, StatusBar, ActivityIndicator, Modal, TextInput, Alert, Switch } from 'react-native';
import { useRouter } from 'expo-router';
import { X, User, Bell, LogOut, ChevronRight, Camera, Lock, Eye, EyeOff, Moon, Sun } from 'lucide-react-native';
import AuthService from '../services/authService';
import * as ImagePicker from 'expo-image-picker';
import { CONFIG } from '../constants/Config';
import { useTheme } from '../context/ThemeContext';

export default function ProfileScreen() {
  const router = useRouter();
  const { isDarkMode, setTheme } = useTheme();

  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const [isPasswordModalVisible, setIsPasswordModalVisible] = useState(false);
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);

  const [userData, setUserData] = useState({
    name: 'Loading...',
    email: 'loading@example.com',
    position: 'Please wait...',
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=500&q=80',
    nik: '',
    username: '',
    phone: '',
    company: ''
  });

  const [isPersonalDataModalVisible, setIsPersonalDataModalVisible] = useState(false);
  const [personalDataForm, setPersonalDataForm] = useState({
    name: '',
    email: '',
    username: '',
    phone: '',
    nik: '',
    position: ''
  });
  const [isUpdatingPersonalData, setIsUpdatingPersonalData] = useState(false);

  const openPersonalDataModal = () => {
    setPersonalDataForm({
      name: userData.name !== 'Loading...' && userData.name !== 'ACCOUNT' ? userData.name : '',
      email: userData.email !== 'loading@example.com' && userData.email !== 'Masuk untuk sinkronisasi data' ? userData.email : '',
      username: userData.username || '',
      phone: userData.phone || '',
      nik: userData.nik || '',
      position: userData.position !== 'Please wait...' && userData.position !== 'guest' ? userData.position : ''
    });
    setIsPersonalDataModalVisible(true);
  };

  const getAvatarUrl = (avatarStr: string) => {
    if (!avatarStr) return 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=500&q=80';
    if (avatarStr.startsWith('/')) {
      return `${CONFIG.API_BASE_URL}${avatarStr}`;
    }
    return avatarStr;
  };

  const handlePickAvatar = async () => {
    if (!isLoggedIn) return;

    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const selectedAsset = result.assets[0];

        setIsUploading(true);
        const uriParts = selectedAsset.uri.split('/');
        const fileName = selectedAsset.fileName || uriParts[uriParts.length - 1] || 'avatar.jpg';
        const mimeType = selectedAsset.mimeType || 'image/jpeg';

        const response = await AuthService.updateAvatar(selectedAsset.uri, mimeType, fileName);

        if (response && response.avatar) {
          setUserData(prev => ({ ...prev, avatar: response.avatar }));
        }
      }
    } catch (error) {
      console.error('Error uploading avatar:', error);
    } finally {
      setIsUploading(false);
    }
  };

  useEffect(() => {
    const fetchUser = async () => {
      const user = await AuthService.getCurrentUser();
      if (user) {
        setIsLoggedIn(true);
        setUserData(user);
      } else {
        setIsLoggedIn(false);
        setUserData({
          name: 'ACCOUNT',
          email: 'Masuk untuk sinkronisasi data',
          position: 'guest',
          avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=500&q=80',
          nik: '',
          username: '',
          phone: '',
          company: ''
        });
      }
    };
    fetchUser();
  }, []);

  const handleBack = () => {
    router.back();
  };

  const handleLogout = async () => {
    try {
      await AuthService.logout();
      router.replace('/');
    } catch (e) {
      console.error('Logout error:', e);
    }
  };

  const handleLogin = () => {
    router.replace('/');
  };

  const handleUpdatePassword = async () => {
    if (!oldPassword || !newPassword) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    setIsUpdatingPassword(true);
    try {
      await AuthService.updatePassword(oldPassword, newPassword);
      Alert.alert('Success', 'Password updated successfully');
      setIsPasswordModalVisible(false);
      setOldPassword('');
      setNewPassword('');
    } catch (error: any) {
      Alert.alert('Error', error?.response?.data?.message || 'Failed to update password');
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  const handleUpdatePersonalData = async () => {
    setIsUpdatingPersonalData(true);
    try {
      await AuthService.updateCurrentUser(personalDataForm);
      Alert.alert('Success', 'Personal data updated successfully');
      setUserData(prev => ({ ...prev, ...personalDataForm }));
      setIsPersonalDataModalVisible(false);
    } catch (error: any) {
      Alert.alert('Error', error?.response?.data?.message || 'Failed to update personal data');
    } finally {
      setIsUpdatingPersonalData(false);
    }
  };

  const MenuListItem = ({ icon, title, description, isLast = false, onPress, rightElement }: { icon: any, title: string, description?: string, isLast?: boolean, onPress?: () => void, rightElement?: React.ReactNode }) => (
    <TouchableOpacity
      style={[styles.menuItem, isDarkMode && styles.menuItemDark, isLast && styles.noBorder]}
      activeOpacity={onPress ? 0.7 : 1}
      onPress={onPress}
    >
      <View style={styles.menuIconContainer}>
        {icon}
      </View>
      <View style={styles.menuTextContainer}>
        <Text style={[styles.menuTitle, isDarkMode && styles.textDark]}>{title}</Text>
        {description && <Text style={styles.menuDescription}>{description}</Text>}
      </View>
      {rightElement ? rightElement : (onPress ? <ChevronRight size={18} color={isDarkMode ? "#666" : "#CCC"} /> : null)}
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={[styles.safeArea, isDarkMode && styles.safeAreaDark]}>
      <StatusBar barStyle={isDarkMode ? "light-content" : "dark-content"} />
      <View style={[styles.container, isDarkMode && styles.containerDark]}>
        {/* HEADER */}
        <View style={[styles.header, isDarkMode && styles.headerDark]}>
          <TouchableOpacity onPress={handleBack} style={styles.closeButton}>
            <X size={28} color={isDarkMode ? "#FFF" : "#000"} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, isDarkMode && styles.textDark]}>Profile</Text>
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          {/* USER INFO */}
          <View style={styles.userInfoSection}>
            <TouchableOpacity
              onPress={handlePickAvatar}
              disabled={isUploading || !isLoggedIn}
              style={styles.avatarContainer}
              activeOpacity={0.8}
            >
              <Image
                source={{ uri: getAvatarUrl(userData.avatar) }}
                style={styles.avatar}
              />
              {isLoggedIn && (
                <View style={styles.editAvatarBadge}>
                  <Camera size={16} color="#FFF" />
                </View>
              )}
              {isUploading && (
                <View style={styles.uploadingOverlay}>
                  <ActivityIndicator size="small" color="#FFF" />
                </View>
              )}
            </TouchableOpacity>
            <View style={styles.userTextContainer}>
              <Text style={[styles.userName, isDarkMode && styles.textDark]}>{userData.name}</Text>
              <Text style={styles.userPhone}>@{userData.username || userData.email.split('@')[0]}</Text>
            </View>
          </View>

          <Text style={styles.sectionTitle}>PREFERENCES</Text>
          {/* MENU CARD */}
          <View style={[styles.menuCard, isDarkMode && styles.menuCardDark]}>
            <MenuListItem
              icon={<User size={20} color={isDarkMode ? "#FFF" : "#000"} />}
              title="Personal Data"
              description="Edit nama, email, alamat"
              onPress={isLoggedIn ? openPersonalDataModal : undefined}
            />
            {isLoggedIn && (
              <MenuListItem
                icon={<Lock size={20} color={isDarkMode ? "#FFF" : "#000"} />}
                title="Update Password"
                description="Ubah kata sandi akun"
                onPress={() => setIsPasswordModalVisible(true)}
              />
            )}
            <MenuListItem
              icon={isDarkMode ? <Moon size={20} color="#FFF" /> : <Sun size={20} color="#000" />}
              title="Dark Mode"
              description="Tema gelap aplikasi"
              rightElement={
                <Switch
                  value={isDarkMode}
                  onValueChange={(value) => setTheme(value ? 'dark' : 'light')}
                  trackColor={{ false: "#767577", true: "#0F9D58" }}
                  thumbColor={isDarkMode ? "#FFF" : "#f4f3f4"}
                />
              }
            />
            <MenuListItem
              icon={<Bell size={20} color={isDarkMode ? "#FFF" : "#000"} />}
              title="Notifications"
              description="Atur preferensi notifikasi"
              isLast={true}
            />
          </View>

          {/* AUTH BUTTON */}
          {isLoggedIn ? (
            <TouchableOpacity
              style={[styles.logoutButton, isDarkMode && styles.logoutButtonDark]}
              activeOpacity={0.8}
              onPress={handleLogout}
            >
              <LogOut size={20} color="#E53935" />
              <Text style={styles.logoutText}>LOG OUT</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={[styles.logoutButton, isDarkMode ? styles.logoutButtonDarkOutline : { borderColor: '#000' }]}
              activeOpacity={0.8}
              onPress={handleLogin}
            >
              <User size={20} color={isDarkMode ? "#FFF" : "#000"} />
              <Text style={[styles.logoutText, isDarkMode ? { color: '#FFF' } : { color: '#000' }]}>LOG IN</Text>
            </TouchableOpacity>
          )}

          {/* APP VERSION */}
          <View style={styles.footer}>
            <Text style={styles.versionText}>Version 2.4.0 (2024)</Text>
          </View>
        </ScrollView>

        {/* PASSWORD MODAL */}
        <Modal
          visible={isPasswordModalVisible}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setIsPasswordModalVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={[styles.modalContent, isDarkMode && styles.modalContentDark]}>
              <Text style={[styles.modalTitle, isDarkMode && styles.textDark]}>Update Password</Text>

              <View style={[styles.inputContainer, isDarkMode && styles.inputContainerDark]}>
                <TextInput
                  style={[styles.modalInput, isDarkMode && styles.textDark]}
                  placeholder="Old Password"
                  secureTextEntry={!showOldPassword}
                  value={oldPassword}
                  onChangeText={setOldPassword}
                  placeholderTextColor="#999"
                />
                <TouchableOpacity style={styles.eyeIcon} onPress={() => setShowOldPassword(!showOldPassword)}>
                  {showOldPassword ? <EyeOff size={20} color="#999" /> : <Eye size={20} color="#999" />}
                </TouchableOpacity>
              </View>

              <View style={[styles.inputContainer, isDarkMode && styles.inputContainerDark]}>
                <TextInput
                  style={[styles.modalInput, isDarkMode && styles.textDark]}
                  placeholder="New Password"
                  secureTextEntry={!showNewPassword}
                  value={newPassword}
                  onChangeText={setNewPassword}
                  placeholderTextColor="#999"
                />
                <TouchableOpacity style={styles.eyeIcon} onPress={() => setShowNewPassword(!showNewPassword)}>
                  {showNewPassword ? <EyeOff size={20} color="#999" /> : <Eye size={20} color="#999" />}
                </TouchableOpacity>
              </View>

              <View style={styles.modalActions}>
                <TouchableOpacity
                  style={[styles.modalButton, styles.cancelButton]}
                  onPress={() => {
                    setIsPasswordModalVisible(false);
                    setOldPassword('');
                    setNewPassword('');
                  }}
                  disabled={isUpdatingPassword}
                >
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.modalButton, styles.saveButton]}
                  onPress={handleUpdatePassword}
                  disabled={isUpdatingPassword}
                >
                  {isUpdatingPassword ? (
                    <ActivityIndicator size="small" color="#FFF" />
                  ) : (
                    <Text style={styles.saveButtonText}>Update</Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

        {/* PERSONAL DATA MODAL */}
        <Modal
          visible={isPersonalDataModalVisible}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setIsPersonalDataModalVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={[styles.modalContent, { maxHeight: '80%' }, isDarkMode && styles.modalContentDark]}>
              <Text style={[styles.modalTitle, isDarkMode && styles.textDark]}>Personal Data</Text>

              <ScrollView style={{ width: '100%', marginBottom: 15 }} showsVerticalScrollIndicator={false}>
                <Text style={[styles.inputLabel, isDarkMode && styles.textDark]}>Name</Text>
                <View style={[styles.inputContainer, isDarkMode && styles.inputContainerDark]}>
                  <TextInput
                    style={[styles.modalInput, isDarkMode && styles.textDark]}
                    placeholder="Full Name"
                    value={personalDataForm.name}
                    onChangeText={(text) => setPersonalDataForm(prev => ({ ...prev, name: text }))}
                    placeholderTextColor="#999"
                  />
                </View>

                <Text style={[styles.inputLabel, isDarkMode && styles.textDark]}>Email</Text>
                <View style={[styles.inputContainer, isDarkMode && styles.inputContainerDark]}>
                  <TextInput
                    style={[styles.modalInput, isDarkMode && styles.textDark]}
                    placeholder="Email Address"
                    value={personalDataForm.email}
                    onChangeText={(text) => setPersonalDataForm(prev => ({ ...prev, email: text }))}
                    placeholderTextColor="#999"
                    keyboardType="email-address"
                    autoCapitalize="none"
                  />
                </View>

                <Text style={[styles.inputLabel, isDarkMode && styles.textDark]}>Username</Text>
                <View style={[styles.inputContainer, isDarkMode && styles.inputContainerDark]}>
                  <TextInput
                    style={[styles.modalInput, isDarkMode && styles.textDark]}
                    placeholder="Username"
                    value={personalDataForm.username}
                    onChangeText={(text) => setPersonalDataForm(prev => ({ ...prev, username: text }))}
                    placeholderTextColor="#999"
                    autoCapitalize="none"
                  />
                </View>

                <Text style={[styles.inputLabel, isDarkMode && styles.textDark]}>Phone Number</Text>
                <View style={[styles.inputContainer, isDarkMode && styles.inputContainerDark]}>
                  <TextInput
                    style={[styles.modalInput, isDarkMode && styles.textDark]}
                    placeholder="Phone Number"
                    value={personalDataForm.phone}
                    onChangeText={(text) => setPersonalDataForm(prev => ({ ...prev, phone: text }))}
                    placeholderTextColor="#999"
                    keyboardType="phone-pad"
                  />
                </View>

                <Text style={[styles.inputLabel, isDarkMode && styles.textDark]}>NIK</Text>
                <View style={[styles.inputContainer, isDarkMode && styles.inputContainerDark]}>
                  <TextInput
                    style={[styles.modalInput, isDarkMode && styles.textDark]}
                    placeholder="National ID (NIK)"
                    value={personalDataForm.nik}
                    onChangeText={(text) => setPersonalDataForm(prev => ({ ...prev, nik: text }))}
                    placeholderTextColor="#999"
                    keyboardType="numeric"
                  />
                </View>

                <Text style={[styles.inputLabel, isDarkMode && styles.textDark]}>Position</Text>
                <View style={[styles.inputContainer, isDarkMode && styles.inputContainerDark]}>
                  <TextInput
                    style={[styles.modalInput, isDarkMode && styles.textDark]}
                    placeholder="Job Position"
                    value={personalDataForm.position}
                    onChangeText={(text) => setPersonalDataForm(prev => ({ ...prev, position: text }))}
                    placeholderTextColor="#999"
                  />
                </View>
              </ScrollView>

              <View style={styles.modalActions}>
                <TouchableOpacity
                  style={[styles.modalButton, styles.cancelButton]}
                  onPress={() => setIsPersonalDataModalVisible(false)}
                  disabled={isUpdatingPersonalData}
                >
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.modalButton, styles.saveButton]}
                  onPress={handleUpdatePersonalData}
                  disabled={isUpdatingPersonalData}
                >
                  {isUpdatingPersonalData ? (
                    <ActivityIndicator size="small" color="#FFF" />
                  ) : (
                    <Text style={styles.saveButtonText}>Save</Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeAreaDark: {
    backgroundColor: '#121212',
  },
  containerDark: {
    backgroundColor: '#121212',
  },
  headerDark: {
    backgroundColor: '#121212',
    borderBottomColor: '#222',
  },
  textDark: {
    color: '#FFF',
  },
  menuCardDark: {
    backgroundColor: '#1E1E1E',
    borderColor: '#333',
  },
  menuItemDark: {
    borderBottomColor: '#333',
  },
  logoutButtonDark: {
    backgroundColor: '#1E1E1E',
    borderColor: '#333',
  },
  logoutButtonDarkOutline: {
    backgroundColor: 'transparent',
    borderColor: '#FFF',
  },
  modalContentDark: {
    backgroundColor: '#1E1E1E',
  },
  inputContainerDark: {
    backgroundColor: '#121212',
    borderColor: '#333',
  },
  safeArea: {
    flex: 1,
    backgroundColor: '#FFF',
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  container: {
    flex: 1,
    backgroundColor: '#FFF',
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
    paddingHorizontal: 20,
    paddingTop: 40,
    paddingBottom: 40,
  },
  userInfoSection: {
    alignItems: 'center',
    marginBottom: 40,
  },
  avatarContainer: {
    position: 'relative',
    width: 120,
    height: 120,
    marginBottom: 15,
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    backgroundColor: '#F0F0F0',
  },
  editAvatarBadge: {
    position: 'absolute',
    bottom: -8,
    right: -8,
    backgroundColor: '#000',
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#FFF',
  },
  uploadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  userTextContainer: {
    alignItems: 'center',
  },
  userName: {
    fontSize: 26,
    fontWeight: '700',
    color: '#000',
    marginBottom: 4,
  },
  userPhone: {
    fontSize: 16,
    color: '#888',
    fontWeight: '400',
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#666',
    letterSpacing: 1.5,
    marginBottom: 10,
    marginLeft: 5,
  },
  menuCard: {
    backgroundColor: '#FFF',
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#E5E5E5',
    marginBottom: 40,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
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
    fontSize: 15,
    fontWeight: '500',
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
    borderRadius: 2,
    paddingVertical: 16,
    marginBottom: 20,
    gap: 10,
  },
  logoutText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#E53935',
    letterSpacing: 1,
  },
  footer: {
    alignItems: 'center',
  },
  versionText: {
    fontSize: 12,
    color: '#BBB',
    fontWeight: '400',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#FFF',
    width: '85%',
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#000',
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 6,
    marginLeft: 4,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 12,
    paddingHorizontal: 15,
    marginBottom: 15,
    width: '100%',
    height: 50,
  },
  modalInput: {
    flex: 1,
    fontSize: 16,
    color: '#000',
  },
  eyeIcon: {
    padding: 5,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: 10,
    gap: 10,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButton: {
    backgroundColor: '#F5F5F5',
  },
  saveButton: {
    backgroundColor: '#0F9D58',
  },
  cancelButtonText: {
    color: '#666',
    fontWeight: '600',
    fontSize: 16,
  },
  saveButtonText: {
    color: '#FFF',
    fontWeight: '600',
    fontSize: 16,
  },
});
