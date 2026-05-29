import React, { useState } from 'react';
import { useRouter } from 'expo-router';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Platform,
  StatusBar,
  ActivityIndicator,
  RefreshControl,
  Alert,
  Image,
} from 'react-native';
import { Sparkle, AlertCircle, Search, MoreHorizontal, Plus } from 'lucide-react-native';

// Custom Hooks & Utils
import { useAgenda } from '../../hooks/useAgenda';
import { formatTimeRange } from '../../utils/dateFormatter';

// Components
import { DaySelector } from '../../components/agenda/DaySelector';
import { ActivityCard } from '../../components/agenda/ActivityCard';
import { AddActivityModal } from '../../components/agenda/AddActivityModal';
import { AIAssistantModal } from '../../components/agenda/AIAssistantModal';

const DAYS = [
  { id: 1, label: 'S', date: '18' },
  { id: 2, label: 'R', date: '19' },
  { id: 3, label: 'K', date: '20' },
  { id: 4, label: 'J', date: '21' },
  { id: 5, label: 'S', date: '22' },
  { id: 6, label: 'M', date: '23' },
  { id: 7, label: 'S', date: '24' },
];

const HOURS = [
  '06 AM', '07 AM', '08 AM', '09 AM', '10 AM', '11 AM', '12 PM', 
  '01 PM', '02 PM', '03 PM', '04 PM', '05 PM', '06 PM', '07 PM', 
  '08 PM', '09 PM', '10 PM'
];

