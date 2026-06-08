import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { MapPin, User, X, Sparkle, CheckCircle2, Circle } from 'lucide-react-native';
import { Activity } from '../../hooks/useAgenda';
import { useTheme } from '../../context/ThemeContext';

interface ActivityCardProps {
  activity: Activity;
  onDelete: (id: string) => void;
  onAddSuggestion?: (activity: Activity) => void;
  onDismissSuggestion?: (id: string) => void;
  onReplaceSuggestion?: (activity: Activity) => void;
  onPress?: () => void;
  isSelectionMode?: boolean;
  isSelected?: boolean;
  onToggleSelect?: (id: string) => void;
}

export const ActivityCard: React.FC<ActivityCardProps> = ({
  activity,
  onDelete,
  onAddSuggestion,
  onDismissSuggestion,
  onReplaceSuggestion,
  onPress,
  isSelectionMode,
  isSelected,
  onToggleSelect,
}) => {
  const { isDarkMode } = useTheme();

  const isSaranAI = activity.status === 'saran_ai';
  const isPenting = activity.status === 'penting';
  const isKurangRelevan = activity.status === 'kurang_relevan';

  const getCardStyle = () => {
    if (isDarkMode) {
      if (isSaranAI) return styles.cardSaranAIDark;
      if (isPenting) return styles.cardPentingDark;
      if (isKurangRelevan) return styles.cardKurangRelevanDark;
      return activity.isUserItem ? styles.cardUserDark : styles.cardDefaultDark;
    }
    if (isSaranAI) return styles.cardSaranAI;
    if (isPenting) return styles.cardPenting;
    if (isKurangRelevan) return styles.cardKurangRelevan;
    return activity.isUserItem ? styles.cardUser : styles.cardDefault;
  };

  const getBadge = () => {
    if (isSaranAI) {
      return (
        <View style={styles.badgeSaranAI}>
          <Sparkle size={10} color="#9333EA" fill="#9333EA" />
          <Text style={styles.badgeTextSaranAI}>Saran AI</Text>
        </View>
      );
    }
    if (isPenting) {
      return (
        <View style={styles.badgePenting}>
          <Text style={styles.badgeTextPenting}>Penting</Text>
        </View>
      );
    }
    if (isKurangRelevan) {
      return (
        <View style={styles.badgeKurangRelevan}>
          <Text style={styles.badgeTextKurangRelevan}>Kurang relevan</Text>
        </View>
      );
    }
    return null;
  };

  return (
    <TouchableOpacity 
      activeOpacity={(isSelectionMode || onPress) ? 0.8 : 1}
      onPress={() => {
        if (isSelectionMode && onToggleSelect) {
          onToggleSelect(activity.id);
        } else if (onPress) {
          onPress();
        }
      }}
      style={[styles.cardBase, getCardStyle()]}
    >
      <View style={styles.cardContent}>
        {/* Header containing Time and Badge */}
        <View style={styles.headerRow}>
          <View style={styles.timeBadgeContainer}>
            <Text
              style={[
                styles.timeText,
                isDarkMode && styles.timeTextDark,
                isSaranAI && (isDarkMode ? styles.timeTextSaranAIDark : styles.timeTextSaranAI),
                isPenting && (isDarkMode ? styles.timeTextPentingDark : styles.timeTextPenting),
                isKurangRelevan && (isDarkMode ? styles.timeTextKurangRelevanDark : styles.timeTextKurangRelevan),
              ]}
            >
              {activity.time}
            </Text>
            {getBadge()}
          </View>
          
          {/* Delete button or Checkbox */}
          {isSelectionMode ? (
            <TouchableOpacity onPress={() => onToggleSelect && onToggleSelect(activity.id)} style={styles.deleteButton}>
              {isSelected ? (
                <CheckCircle2 size={20} color="#10B981" />
              ) : (
                <Circle size={20} color={isDarkMode ? "#6B7280" : "#9CA3AF"} />
              )}
            </TouchableOpacity>
          ) : (
            activity.isUserItem && !isSaranAI && !isPenting && !isKurangRelevan && (
              <TouchableOpacity onPress={() => onDelete(activity.id)} style={styles.deleteButton}>
                <X size={16} color={isDarkMode ? "#D1D5DB" : "#9CA3AF"} />
              </TouchableOpacity>
            )
          )}
        </View>

        {/* Title */}
        <Text style={[styles.titleText, isDarkMode && styles.textDark]}>{activity.title}</Text>

        {/* Location Info */}
        {activity.location && (
          <View style={styles.metaRow}>
            <MapPin size={12} color={isDarkMode ? "#D1D5DB" : "#9CA3AF"} />
            <Text style={[styles.metaText, isDarkMode && styles.metaTextDark]}>{activity.location}</Text>
          </View>
        )}

        {/* Speaker Info (if any) */}
        {activity.speaker && (
          <View style={[styles.metaRow, { marginTop: 4 }]}>
            <User size={12} color={isDarkMode ? "#D1D5DB" : "#9CA3AF"} />
            <Text style={[styles.metaText, isDarkMode && styles.metaTextDark]}>Speaker: {activity.speaker}</Text>
          </View>
        )}

        {/* Saran AI interactive buttons */}
        {isSaranAI && (
          <View style={styles.actionRow}>
            <TouchableOpacity
              style={styles.addButton}
              onPress={() => onAddSuggestion && onAddSuggestion(activity)}
            >
              <Text style={styles.addButtonText}>Add</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.gantiButton}
              onPress={() => onReplaceSuggestion && onReplaceSuggestion(activity)}
            >
              <Text style={styles.gantiButtonText}>Ganti Saran</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.dismissButton}
              onPress={() => onDismissSuggestion && onDismissSuggestion(activity.id)}
            >
              <Text style={styles.dismissButtonText}>Dismiss</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* Mascot decoration for Kurang Relevan card */}
      {isKurangRelevan && (
        <Image
          source={require('../../assets/images/Adobe Express - file (11) 1.png')}
          style={styles.mascotImage}
          resizeMode="contain"
        />
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  cardBase: {
    borderRadius: 16,
    padding: 14,
    position: 'relative',
    overflow: 'hidden',
  },
  cardDefault: {
    backgroundColor: '#EFF6FF',
  },
  cardDefaultDark: {
    backgroundColor: '#1E3A8A',
  },
  cardUser: {
    backgroundColor: '#F0FDF4',
    borderLeftWidth: 3,
    borderLeftColor: '#22C55E',
  },
  cardUserDark: {
    backgroundColor: '#064E3B',
    borderLeftWidth: 3,
    borderLeftColor: '#10B981',
  },
  cardSaranAI: {
    backgroundColor: '#F5F3FF',
  },
  cardSaranAIDark: {
    backgroundColor: '#4C1D95',
  },
  cardPenting: {
    backgroundColor: '#EFF6FF',
  },
  cardPentingDark: {
    backgroundColor: '#1E3A8A',
  },
  cardKurangRelevan: {
    backgroundColor: '#F9FAFB',
    minHeight: 90,
  },
  cardKurangRelevanDark: {
    backgroundColor: '#1F2937',
    minHeight: 90,
  },
  cardContent: {
    flex: 1,
    zIndex: 1,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  timeBadgeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  timeText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#4B5563',
  },
  timeTextDark: {
    color: '#D1D5DB',
  },
  timeTextSaranAI: {
    color: '#7C3AED',
  },
  timeTextSaranAIDark: {
    color: '#C4B5FD',
  },
  timeTextPenting: {
    color: '#1D4ED8',
  },
  timeTextPentingDark: {
    color: '#93C5FD',
  },
  timeTextKurangRelevan: {
    color: '#6B7280',
  },
  timeTextKurangRelevanDark: {
    color: '#9CA3AF',
  },
  titleText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 6,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  metaText: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '500',
  },
  metaTextDark: {
    color: '#9CA3AF',
  },
  deleteButton: {
    padding: 2,
  },
  textDark: {
    color: '#FFF',
  },
  // Badges
  badgeSaranAI: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3E8FF',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    gap: 4,
  },
  badgeTextSaranAI: {
    fontSize: 10,
    fontWeight: '700',
    color: '#9333EA',
  },
  badgePenting: {
    backgroundColor: '#3B82F6',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  badgeTextPenting: {
    fontSize: 10,
    fontWeight: '700',
    color: '#FFF',
  },
  badgeKurangRelevan: {
    backgroundColor: '#9CA3AF',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  badgeTextKurangRelevan: {
    fontSize: 10,
    fontWeight: '700',
    color: '#FFF',
  },
  // Actions
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 10,
  },
  addButton: {
    backgroundColor: '#10B981',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  addButtonText: {
    color: '#FFF',
    fontSize: 11,
    fontWeight: '700',
  },
  gantiButton: {
    backgroundColor: '#8B5CF6',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  gantiButtonText: {
    color: '#FFF',
    fontSize: 11,
    fontWeight: '700',
  },
  dismissButton: {
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  dismissButtonText: {
    color: '#4B5563',
    fontSize: 11,
    fontWeight: '700',
  },
  // Mascot image positioning
  mascotImage: {
    position: 'absolute',
    bottom: -5,
    right: 5,
    width: 75,
    height: 75,
    zIndex: 0,
  },
});

