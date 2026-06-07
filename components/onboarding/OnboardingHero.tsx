import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, View, Text, Image, Animated } from 'react-native';
import { useTheme } from '../../context/ThemeContext';

const SLIDE_DATA = [
  {
    id: '1',
    image: require('../../assets/images/bikindokumen.png'),
    title: 'Bikin dokumen jadi sat set',
    desc: 'Dari chat langsung jadi slide atau dokumen. Gak perlu mulai dari nol.'
  },
  {
    id: '2',
    image: require('../../assets/images/olahdata.png'),
    title: 'Analisa data tanpa pusing',
    desc: 'Tera bantu pecahin data jadi insight yang gampang kamu pahami dan pakai.'
  },
  {
    id: '3',
    image: require('../../assets/images/rapihinkerja.png'),
    title: 'Rapihin kerjaan, biar gak ribet',
    desc: 'Semua flow dan info bisa kamu rapihin langsung di chat. Lebih jelas, lebih cepat.'
  }
];

export const OnboardingHero = () => {
  const { isDarkMode } = useTheme();
  const [currentIndex, setCurrentIndex] = useState(0);
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const slideAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const timer = setInterval(() => {
      Animated.parallel([
        Animated.timing(fadeAnim, { toValue: 0, duration: 350, useNativeDriver: true }),
        Animated.timing(slideAnim, { toValue: -30, duration: 350, useNativeDriver: true })
      ]).start(() => {
        setCurrentIndex((prev) => (prev === SLIDE_DATA.length - 1 ? 0 : prev + 1));
        slideAnim.setValue(30); 
        Animated.parallel([
          Animated.timing(fadeAnim, { toValue: 1, duration: 350, useNativeDriver: true }),
          Animated.timing(slideAnim, { toValue: 0, duration: 350, useNativeDriver: true })
        ]).start();
      });
    }, 4500);

    return () => clearInterval(timer);
  }, [currentIndex]);

  return (
    <Animated.View style={[styles.heroSection, { opacity: fadeAnim, transform: [{ translateX: slideAnim }] }]}>
      <View style={styles.imagePlaceholder}>
        <View style={styles.circularMask}>
          <Image source={SLIDE_DATA[currentIndex].image} style={styles.heroImage} resizeMode="cover" />
        </View>
      </View>
      <View style={styles.textSection}>
        <Text style={[styles.heroTitle, isDarkMode && { color: '#FFF' }]}>{SLIDE_DATA[currentIndex].title}</Text>
        <Text style={[styles.heroDesc, isDarkMode && { color: '#AAA' }]}>{SLIDE_DATA[currentIndex].desc}</Text>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  heroSection: { alignItems: 'center', paddingTop: 10, paddingHorizontal: 30, width: '100%' },
  imagePlaceholder: { width: '100%', height: 260, justifyContent: 'center', alignItems: 'center', marginBottom: 15 },
  circularMask: {
    width: 240,
    height: 240,
    borderTopLeftRadius: 120,
    borderTopRightRadius: 120,
    borderBottomRightRadius: 120,
    borderBottomLeftRadius: 32,
    overflow: 'hidden',
  },
  heroImage: { width: '100%', height: '100%' },
  textSection: { width: '100%', marginBottom: 20, alignItems: 'center' },
  heroTitle: { fontSize: 22, fontWeight: '900', color: '#111', marginBottom: 12, textAlign: 'center' },
  heroDesc: { fontSize: 14, color: '#666', lineHeight: 20, fontWeight: '400', textAlign: 'center', paddingHorizontal: 10 },
});
