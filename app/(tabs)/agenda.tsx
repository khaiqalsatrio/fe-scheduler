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
} from 'react-native';
import { Sparkle, AlertCircle } from 'lucide-react-native';

// Custom Hooks & Utils
import { useAgenda } from '../../hooks/useAgenda';
import { formatTimeRange } from '../../utils/dateFormatter';

// Components
import { DaySelector } from '../../components/agenda/DaySelector';
import { ActivityCard } from '../../components/agenda/ActivityCard';
import { AddActivityModal } from '../../components/agenda/AddActivityModal';
import { AIAssistantModal } from '../../components/agenda/AIAssistantModal';

const DAYS = [
  { id: 1, label: 'Day 1' },
  { id: 2, label: 'Day 2' },
  { id: 3, label: 'Day 3' },
];

const HOURS = [
  '3 AM', '4 AM', '5 AM', '6 AM', '7 AM', '8 AM', '9 AM', '10 AM',
  '11 AM', '12 PM', '1 PM', '2 PM', '3 PM', '4 PM', '5 PM', '6 PM',
  '7 PM', '8 PM', '9 PM', '10 PM'
];

export default function AgendaScreen() {
  const router = useRouter();
  const {
    activities,
    loading,
    refreshing,
    isSaving,
    error,
    fetchAgendas,
    saveActivity,
    deleteAgenda
  } = useAgenda();

  // Local UI State
  const [selectedDay, setSelectedDay] = useState(2);
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

  const handleSendToAI = () => {
    setIsAIModalVisible(false);
    router.push('/chats');
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Kegiatan</Text>
      </View>

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
            <ActivityIndicator size="large" color="#7C3AED" />
            <Text style={styles.loadingText}>Memuat kegiatan...</Text>
          </View>
        ) : error ? (
          <View style={styles.centerContainer}>
            <AlertCircle size={48} color="#EF4444" />
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity style={styles.retryButton} onPress={() => fetchAgendas()}>
              <Text style={styles.retryButtonText}>Coba Lagi</Text>
            </TouchableOpacity>
          </View>
        ) : (
          HOURS.map((hour) => {
            const hourActivities = activities[hour] || [];
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
                      <Text style={styles.emptySlotText}>Klik untuk tambah aktivitas</Text>
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

      {/* FAB */}
      <TouchableOpacity style={styles.fab} onPress={() => setIsAIModalVisible(true)}>
        <Sparkle color="#FFF" size={24} />
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
    paddingHorizontal: 24,
    paddingVertical: 16,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#1A1C1E',
  },
  timelineContainer: {
    flex: 1,
  },
  hourRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F2F5',
    minHeight: 80,
  },
  hourLabelItem: {
    width: 60,
    paddingTop: 16,
    alignItems: 'center',
  },
  hourText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#4B5563',
    textTransform: 'uppercase',
  },
  hourContent: {
    flex: 1,
    paddingRight: 24,
    paddingVertical: 12,
    gap: 8,
  },
  emptySlot: {
    flex: 1,
    justifyContent: 'center',
  },
  emptySlotText: {
    fontSize: 14,
    color: '#A0AEC0',
    fontWeight: '500',
  },
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#7C3AED',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#7C3AED',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
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
    backgroundColor: '#7C3AED',
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
