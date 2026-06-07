import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { Calendar, FileText, Edit3 } from 'lucide-react-native';
import { useTheme } from '../../context/ThemeContext';

interface MediaActionListProps {
  actionLoading: string | null;
  onGenerateRecap: () => void;
  onGenerateReport: () => void;
  onGenerateMom: () => void;
}

export function MediaActionList({
  actionLoading,
  onGenerateRecap,
  onGenerateReport,
  onGenerateMom,
}: MediaActionListProps) {
  const { isDarkMode } = useTheme();

  const actions = [
    { id: '1', title: 'Rekap presentasi narasumber', icon: Calendar, onPress: onGenerateRecap, desc: 'AI will extract key points from your recording' },
    { id: '2', title: 'Buatkan laporan kegiatan', icon: FileText, onPress: onGenerateReport, desc: 'Generate formal structured reports instantly' },
    { id: '3', title: 'Buatkan MoM diskusi', icon: Edit3, onPress: onGenerateMom, desc: 'Transcribe and summarize meeting notes' },
  ];

  return (
    <>
      <View style={styles.actionSectionHeader}>
        <Text style={styles.sectionTitleList}>DRAFT WITH TERA AI</Text>
      </View>
      <View style={styles.actionList}>
        {actions.map((action) => {
          const Icon = action.icon;
          return (
            <TouchableOpacity
              key={action.id}
              style={[styles.actionCard, isDarkMode && styles.actionCardDark]}
              onPress={action.onPress}
              disabled={!!actionLoading}
            >
              <View style={styles.actionIconContainer}>
                {actionLoading === action.id ? (
                  <ActivityIndicator size="small" color={isDarkMode ? "#FFF" : "#000"} />
                ) : (
                  <Icon color={isDarkMode ? "#FFF" : "#000"} size={20} />
                )}
              </View>
              <Text style={[styles.actionTitleText, isDarkMode && styles.textDark]}>
                {actionLoading === action.id ? 'Memproses...' : action.title}
              </Text>
              <Text style={styles.actionDescText}>
                {action.desc}
              </Text>
            </TouchableOpacity>
          )
        })}
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  actionSectionHeader: {
    paddingHorizontal: 20,
    marginTop: 10,
    marginBottom: 10,
  },
  sectionTitleList: {
    fontSize: 12,
    fontWeight: '600',
    color: '#9CA3AF',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  actionList: {
    paddingBottom: 40,
  },
  actionCard: {
    backgroundColor: '#F9F9F9',
    borderWidth: 1,
    borderColor: '#E5E5E5',
    borderRadius: 8,
    padding: 16,
    marginHorizontal: 20,
    marginBottom: 10,
    alignItems: 'flex-start',
  },
  actionCardDark: {
    backgroundColor: '#1E1E1E',
    borderColor: '#333',
  },
  actionIconContainer: {
    marginBottom: 10,
  },
  actionTitleText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000',
    marginBottom: 4,
  },
  actionDescText: {
    fontSize: 11,
    color: '#888',
  },
  textDark: {
    color: '#FFF',
  },
});
