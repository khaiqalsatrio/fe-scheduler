import { useState, useEffect, useCallback } from 'react';
import { Alert } from 'react-native';
import agendaService from '../services/agendaService';
import { AgendaItem } from '../types/agenda';
import { getHourLabel, formatLocalTime } from '../utils/dateFormatter';

export interface Activity {
  id: string;
  time: string;
  title: string;
  location: string;
  speaker?: string;
  isUserItem?: boolean;
  status?: string;
}

const MOCK_ITEMS: AgendaItem[] = [
  {
    id: 'mock-1',
    event_id: '3fe7ae15-f034-4006-ad45-e7d2607787b1',
    title: 'Sarapan: Bubur Ayam H.Aceng',
    start_at: '2026-04-11T08:00:00Z',
    end_at: '2026-04-11T09:00:00Z',
    location: 'Geger Kalong Hilir',
    status: 'saran_ai',
    order_index: 1,
  },
  {
    id: 'mock-2',
    event_id: '3fe7ae15-f034-4006-ad45-e7d2607787b1',
    title: 'Panel Discussion: AI in Enterprise',
    start_at: '2026-04-11T09:00:00Z',
    end_at: '2026-04-11T10:00:00Z',
    location: 'Main Hall',
    speaker: 'Multiple Speakers',
    status: 'penting',
    order_index: 2,
  },
  {
    id: 'mock-3',
    event_id: '3fe7ae15-f034-4006-ad45-e7d2607787b1',
    title: 'Networking Session',
    start_at: '2026-04-11T10:00:00Z',
    end_at: '2026-04-11T11:00:00Z',
    location: 'Garden Area',
    status: 'kurang_relevan',
    order_index: 3,
  }
];

export const useAgenda = () => {
  const [agendas, setAgendas] = useState<AgendaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAgendas = useCallback(async (isRefreshing = false) => {
    if (isRefreshing) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }
    setError(null);

    try {
      const response = await agendaService.getAgendas({ limit: 50 });
      if (response.status) {
        const dbItems = response.data;
        const merged = [...dbItems];
        
        // Add mock items if they don't already exist by title in database
        MOCK_ITEMS.forEach(mock => {
          if (!dbItems.some(item => item.title.toLowerCase() === mock.title.toLowerCase())) {
            merged.push(mock);
          }
        });
        setAgendas(merged);
      } else {
        setAgendas(MOCK_ITEMS);
        setError(response.message || 'Gagal mengambil data agenda');
      }
    } catch (err: any) {
      setAgendas(MOCK_ITEMS);
      setError('Terjadi kesalahan koneksi ke server');
      console.error(err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchAgendas();
  }, [fetchAgendas]);

  const saveActivity = async (
    title: string, 
    notes: string, 
    day: number, 
    timeSlot: string
  ) => {
    if (!title) return false;
    
    setIsSaving(true);
    try {
      // Base date: April 8, 2026
      const dayOffset = day - 1;
      const baseDate = new Date('2026-04-08T00:00:00Z');
      baseDate.setUTCDate(baseDate.getUTCDate() + dayOffset);
      
      const dateStr = baseDate.toISOString().split('T')[0];
      
      // Parse time range (e.g., "06:00 - 07:00")
      const [startTime, endTime] = timeSlot.split(' - ');
      
      const payload = {
        event_id: "3fe7ae15-f034-4006-ad45-e7d2607787b1",
        title: title,
        description: notes || '',
        order_index: agendas.length + 1,
        status: "pending",
        start_at: `${dateStr}T${startTime}:00Z`,
        end_at: `${dateStr}T${endTime}:00Z`,
      };

      const result = await agendaService.createAgenda(payload);
      
      if (result.status) {
        fetchAgendas(); 
        return true;
      } else {
        Alert.alert('Gagal', result.message || 'Gagal menyimpan agenda');
        return false;
      }
    } catch (err: any) {
      console.error('Save failed:', err);
      Alert.alert('Error', 'Terjadi kesalahan saat menyimpan agenda');
      return false;
    } finally {
      setIsSaving(false);
    }
  };

  const deleteAgenda = async (id: string) => {
    try {
      if (id.startsWith('mock-')) {
        // Handle mock deletion locally
        setAgendas(prev => prev.filter(item => item.id !== id));
        return true;
      }
      await agendaService.deleteAgenda(id);
      fetchAgendas();
      return true;
    } catch (err) {
      console.error('Delete failed:', err);
      Alert.alert('Error', 'Gagal menghapus agenda');
      return false;
    }
  };

  const groupedActivities = () => {
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
        isUserItem: item.status === 'pending',
        status: item.status
      });
    });

    return grouped;
  };

  return {
    agendas,
    activities: groupedActivities(),
    loading,
    refreshing,
    isSaving,
    error,
    fetchAgendas,
    saveActivity,
    deleteAgenda,
    setAgendas
  };
};

