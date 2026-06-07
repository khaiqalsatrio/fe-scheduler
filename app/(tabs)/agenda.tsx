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
import { useTheme } from '../../context/ThemeContext';

// Components
import { DaySelector } from '../../components/agenda/DaySelector';
import { ActivityCard } from '../../components/agenda/ActivityCard';
import { AddActivityModal } from '../../components/agenda/AddActivityModal';
import { AIAssistantModal } from '../../components/agenda/AIAssistantModal';

const generateDays = () => {
  const days = [];
  const labels = ['M', 'S', 'S', 'R', 'K', 'J', 'S'];
  const today = new Date();

  for (let i = 0; i < 7; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    days.push({
      id: i + 1,
      label: labels[d.getDay()],
      date: d.getDate().toString(),
      fullDate: d.toISOString().split('T')[0]
    });
  }
  return days;
};

const DAYS = generateDays();

const HOURS = [
  '06 AM', '07 AM', '08 AM', '09 AM', '10 AM', '11 AM', '12 PM',
  '01 PM', '02 PM', '03 PM', '04 PM', '05 PM', '06 PM', '07 PM',
  '08 PM', '09 PM', '10 PM'
];

export default function AgendaScreen() {
  const router = useRouter();
  const { isDarkMode } = useTheme();
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
  const [selectedDay, setSelectedDay] = useState(1); // Default to today
  const [isAIModalVisible, setIsAIModalVisible] = useState(false);
  const [isAddModalVisible, setIsAddModalVisible] = useState(false);
  const [activityTitle, setActivityTitle] = useState('');
  const [activityNotes, setActivityNotes] = useState('');
  const [activityLocation, setActivityLocation] = useState('');
  const [selectedTimeSlot, setSelectedTimeSlot] = useState('');

  const handleSaveActivity = async () => {
    const success = await saveActivity(activityTitle, activityNotes, selectedDay, selectedTimeSlot, activityLocation);
    if (success) {
      Alert.alert('Sukses', 'Agenda berhasil ditambahkan');
      setIsAddModalVisible(false);
      setActivityTitle('');
      setActivityNotes('');
      setActivityLocation('');
    }
  };

  const handleAddSuggestion = async (activity: any) => {
    const success = await saveActivity(
      activity.title,
      'Ditambahkan dari Saran AI',
      selectedDay,
      activity.time,
      activity.location || ''
    );
    if (success) {
      setAgendas(prev => prev.filter(item => item.id !== activity.id));
      Alert.alert('Sukses', 'Agenda saran AI berhasil ditambahkan');
    }
  };

  const handleReplaceSuggestion = (activity: any) => {
    Alert.alert('Info', 'Fitur ganti saran AI belum tersedia.');
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

    const targetDateStr = DAYS.find(d => d.id === selectedDay)?.fullDate || new Date().toISOString().split('T')[0];

    return hourActivities.filter(activity => {
      const originalItem = agendas.find(item => item.id === activity.id);
      if (!originalItem) return false;
      const itemDateStr = (originalItem.startAt || originalItem.createdAt || '').split('T')[0];
      return itemDateStr === targetDateStr;
    });
  };

  return (
    <SafeAreaView style={[styles.container, isDarkMode && styles.containerDark]}>
      <StatusBar barStyle={isDarkMode ? "light-content" : "dark-content"} />

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.logoContainer}>
          <Image
            source={require('../../assets/images/logo.png')}
            style={styles.logoImage}
          />
          <Text style={[styles.headerTitle, isDarkMode && styles.textDark]}>Aktivity</Text>
        </View>
        <TouchableOpacity style={[styles.menuButton, isDarkMode && styles.menuButtonDark]}>
          <MoreHorizontal color={isDarkMode ? "#FFF" : "#000"} size={20} />
        </TouchableOpacity>
      </View>

      {/* Search Bar / Ask Agent */}
      <TouchableOpacity
        style={[styles.searchContainer, isDarkMode && styles.searchContainerDark]}
        onPress={() => setIsAIModalVisible(true)}
        activeOpacity={0.8}
      >
        <Search color={isDarkMode ? "#9CA3AF" : "#9CA3AF"} size={18} />
        <Text style={[styles.searchText, isDarkMode && styles.textGrayDark]}>Ask ChatAja Agent</Text>
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
          <RefreshControl refreshing={refreshing} onRefresh={() => fetchAgendas(true)} tintColor={isDarkMode ? "#10B981" : undefined} />
        }
      >
        {loading && !refreshing ? (
          <View style={styles.centerContainer}>
            <ActivityIndicator size="large" color="#10B981" />
            <Text style={[styles.loadingText, isDarkMode && styles.textGrayDark]}>Memuat kegiatan...</Text>
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
                      style={[styles.emptySlot, isDarkMode && styles.emptySlotDark]}
                      onPress={() => {
                        setSelectedTimeSlot(formatTimeRange(hour));
                        setIsAddModalVisible(true);
                      }}
                    >
                      <Plus size={16} color={isDarkMode ? "#6B7280" : "#9CA3AF"} style={{ marginRight: 4 }} />
                      <Text style={[styles.emptySlotText, isDarkMode && styles.emptySlotTextDark]}>Tambah aktivitas</Text>
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
        activityLocation={activityLocation}
        setActivityLocation={setActivityLocation}
        onSave={handleSaveActivity}
        isSaving={isSaving}
      />

      <AIAssistantModal
        isVisible={isAIModalVisible}
        onClose={() => setIsAIModalVisible(false)}
        onSend={handleSendToAI}
      />


    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF',
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  containerDark: {
    backgroundColor: '#121212',
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
  textDark: {
    color: '#FFF',
  },
  textGrayDark: {
    color: '#AAA',
  },
  menuButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuButtonDark: {
    backgroundColor: '#1E1E1E',
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
  searchContainerDark: {
    backgroundColor: '#1E1E1E',
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
  emptySlotDark: {
    borderColor: '#374151',
  },
  emptySlotText: {
    fontSize: 14,
    color: '#9CA3AF',
    fontWeight: '600',
  },
  emptySlotTextDark: {
    color: '#6B7280',
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

