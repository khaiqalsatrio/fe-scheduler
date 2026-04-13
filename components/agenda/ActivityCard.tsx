import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { MapPin, User, X } from 'lucide-react-native';
import { Activity } from '../../hooks/useAgenda';

interface ActivityCardProps {
  activity: Activity;
  onDelete: (id: string) => void;
}

export const ActivityCard: React.FC<ActivityCardProps> = ({ activity, onDelete }) => {
  return (
    <View style={[
      styles.activityCard,
      activity.isUserItem && styles.activityCardUser
    ]}>
      <View style={styles.activityCardContent}>
        <View style={styles.activityHeader}>
          <Text style={styles.activityTime}>{activity.time}</Text>
          {activity.isUserItem && (
            <TouchableOpacity onPress={() => onDelete(activity.id)}>
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
  );
};

const styles = StyleSheet.create({
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
});
