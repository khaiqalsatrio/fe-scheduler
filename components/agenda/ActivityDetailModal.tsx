import React from 'react';
import { 
  View, 
  Text, 
  Modal, 
  TouchableOpacity, 
  StyleSheet, 
  Platform,
  ScrollView
} from 'react-native';
import { X, MapPin, Clock, AlignLeft } from 'lucide-react-native';
import { useTheme } from '../../context/ThemeContext';
import { Activity } from '../../hooks/useAgenda';

interface ActivityDetailModalProps {
  isVisible: boolean;
  onClose: () => void;
  activity: Activity | null;
}

export const ActivityDetailModal: React.FC<ActivityDetailModalProps> = ({
  isVisible,
  onClose,
  activity,
}) => {
  const { isDarkMode } = useTheme();

  if (!activity) return null;

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={isVisible}
      onRequestClose={onClose}
    >
      <View style={styles.bottomSheetOverlay}>
        <TouchableOpacity 
          style={styles.bottomSheetBackdrop} 
          activeOpacity={1} 
          onPress={onClose} 
        />
        <View style={[styles.bottomSheetContent, isDarkMode && styles.bottomSheetContentDark]}>
          <View style={styles.bottomSheetHeader}>
            <Text style={[styles.bottomSheetTitle, isDarkMode && styles.textDark]}>Detail Aktivitas</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <X size={24} color={isDarkMode ? "#FFF" : "#64748B"} />
            </TouchableOpacity>
          </View>

          <ScrollView 
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 20 }}
          >
            <Text style={[styles.activityTitle, isDarkMode && styles.textDark]}>
              {activity.title}
            </Text>

            <View style={styles.detailRow}>
              <Clock size={20} color={isDarkMode ? "#9CA3AF" : "#64748B"} />
              <View style={styles.detailTextContainer}>
                <Text style={[styles.detailLabel, isDarkMode && styles.textGrayDark]}>Waktu</Text>
                <Text style={[styles.detailValue, isDarkMode && styles.textDark]}>{activity.time}</Text>
              </View>
            </View>

            {activity.location ? (
              <View style={styles.detailRow}>
                <MapPin size={20} color={isDarkMode ? "#9CA3AF" : "#64748B"} />
                <View style={styles.detailTextContainer}>
                  <Text style={[styles.detailLabel, isDarkMode && styles.textGrayDark]}>Lokasi</Text>
                  <Text style={[styles.detailValue, isDarkMode && styles.textDark]}>{activity.location}</Text>
                </View>
              </View>
            ) : null}

            {activity.notes ? (
              <View style={styles.detailRow}>
                <AlignLeft size={20} color={isDarkMode ? "#9CA3AF" : "#64748B"} />
                <View style={styles.detailTextContainer}>
                  <Text style={[styles.detailLabel, isDarkMode && styles.textGrayDark]}>Catatan</Text>
                  <Text style={[styles.detailValue, isDarkMode && styles.textDark]}>{activity.notes}</Text>
                </View>
              </View>
            ) : null}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
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
    maxHeight: '80%',
  },
  bottomSheetContentDark: {
    backgroundColor: '#1E1E1E',
  },
  bottomSheetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  bottomSheetTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#0F172A',
  },
  closeButton: {
    padding: 4,
  },
  activityTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 24,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 20,
    gap: 12,
  },
  detailTextContainer: {
    flex: 1,
  },
  detailLabel: {
    fontSize: 14,
    color: '#64748B',
    marginBottom: 4,
  },
  detailValue: {
    fontSize: 16,
    color: '#0F172A',
    fontWeight: '500',
  },
  textDark: {
    color: '#FFF',
  },
  textGrayDark: {
    color: '#9CA3AF',
  },
});