export default function AgendaScreen() {
  const router = useRouter();
  const {
    activities,
    agendas,
    loading,
    refreshing,
    isSaving,
    error,
    fetchAgendas,
    saveActivity,
    deleteAgenda,
    setAgendas,
  } = useAgenda();

  // Local UI State
  const [selectedDay, setSelectedDay] = useState(4); // Default to J 21
  const [isAIModalVisible, setIsAIModalVisible] = useState(false);
  const [isAddModalVisible, setIsAddModalVisible] = useState(false);
  const [activityTitle, setActivityTitle] = useState('');
  const [activityNotes, setActivityNotes] = useState('');
  const [selectedTimeSlot, setSelectedTimeSlot] = useState('');

  const handleSaveActivity = async () => {
    const success = await saveActivity(activityTitle, activityNotes, selectedDay, selectedTimeSlot);
    if (success) {
      Alert.alert('Sukses', 'Agenda berhasil ditambahkan');
      setIsAddModalVisible(false);
      setActivityTitle('');
      setActivityNotes('');
    }
  };

  const handleAddSuggestion = async (activity: any) => {
    const success = await saveActivity(
      activity.title,
      'Ditambahkan dari Saran AI',
      selectedDay,
      activity.time
    );
    if (success) {
      setAgendas(prev => prev.filter(item => item.id !== activity.id));
      Alert.alert('Sukses', 'Agenda saran AI berhasil ditambahkan');
    }
  };

  const handleReplaceSuggestion = (activity: any) => {
    setAgendas(prev => prev.map(item => {
      if (item.id === activity.id) {
        return {
          ...item,
          title: 'Sarapan: Kupat Tahu Gempol',
          location: 'Jl. Gempol Kulon No.51',
        };
      }
      return item;
    }));
  };

  const handleDismissSuggestion = (id: string) => {
    deleteAgenda(id);
  };

  const handleSendToAI = () => {
    setIsAIModalVisible(false);
    router.push('/chats');
  };

  const getFilteredActivitiesForHour = (hour: string) => {
    const hourActivities = activities[hour] || [];
    
    const dayOffset = selectedDay - 1;
    const baseDate = new Date('2026-04-08T00:00:00Z');
    baseDate.setUTCDate(baseDate.getUTCDate() + dayOffset);
    const targetDateStr = baseDate.toISOString().split('T')[0];

    return hourActivities.filter(activity => {
      const originalItem = agendas.find(item => item.id === activity.id);
      if (!originalItem) return false;
      const itemDateStr = (originalItem.start_at || originalItem.created_at || '').split('T')[0];
      return itemDateStr === targetDateStr;
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />

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
        onPress={() => setIsAIModalVisible(true)}
        activeOpacity={0.8}
      >
        <Search color="#9CA3AF" size={18} />
        <Text style={styles.searchText}>Ask ChatAja Agent</Text>
      </TouchableOpacity>

      {/* Day Selector */}
      <DaySelector 
        days={DAYS} 
        selectedDay={selectedDay} 
        onSelectDay={setSelectedDay} 
      />

      {/* Timeline */}
      <ScrollView 
        style={styles.timelineContainer} 
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={() => fetchAgendas(true)} />
        }
      >
        {loading && !refreshing ? (
          <View style={styles.centerContainer}>
            <ActivityIndicator size="large" color="#10B981" />
            <Text style={styles.loadingText}>Memuat kegiatan...</Text>
          </View>
        ) : error && agendas.length === 0 ? (
          <View style={styles.centerContainer}>
            <AlertCircle size={48} color="#EF4444" />
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity style={styles.retryButton} onPress={() => fetchAgendas()}>
              <Text style={styles.retryButtonText}>Coba Lagi</Text>
            </TouchableOpacity>
          </View>
        ) : (
          HOURS.map((hour) => {
            const hourActivities = getFilteredActivitiesForHour(hour);
            return (
              <View key={hour} style={styles.hourRow}>
                <View style={styles.hourLabelItem}>
                  <Text style={styles.hourText}>{hour}</Text>
                </View>

                <View style={styles.hourContent}>
                  {hourActivities.length > 0 ? (
                    hourActivities.map((activity) => (
                      <ActivityCard 
                        key={activity.id} 
                        activity={activity} 
                        onDelete={deleteAgenda} 
                        onAddSuggestion={handleAddSuggestion}
                        onDismissSuggestion={handleDismissSuggestion}
                        onReplaceSuggestion={handleReplaceSuggestion}
                      />
                    ))
                  ) : (
                    <TouchableOpacity 
                      style={styles.emptySlot}
                      onPress={() => {
                        setSelectedTimeSlot(formatTimeRange(hour));
                        setIsAddModalVisible(true);
                      }}
                    >
                      <Plus size={16} color="#9CA3AF" style={{ marginRight: 4 }} />
                      <Text style={styles.emptySlotText}>Tambah aktivitas</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            );
          })
        )}
        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Modals */}
      <AddActivityModal 
        isVisible={isAddModalVisible}
        onClose={() => setIsAddModalVisible(false)}
        selectedTimeSlot={selectedTimeSlot}
        activityTitle={activityTitle}
        setActivityTitle={setActivityTitle}
        activityNotes={activityNotes}
        setActivityNotes={setActivityNotes}
        onSave={handleSaveActivity}
        isSaving={isSaving}
      />

      <AIAssistantModal 
        isVisible={isAIModalVisible}
        onClose={() => setIsAIModalVisible(false)}
        onSend={handleSendToAI}
      />

      {/* Floating Robot Mascot FAB */}
      <TouchableOpacity 
        style={styles.floatingMascot} 
        onPress={() => setIsAIModalVisible(true)}
        activeOpacity={0.8}
      >
        <Image
          source={require('../../assets/images/Adobe Express - file (11) 1.png')}
          style={styles.mascotFabImage}
          resizeMode="contain"
        />
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF',
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
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
  timelineContainer: {
    flex: 1,
    paddingTop: 12,
  },
  hourRow: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  hourLabelItem: {
    width: 55,
    paddingTop: 14,
    alignItems: 'flex-start',
  },
  hourText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#9CA3AF',
  },
  hourContent: {
    flex: 1,
    gap: 8,
  },
  emptySlot: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: '#D1D5DB',
    borderRadius: 16,
    height: 60,
    backgroundColor: 'transparent',
    gap: 4,
  },
  emptySlotText: {
    fontSize: 14,
    color: '#9CA3AF',
    fontWeight: '600',
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
  },
  centerContainer: {
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  loadingText: {
    fontSize: 14,
    color: '#64748B',
    fontWeight: '500',
  },
  errorText: {
    fontSize: 15,
    color: '#EF4444',
    textAlign: 'center',
    fontWeight: '500',
  },
  retryButton: {
    backgroundColor: '#10B981',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    marginTop: 10,
  },
  retryButtonText: {
    color: '#FFF',
    fontWeight: '700',
  },
});

