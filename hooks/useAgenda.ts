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
}

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
        isUserItem: item.status === 'pending'
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
    deleteAgenda
  };
};
