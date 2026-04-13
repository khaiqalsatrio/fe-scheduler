import React, { useState, useEffect } from 'react';
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
  Modal,
  TextInput,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { MapPin, User, Sparkle, X, AlertCircle } from 'lucide-react-native';
import { Alert } from 'react-native';
import agendaService from '../../services/agendaService';
import { AgendaItem } from '../../types/agenda';

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

interface Activity {
  id: string;
  time: string;
  title: string;
  location: string;
  speaker?: string;
  isUserItem?: boolean;
}

const MOCK_DATA: Record<number, Record<string, Activity[]>> = {
  2: {
    '8 AM': [
      {
        id: '1',
        time: '08:30 - 09:00',
        title: 'Morning Coffee',
        location: 'Lobby Hall',
      },
    ],
    '9 AM': [
      {
        id: '2',
        time: '08:30 - 09:00',
        title: 'Morning Coffee',
        location: 'Lobby Hall',
      },
      {
        id: '3',
        time: '09:00 - 10:00',
        title: 'Keynote: Design Thinking in Practice',
        location: 'Main Hall',
        speaker: 'Kia Rahma',
      },
    ],
  },
};

export default function AgendaScreen() {
  const router = useRouter();
  const [selectedDay, setSelectedDay] = useState(2);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isAddModalVisible, setIsAddModalVisible] = useState(false);
  const [activityTitle, setActivityTitle] = useState('');
  const [activityNotes, setActivityNotes] = useState('');
  const [selectedTimeSlot, setSelectedTimeSlot] = useState('');
  
  // API State
  const [agendas, setAgendas] = useState<AgendaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchAgendas();
  }, []);

  const fetchAgendas = async (isRefreshing = false) => {
    if (isRefreshing) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }
    setError(null);

    try {
      const response = await agendaService.getAgendas({ limit: 50 });
      if (response.status) {
        setAgendas(response.data);
      } else {
        setError(response.message || 'Gagal mengambil data agenda');
      }
    } catch (err: any) {
      setError('Terjadi kesalahan koneksi ke server');
      console.error(err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const formatTimeRange = (hourStr: string) => {
    const parts = hourStr.split(' ');
    const val = parts[0];
    const period = parts[1];
    let hour = parseInt(val);
    if (period === 'PM' && hour !== 12) hour += 12;
    if (period === 'AM' && hour === 12) hour = 0;
    
    const start = hour.toString().padStart(2, '0') + ':00';
    const end = (hour + 1 === 24 ? 0 : hour + 1).toString().padStart(2, '0') + ':00';
    return `${start} - ${end}`;
  };

  const handleSaveActivity = async () => {
    if (!activityTitle) return;
    
    setIsSaving(true);
    try {
      // Base date: April 8, 2026 (based on user's example)
      const dayOffset = selectedDay - 1;
      const baseDate = new Date('2026-04-08T00:00:00Z');
      baseDate.setUTCDate(baseDate.getUTCDate() + dayOffset);
      
      const dateStr = baseDate.toISOString().split('T')[0];
      
      // Parse time range (e.g., "06:00 - 07:00")
      const [startTime, endTime] = selectedTimeSlot.split(' - ');
      
      const payload = {
        event_id: "3fe7ae15-f034-4006-ad45-e7d2607787b1", // Fixed as per requirement
        title: activityTitle,
        description: activityNotes || '',
        order_index: agendas.length + 1,
        status: "pending",
        start_at: `${dateStr}T${startTime}:00Z`,
        end_at: `${dateStr}T${endTime}:00Z`,
      };

      const result = await agendaService.createAgenda(payload);
      
      if (result.status) {
        Alert.alert('Sukses', 'Agenda berhasil ditambahkan');
        setIsAddModalVisible(false);
        setActivityTitle('');
        setActivityNotes('');
        fetchAgendas(); // Refresh the list
      } else {
        Alert.alert('Gagal', result.message || 'Gagal menyimpan agenda');
      }
    } catch (err: any) {
      console.error('Save failed:', err);
      Alert.alert('Error', 'Terjadi kesalahan saat menyimpan agenda');
    } finally {
      setIsSaving(false);
    }
  };

  const formatLocalTime = (isoStr?: string) => {
    if (!isoStr) return '--:--';
    const date = new Date(isoStr);
    return date.getUTCHours().toString().padStart(2, '0') + ':' + 
           date.getUTCMinutes().toString().padStart(2, '0');
  };

  const getHourLabel = (dateStr?: string) => {
    if (!dateStr) return '9 AM'; 
    const date = new Date(dateStr);
    let hours = date.getUTCHours();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12; 
    return `${hours} ${ampm}`;
  };

  const processAgendas = () => {
    const grouped: Record<string, Activity[]> = {};
    
    agendas.forEach(item => {
      const hourLabel = getHourLabel(item.start_at || item.created_at);
      if (!grouped[hourLabel]) {
        grouped[hourLabel] = [];
      }
      
      const timeRange = (item.start_at && item.end_at) 
        ? `${formatLocalTime(item.start_at)} - ${formatLocalTime(item.end_at)}`
        : (item.time || 'Waktu tidak ditentukan');

      grouped[hourLabel].push({
        id: item.id,
        time: timeRange,
        title: item.title,
        location: item.location || 'Lokasi tidak tersedia',
        speaker: item.speaker,
        isUserItem: item.status === 'pending' // Based on implementation plan
      });
    });

    return grouped;
  };

  const handleDeleteAgenda = async (id: string) => {
    try {
      // Direct delete as requested (no confirmation)
      await agendaService.deleteAgenda(id);
      fetchAgendas(); // Refresh list
    } catch (err) {
      console.error('Delete failed:', err);
      Alert.alert('Error', 'Gagal menghapus agenda');
    }
  };

  const activities = agendas.length > 0 ? processAgendas() : {};

  const handleSendToAI = () => {
    setIsModalVisible(false);
    // Navigate to Chat tab
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
      <View style={styles.daySelectorContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.daySelectorContent}>
          {DAYS.map((day) => (
            <TouchableOpacity
              key={day.id}
              onPress={() => setSelectedDay(day.id)}
              style={[
                styles.dayTab,
                selectedDay === day.id && styles.dayTabActive
              ]}>
              <Text style={[
                styles.dayTabText,
                selectedDay === day.id && styles.dayTabTextActive
              ]}>
                {day.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

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
                    <View key={activity.id} style={[
                      styles.activityCard,
                      activity.isUserItem && styles.activityCardUser
                    ]}>
                      <View style={styles.activityCardContent}>
                        <View style={styles.activityHeader}>
                          <Text style={styles.activityTime}>{activity.time}</Text>
                          {activity.isUserItem && (
                            <TouchableOpacity onPress={() => handleDeleteAgenda(activity.id)}>
                              <X size={16} color="#EF4444" />
                            </TouchableOpacity>
                          )}
                        </View>
                        <Text style={styles.activityTitle}>{activity.title}</Text>
                        <View style={styles.activityMeta}>
                          <MapPin size={12} color="#8E99AF" />
                          <Text style={styles.activityMetaText}>{activity.location}</Text>
                        </View>
                        {activity.speaker && (
                          <View style={[styles.activityMeta, { marginTop: 4 }]}>
                            <User size={12} color="#8E99AF" />
                            <Text style={styles.activityMetaText}>Speaker: {activity.speaker}</Text>
                          </View>
                        )}
                      </View>
                    </View>
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
        {/* Extra padding at bottom for FAB */}
        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Add Activity Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={isAddModalVisible}
        onRequestClose={() => setIsAddModalVisible(false)}
      >
        <View style={styles.bottomSheetOverlay}>
          <TouchableOpacity 
            style={styles.bottomSheetBackdrop} 
            activeOpacity={1} 
            onPress={() => setIsAddModalVisible(false)} 
          />
          <View style={styles.bottomSheetContent}>
            <View style={styles.bottomSheetHeader}>
              <Text style={styles.bottomSheetTitle}>Tambah Aktivitas</Text>
              <TouchableOpacity onPress={() => setIsAddModalVisible(false)} style={styles.closeButton}>
                <X size={24} color="#64748B" />
              </TouchableOpacity>
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Waktu</Text>
              <Text style={styles.timeValue}>{selectedTimeSlot}</Text>
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Judul Aktivitas *</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g., Coffee meeting with Ahmad"
                placeholderTextColor="#94A3B8"
                value={activityTitle}
                onChangeText={setActivityTitle}
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Catatan (opsional)</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Tambahkan catatan..."
                placeholderTextColor="#94A3B8"
                value={activityNotes}
                onChangeText={setActivityNotes}
                multiline
                numberOfLines={3}
                textAlignVertical="top"
              />
            </View>

            <TouchableOpacity 
              style={[
                styles.saveButton,
                (!activityTitle || isSaving) && styles.saveButtonDisabled
              ]} 
              onPress={handleSaveActivity}
              disabled={!activityTitle || isSaving}
            >
              {isSaving ? (
                <ActivityIndicator color="#FFF" />
              ) : (
                <Text style={styles.saveButtonText}>Simpan</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* AI Assistant Modal */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={isModalVisible}
        onRequestClose={() => setIsModalVisible(false)}
      >
        <TouchableOpacity 
          style={styles.modalOverlay} 
          activeOpacity={1} 
          onPress={() => setIsModalVisible(false)}
        >
          <View style={styles.modalContent} onStartShouldSetResponder={() => true}>
            <Text style={styles.modalTitle}>AI Assistant</Text>
            <Text style={styles.modalSubtitle}>Prompt ini akan dikirim ke chat AI:</Text>

            <View style={styles.promptBox}>
              <Text style={styles.promptText}>
                @Tera, bantu saya rencanakan aktivitas untuk hari ini di event
              </Text>
            </View>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setIsModalVisible(false)}
              >
                <Text style={styles.cancelButtonText}>Batal</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.sendButton}
                onPress={handleSendToAI}
              >
                <Text style={styles.sendButtonText}>Kirim ke AI</Text>
              </TouchableOpacity>
            </View>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* FAB */}
      <TouchableOpacity style={styles.fab} onPress={() => setIsModalVisible(true)}>
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
  daySelectorContainer: {
    marginBottom: 16,
  },
  daySelectorContent: {
    paddingHorizontal: 24,
    gap: 12,
  },
  dayTab: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#E1E4E8',
    backgroundColor: '#FFF',
  },
  dayTabActive: {
    backgroundColor: '#E8F5E9',
    borderColor: '#81C784',
  },
  dayTabText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#666',
  },
  dayTabTextActive: {
    color: '#2E7D32',
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
  activityCard: {
    backgroundColor: '#F0F7FF',
    borderRadius: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#3B82F6',
    padding: 12,
  },
  activityCardUser: {
    backgroundColor: '#F0FDF4',
    borderLeftColor: '#22C55E',
  },
  activityHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 2,
  },
  activityCardContent: {
    gap: 4,
  },
  activityTime: {
    fontSize: 12,
    fontWeight: '600',
    color: '#4B5563',
  },
  activityTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1A1C1E',
  },
  activityMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  activityMetaText: {
    fontSize: 12,
    color: '#718096',
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalContent: {
    backgroundColor: '#FFF',
    borderRadius: 24,
    padding: 24,
    width: '100%',
    maxWidth: 400,
    elevation: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 15,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 8,
  },
  modalSubtitle: {
    fontSize: 14,
    color: '#64748B',
    marginBottom: 20,
    lineHeight: 20,
  },
  promptBox: {
    backgroundColor: '#F5F3FF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#DDD6FE',
    marginBottom: 24,
  },
  promptText: {
    fontSize: 14,
    color: '#5B21B6',
    lineHeight: 20,
    fontWeight: '500',
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#F1F5F9',
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#475569',
  },
  sendButton: {
    flex: 1,
    backgroundColor: '#22C55E',
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
  },
  sendButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFF',
  },
  bottomSheetOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  bottomSheetBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
  },
  bottomSheetContent: {
    backgroundColor: '#FFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingBottom: Platform.OS === 'ios' ? 40 : 24,
  },
  bottomSheetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  bottomSheetTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#0F172A',
  },
  closeButton: {
    padding: 4,
  },
  formGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748B',
    marginBottom: 8,
  },
  timeValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
  },
  input: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#0F172A',
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  textArea: {
    height: 100,
  },
  saveButton: {
    backgroundColor: '#22C55E', // Green when active
    paddingVertical: 16,
    borderRadius: 99,
    alignItems: 'center',
    marginTop: 8,
  },
  saveButtonDisabled: {
    backgroundColor: '#E2E8F0', // Grey when inactive
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFF',
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
