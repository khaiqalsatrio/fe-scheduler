import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Image } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

interface TeraProcessingProps {
  title?: string;
}

export const TeraProcessing = ({ title = "Tera sedang memahami profil kamu" }: TeraProcessingProps) => {
  return (
    <View style={styles.teraProcessingContainer}>
      <View style={styles.teraIconContainer}>
        <MaterialCommunityIcons name="auto-fix" size={48} color="#27AE60" />
      </View>
      <Text style={styles.teraProcessingTitle}>{title}</Text>
      <Text style={styles.teraProcessingSub}>Menyiapkan pengalaman terbaik untukmu</Text>
      <View style={styles.loadingDots}>
        <Text style={styles.dot}>•</Text>
        <Text style={[styles.dot, { opacity: 0.6 }]}>•</Text>
        <Text style={[styles.dot, { opacity: 0.3 }]}>•</Text>
      </View>
    </View>
  );
};

interface TeraIntroProps {
  onContinue: () => void;
}

export const TeraIntro = ({ onContinue }: TeraIntroProps) => {
  return (
    <View style={styles.teraIntroContainer}>
      <Image 
        source={require('../../assets/images/robot_flow.png')} 
        style={styles.teraRobotImage} 
        resizeMode="contain" 
      />
      <Text style={styles.teraIntroTitle}>Kenalin, Aku Tera!</Text>
      <Text style={styles.teraIntroDesc}>
        Aku rekan yang bakal nemenin kamu di aplikasi ChatAja!.{"\n"}
        Mau tahu aku bisa bantu apa aja? Lanjutkan ya.
      </Text>
      <TouchableOpacity 
        style={styles.teraContinueBtn} 
        onPress={onContinue}
      >
        <Text style={styles.teraContinueText}>Lanjutkan</Text>
      </TouchableOpacity>
      <View style={styles.paginationDots}>
        <View style={[styles.pDot, styles.pDotActive]} />
        <View style={styles.pDot} />
        <View style={styles.pDot} />
        <View style={styles.pDot} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  teraProcessingContainer: { alignItems: 'center', paddingVertical: 30 },
  teraIconContainer: { width: 100, height: 100, borderRadius: 50, backgroundColor: '#E8F5E9', justifyContent: 'center', alignItems: 'center', marginBottom: 25 },
  teraProcessingTitle: { fontSize: 20, fontWeight: '800', color: '#333', textAlign: 'center', marginBottom: 10, paddingHorizontal: 20 },
  teraProcessingSub: { fontSize: 14, color: '#666', textAlign: 'center', marginBottom: 20 },
  loadingDots: { flexDirection: 'row', justifyContent: 'center' },
  dot: { fontSize: 32, color: '#27AE60', marginHorizontal: 4 },
  teraIntroContainer: { alignItems: 'center', paddingTop: 10 },
  teraRobotImage: { width: 250, height: 250, marginBottom: 20 },
  teraIntroTitle: { fontSize: 24, fontWeight: '800', color: '#111', marginBottom: 15 },
  teraIntroDesc: { fontSize: 15, color: '#666', textAlign: 'center', lineHeight: 22, marginBottom: 30, paddingHorizontal: 10 },
  teraContinueBtn: { width: '100%', height: 54, borderRadius: 12, backgroundColor: '#FFF', justifyContent: 'center', alignItems: 'center', marginBottom: 25, elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4 },
  teraContinueText: { fontSize: 16, fontWeight: '700', color: '#27AE60' },
  paginationDots: { flexDirection: 'row', justifyContent: 'center' },
  pDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#EEE', marginHorizontal: 4 },
  pDotActive: { backgroundColor: '#27AE60', width: 20 },
});
