import React from 'react';
import { StyleSheet, View, Text, FlatList, TouchableOpacity, SafeAreaView, Platform, StatusBar } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { LogOut } from 'lucide-react-native';
import { ConfirmModal } from '../../components/ConfirmModal';
import { useTheme } from '../../context/ThemeContext';
import { useGroupDetail } from '../../hooks/useGroupDetail';

import { GroupHeader } from '../../components/group-detail/GroupHeader';
import { GroupProfileSection } from '../../components/group-detail/GroupProfileSection';
import { GroupMembersHeader } from '../../components/group-detail/GroupMembersHeader';
import { GroupMemberItem } from '../../components/group-detail/GroupMemberItem';

export default function GroupDetailScreen() {
  const { id, title, type } = useLocalSearchParams();
  const router = useRouter();
  const { isDarkMode } = useTheme();

  const {
    members,
    filteredMembers,
    isLoading,
    groupName,
    isEditingName,
    setIsEditingName,
    newName,
    setNewName,
    currentUser,
    isAdminUser,
    isSearching,
    setIsSearching,
    searchQuery,
    setSearchQuery,
    isLeaveModalVisible,
    setIsLeaveModalVisible,
    isRemoveModalVisible,
    setIsRemoveModalVisible,
    memberToRemove,
    setMemberToRemove,
    fetchMembers,
    handleUpdateName,
    handleRemoveMember,
    confirmRemoveMember,
    handleLeaveGroup,
    confirmLeaveGroup,
    handleMemberClick,
  } = useGroupDetail(id as string, title as string, type as string);

  return (
    <SafeAreaView style={[styles.container, isDarkMode && styles.containerDark]}>
      <StatusBar barStyle={isDarkMode ? "light-content" : "dark-content"} />
      
      <GroupHeader type={type as string} />

      <FlatList
        data={filteredMembers}
        keyExtractor={(item) => item.id}
        renderItem={({ item, index }) => (
          <GroupMemberItem
            item={item}
            isLast={index === filteredMembers.length - 1}
            currentUser={currentUser}
            isAdminUser={isAdminUser}
            onMemberClick={handleMemberClick}
            onRemoveMember={handleRemoveMember}
          />
        )}
        ListHeaderComponent={() => (
          <>
            <GroupProfileSection
              type={type as string}
              membersCount={members.length}
              groupName={groupName}
              isEditingName={isEditingName}
              newName={newName}
              setNewName={setNewName}
              setIsEditingName={setIsEditingName}
              onUpdateName={handleUpdateName}
            />

            <GroupMembersHeader
              membersCount={members.length}
              isSearching={isSearching}
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              setIsSearching={setIsSearching}
              hasNoMembers={filteredMembers.length === 0}
              isAdminUser={isAdminUser}
              onAddMember={() => {
                // @ts-ignore
                router.push({ pathname: '/new-chat', params: { groupId: id } });
              }}
            />
          </>
        )}
        ListFooterComponent={() => (
          <View style={styles.footer}>
            <TouchableOpacity style={[styles.leaveRow, isDarkMode && styles.cardDark]} onPress={handleLeaveGroup}>
              <LogOut color="#FF3B30" size={22} />
              <Text style={styles.leaveText}>{type === 'channel' ? 'Keluar Channel' : 'Keluar Grup'}</Text>
            </TouchableOpacity>
            <View style={{ height: 50 }} />
          </View>
        )}
        refreshing={isLoading}
        onRefresh={fetchMembers}
        contentContainerStyle={styles.listContent}
      />

      <ConfirmModal
        visible={isLeaveModalVisible}
        onClose={() => setIsLeaveModalVisible(false)}
        onConfirm={confirmLeaveGroup}
        title={type === 'channel' ? "Keluar Channel" : "Keluar Grup"}
        message={`Apakah Anda yakin ingin keluar dari ${type === 'channel' ? 'channel' : 'grup'} ini?`}
        confirmText="Keluar"
        type="destructive"
      />

      <ConfirmModal
        visible={isRemoveModalVisible}
        onClose={() => {
          setIsRemoveModalVisible(false);
          setMemberToRemove(null);
        }}
        onConfirm={confirmRemoveMember}
        title="Hapus Anggota"
        message={`Apakah Anda yakin ingin menghapus ${memberToRemove?.name} dari ${type === 'channel' ? 'channel' : 'grup'} ini?`}
        confirmText="Hapus"
        type="destructive"
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F0F2F5',
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  containerDark: {
    backgroundColor: '#121212',
  },
  footer: {
    marginTop: 10,
  },
  leaveRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    backgroundColor: '#FFF',
    marginHorizontal: 15,
    marginTop: 10,
    borderRadius: 20,
  },
  cardDark: {
    backgroundColor: '#1E1E1E',
  },
  leaveText: {
    fontSize: 16,
    color: '#FF3B30',
    marginLeft: 15,
    fontWeight: '500',
  },
  listContent: {
    paddingBottom: 20,
  },
});
