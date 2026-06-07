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
      const dbItems = await agendaService.getAgendas({ limit: 50 });
      if (Array.isArray(dbItems)) {
        setAgendas(dbItems);
      } else {
        setAgendas([]);
        setError('Gagal mengambil data agenda');
      }
    } catch (err: any) {
      setAgendas([]);
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
    timeSlot: string,
    location: string
  ) => {
    if (!title) return false;

    setIsSaving(true);
    try {
      const today = new Date();
      const targetDate = new Date(today);
      targetDate.setDate(today.getDate() + (day - 1));

      const dateStr = targetDate.toISOString().split('T')[0];

      // Parse time range (e.g., "06:00 - 07:00")
      const [startTime, endTime] = timeSlot.split(' - ');

      const payload = {
        title: title,
        note: notes || '',
        startAt: `${dateStr}T${startTime}:00.000Z`,
        endAt: `${dateStr}T${endTime}:00.000Z`,
        location: location || '',
        isAllDay: false,
      };

      const result: any = await agendaService.createAgenda(payload);

      if (result && result.id) {
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
    Alert.alert(
      "Hapus Agenda",
      "Apakah Anda yakin ingin menghapus agenda ini?",
      [
        { text: "Batal", style: "cancel" },
        {
          text: "Hapus",
          style: "destructive",
          onPress: async () => {
            try {
              await agendaService.deleteAgenda(id);
              fetchAgendas();
            } catch (err) {
              console.error('Delete failed:', err);
              Alert.alert('Error', 'Gagal menghapus agenda');
            }
          }
        }
      ]
    );
    return true;
  };

  const groupedActivities = () => {
    const grouped: Record<string, Activity[]> = {};

    agendas.forEach(item => {
      const hourLabel = getHourLabel(item.startAt || item.createdAt);
      if (!grouped[hourLabel]) {
        grouped[hourLabel] = [];
      }

      const timeRange = (item.startAt && item.endAt)
        ? `${formatLocalTime(item.startAt)} - ${formatLocalTime(item.endAt)}`
        : (item.time || 'Waktu tidak ditentukan');

      grouped[hourLabel].push({
        id: item.id,
        time: timeRange,
        title: item.title,
        location: item.location || 'Lokasi tidak tersedia',
        speaker: item.speaker,
        isUserItem: !item.status || item.status === 'pending',
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

