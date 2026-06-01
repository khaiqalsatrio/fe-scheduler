import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, TouchableWithoutFeedback, Animated } from 'react-native';
import { MessageCircle, FileText, Presentation, Sparkles } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';

interface TeraAIMenuProps {
  isAIActionsVisible: boolean;
  setIsAIActionsVisible: (val: boolean) => void;
  aiMenuAnim: Animated.Value;
  pulseAnim: Animated.Value;
  onTeraAIAction: (type: 'summarize' | 'presentation' | 'ask', text?: string) => void;
}

export function TeraAIMenu({
  isAIActionsVisible,
  setIsAIActionsVisible,
  aiMenuAnim,
  pulseAnim,
  onTeraAIAction
}: TeraAIMenuProps) {
  return (
    <>
      {isAIActionsVisible && (
        <TouchableWithoutFeedback onPress={() => setIsAIActionsVisible(false)}>
          <View style={styles.aiOverlay} />
        </TouchableWithoutFeedback>
      )}
      <Animated.View 
        style={[
          styles.aiMenuContainer, 
          { 
            opacity: aiMenuAnim, 
            transform: [
              { translateY: aiMenuAnim.interpolate({ inputRange: [0, 1], outputRange: [20, 0] }) }, 
              { scale: aiMenuAnim.interpolate({ inputRange: [0, 1], outputRange: [0.95, 1] }) }
            ] 
          }
        ]} 
        pointerEvents={isAIActionsVisible ? 'auto' : 'none'}
      >
        <View style={styles.aiMenuCard}>
          <TouchableOpacity style={styles.aiMenuItem} onPress={() => onTeraAIAction('ask', 'Tanya AI: ')}>
            <View style={[styles.aiIconWrapper, { backgroundColor: '#F3E8FF' }]}><MessageCircle color="#A855F7" size={22} /></View>
            <View style={styles.aiMenuText}><Text style={styles.aiMenuTitle}>Tanya AI</Text><Text style={styles.aiMenuDesc}>Tanyakan apa saja ke AI</Text></View>
          </TouchableOpacity>
          <View style={styles.aiMenuDivider} />
          <TouchableOpacity style={styles.aiMenuItem} onPress={() => onTeraAIAction('summarize')}>
            <View style={[styles.aiIconWrapper, { backgroundColor: '#E0F2FE' }]}><FileText color="#0EA5E9" size={22} /></View>
            <View style={styles.aiMenuText}><Text style={styles.aiMenuTitle}>Ringkas</Text><Text style={styles.aiMenuDesc}>Ubah chat jadi poin penting</Text></View>
          </TouchableOpacity>
          <View style={styles.aiMenuDivider} />
          <TouchableOpacity style={styles.aiMenuItem} onPress={() => onTeraAIAction('presentation')}>
            <View style={[styles.aiIconWrapper, { backgroundColor: '#DCFCE7' }]}><Presentation color="#22C55E" size={22} /></View>
            <View style={styles.aiMenuText}><Text style={styles.aiMenuTitle}>Buat Slide</Text><Text style={styles.aiMenuDesc}>Ubah chat jadi bahan presentasi</Text></View>
          </TouchableOpacity>
        </View>
      </Animated.View>

      <View style={styles.sparkleButtonContainer}>
        <Animated.View style={[styles.sparkleGlow, { opacity: pulseAnim.interpolate({ inputRange: [1, 1.1], outputRange: [0, 0.4] }), transform: [{ scale: pulseAnim }] }]} />
        <View style={styles.sparkleButton}>
          <TouchableOpacity activeOpacity={0.8} onPress={() => setIsAIActionsVisible(!isAIActionsVisible)} style={{ flex: 1 }}>
            <LinearGradient colors={['#A855F7', '#6366F1']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.sparkleGradient}>
              <Sparkles color="#FFF" fill="#FFF" size={24} />
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  sparkleButtonContainer: { position: 'absolute', bottom: 110, right: 15, width: 56, height: 56, zIndex: 100, justifyContent: 'center', alignItems: 'center' },
  sparkleButton: { width: 56, height: 56, borderRadius: 28, elevation: 2, shadowColor: '#A855F7', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.2, shadowRadius: 2 },
  sparkleGlow: { position: 'absolute', width: 56, height: 56, borderRadius: 28, backgroundColor: '#A855F7' },
  sparkleGradient: { flex: 1, borderRadius: 28, justifyContent: 'center', alignItems: 'center' },
  aiOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.1)', zIndex: 90 },
  aiMenuContainer: { position: 'absolute', bottom: 145, right: 15, width: 260, zIndex: 101 },
  aiMenuCard: { backgroundColor: '#FFF', borderRadius: 20, padding: 10, shadowColor: '#000', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.1, shadowRadius: 20, elevation: 10 },
  aiMenuItem: { flexDirection: 'row', alignItems: 'center', padding: 12 },
  aiIconWrapper: { width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  aiMenuText: { flex: 1 },
  aiMenuTitle: { fontSize: 16, fontWeight: '700', color: '#1A1A1A' },
  aiMenuDesc: { fontSize: 12, color: '#666', marginTop: 2 },
  aiMenuDivider: { height: 1, backgroundColor: '#F0F0F0', marginHorizontal: 12 },
});
