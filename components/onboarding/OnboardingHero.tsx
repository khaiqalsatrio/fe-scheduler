import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, View, Text, Image, Animated } from 'react-native';

const SLIDE_DATA = [
  {
    id: '1',
    image: require('../../assets/images/thedata.png'),
    title: 'AnalyFYON the Data.',
    desc: 'Olah data jadi insight yang jelas. Bantu ambil keputusan tanpa harus mikir lama.'
  },
  {
    id: '2',
    image: require('../../assets/images/thenoise.jpg'),
    title: 'ClariFYON the Noise.',
    desc: 'Ubah percakapan panjang jadi poin inti. Fokus ke hal yang benar-benar penting tanpa distraksi.'
  },
  {
    id: '3',
    image: require('../../assets/images/theflow.jpg'),
    title: 'SimpliFYON the Flow.',
    desc: 'Rapikan proses jadi lebih ringan dan terarah. Biar kerja jalan tanpa hambatan.'
  }
];

export const OnboardingHero = () => {
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
        <Image source={SLIDE_DATA[currentIndex].image} style={styles.heroImage} resizeMode="contain" />
      </View>
      <View style={styles.textSection}>
        <Text style={styles.heroTitle}>{SLIDE_DATA[currentIndex].title}</Text>
        <Text style={styles.heroDesc}>{SLIDE_DATA[currentIndex].desc}</Text>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  heroSection: { alignItems: 'center', paddingTop: 15, paddingHorizontal: 30, width: '100%' },
  imagePlaceholder: { width: '100%', height: 250, justifyContent: 'center', alignItems: 'center', marginBottom: 20 },
  heroImage: { width: '100%', height: '100%' },
  textSection: { width: '100%', marginBottom: 30 },
  heroTitle: { fontSize: 28, fontWeight: '900', color: '#111', marginBottom: 10 },
  heroDesc: { fontSize: 15, color: '#666', lineHeight: 22, fontWeight: '400' },
});
