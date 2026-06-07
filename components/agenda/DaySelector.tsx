import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useTheme } from '../../context/ThemeContext';

interface Day {
  id: number;
  label: string;
  date: string;
}

interface DaySelectorProps {
  days: Day[];
  selectedDay: number;
  onSelectDay: (id: number) => void;
}

export const DaySelector: React.FC<DaySelectorProps> = ({ days, selectedDay, onSelectDay }) => {
  const { isDarkMode } = useTheme();

  return (
    <View style={[styles.container, isDarkMode && styles.containerDark]}>
      <View style={styles.row}>
        {days.map((day) => {
          const isActive = selectedDay === day.id;
          return (
            <TouchableOpacity
              key={day.id}
              onPress={() => onSelectDay(day.id)}
              style={[
                styles.dayTab,
                isActive && styles.dayTabActive
              ]}
              activeOpacity={0.8}
            >
              <Text style={[
                styles.dayLabel,
                isDarkMode && styles.textGrayDark,
                isActive && styles.dayLabelActive
              ]}>
                {day.label}
              </Text>
              <Text style={[
                styles.dayDate,
                isDarkMode && styles.textDark,
                isActive && styles.dayDateActive
              ]}>
                {day.date}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFF',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  containerDark: {
    backgroundColor: '#121212',
    borderBottomColor: '#222',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  dayTab: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 40,
    height: 56,
    borderRadius: 12,
    backgroundColor: 'transparent',
  },
  dayTabActive: {
    backgroundColor: '#10B981', // Emerald green from screenshot
  },
  dayLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6B7280',
    marginBottom: 4,
  },
  dayLabelActive: {
    color: '#FFF',
  },
  dayDate: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
  },
  dayDateActive: {
    color: '#FFF',
  },
  textDark: {
    color: '#FFF',
  },
  textGrayDark: {
    color: '#AAA',
  },
});

