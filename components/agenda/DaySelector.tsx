import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';

interface Day {
  id: number;
  label: string;
}

interface DaySelectorProps {
  days: Day[];
  selectedDay: number;
  onSelectDay: (id: number) => void;
}

export const DaySelector: React.FC<DaySelectorProps> = ({ days, selectedDay, onSelectDay }) => {
  return (
    <View style={styles.daySelectorContainer}>
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false} 
        contentContainerStyle={styles.daySelectorContent}
      >
        {days.map((day) => (
          <TouchableOpacity
            key={day.id}
            onPress={() => onSelectDay(day.id)}
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
  );
};

const styles = StyleSheet.create({
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
});
