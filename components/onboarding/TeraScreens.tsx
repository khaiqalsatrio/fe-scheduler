import { StyleSheet, View, Text, TouchableOpacity, Image, Animated, Easing } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useEffect, useRef, useState } from 'react';

interface TeraProcessingProps {
  title?: string;
}

export const TeraProcessing = ({ title = "Tera sedang memahami profil kamu" }: TeraProcessingProps) => {
  const dot1 = useRef(new Animated.Value(0)).current;
  const dot2 = useRef(new Animated.Value(0)).current;
  const dot3 = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const createBounce = (dot: Animated.Value, delay: number) => {
      return Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(dot, {
            toValue: -8,
            duration: 400,
            useNativeDriver: true,
          }),
          Animated.timing(dot, {
            toValue: 0,
            duration: 400,
            useNativeDriver: true,
          }),
          Animated.delay(600 - delay > 0 ? 600 - delay : 200),
        ])
      );
    };

    const anim1 = createBounce(dot1, 0);
    const anim2 = createBounce(dot2, 200);
    const anim3 = createBounce(dot3, 400);

    anim1.start();
    anim2.start();
    anim3.start();

    return () => {
      anim1.stop();
      anim2.stop();
      anim3.stop();
    };
  }, []);

  return (
    <View style={styles.teraProcessingContainer}>
      <View style={styles.teraIconContainer}>
        <MaterialCommunityIcons name="creation" size={44} color="#27AE60" />
      </View>
      <Text style={styles.teraProcessingTitle}>{title}</Text>
      <Text style={styles.teraProcessingSub}>Menyiapkan pengalaman terbaik untukmu</Text>
      <View style={styles.loadingDots}>
        <Animated.View style={[styles.dot, { transform: [{ translateY: dot1 }] }]} />
        <Animated.View style={[styles.dot, { transform: [{ translateY: dot2 }] }]} />
        <Animated.View style={[styles.dot, { transform: [{ translateY: dot3 }] }]} />
      </View>
    </View>
  );
};

interface TeraIntroProps {
  onContinue: () => void;
}

export const TeraIntro = ({ onContinue }: TeraIntroProps) => {
  const [subStep, setSubStep] = useState(0);
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const slideAnim = useRef(new Animated.Value(0)).current;
  const textFadeAnim = useRef(new Animated.Value(1)).current;

  const slides = [
    {
      image: require('../../assets/images/Adobe Express - file (11) 1.png'),
      title: "Kenalin, Aku Tera!",
      desc: "Aku rekan yang bakal nemenin kamu di aplikasi ChatAja!. \n\nMau tahu aku bisa bantu apa aja? Lanjutkan ya."
    },
    {
      image: require('../../assets/images/jaga.png'),
      title: "Jaga Kerahasiaan Data",
      desc: "Data yang Anda input akan dijaga kerahasiaannya. Tenang aja, data tidak akan digunakan untuk kepentingan komersial."
    },
    {
      image: require('../../assets/images/analisa.png'),
      title: "Analisa insight penting",
      desc: "Aku olah data dan input kamu jadi insight yang jelas.\n\nFokus ke hal yang paling berdampak buat keputusan."
    },
    {
      image: require('../../assets/images/atur.png'),
      title: "Atur semua jadwal",
      desc: "Aku bantu rapihin dan susun jadwal kamu dengan jelas.\n\nKamu tinggal fokus eksekusi tanpa ribet."
    }
  ];

  const handleNext = () => {
    if (subStep < slides.length - 1) {
      // Phase 1: Everything Disappears (Old text & image)
      Animated.parallel([
        Animated.timing(fadeAnim, { toValue: 0, duration: 200, useNativeDriver: true }),
        Animated.timing(textFadeAnim, { toValue: 0, duration: 50, useNativeDriver: true })
      ]).start(() => {
        // Change Step
        setSubStep(prev => prev + 1);
        
        // Prepare New Image outside
        slideAnim.setValue(500);
        fadeAnim.setValue(1);

        // Phase 2: Show New Text First (Blink)
        Animated.timing(textFadeAnim, { toValue: 1, duration: 50, useNativeDriver: true }).start(() => {
          // Phase 3: New Image Slides In after text is already visible
          Animated.timing(slideAnim, { toValue: 0, duration: 450, easing: Easing.out(Easing.quad), useNativeDriver: true }).start();
        });
      });
    } else {
      onContinue();
    }
  };

  const currentSlide = slides[subStep];

  return (
    <View style={styles.teraIntroContainer}>
      <Animated.View style={{ 
        opacity: fadeAnim, 
        transform: [{ translateX: slideAnim }],
        alignItems: 'center',
        width: '100%'
      }}>
        <Image 
          source={currentSlide.image} 
          style={styles.teraRobotImageLarge} 
          resizeMode="contain" 
        />
      </Animated.View>
      
      <Animated.View style={{ opacity: textFadeAnim, alignItems: 'center', width: '100%' }}>
        <View style={styles.teraTextContent}>
          <Text style={styles.teraIntroTitle}>{currentSlide.title}</Text>
          <Text style={styles.teraIntroDesc}>{currentSlide.desc}</Text>
        </View>
      </Animated.View>

      <TouchableOpacity 
        style={styles.teraTextButton} 
        onPress={handleNext}
      >
        <Text style={styles.teraContinueTextGreen}>
          {subStep === slides.length - 1 ? 'Selesai' : 'Lanjutkan'}
        </Text>
      </TouchableOpacity>
      
      <View style={styles.paginationDots}>
        <View style={[styles.pDot, subStep === 0 && styles.pDotActive]} />
        <View style={[styles.pDot, subStep === 1 && styles.pDotActive]} />
        <View style={[styles.pDot, subStep === 2 && styles.pDotActive]} />
        <View style={[styles.pDot, subStep === 3 && styles.pDotActive]} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  teraProcessingContainer: { alignItems: 'center', paddingVertical: 40 },
  teraIconContainer: { width: 100, height: 100, borderRadius: 50, backgroundColor: '#F0F9F4', justifyContent: 'center', alignItems: 'center', marginBottom: 35 },
  teraProcessingTitle: { fontSize: 20, fontWeight: '800', color: '#1A1A1A', textAlign: 'center', marginBottom: 12, paddingHorizontal: 20 },
  teraProcessingSub: { fontSize: 13, color: '#999', textAlign: 'center', marginBottom: 45, paddingHorizontal: 40 },
  loadingDots: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', height: 20 },
  dot: { width: 10, height: 10, borderRadius: 5, backgroundColor: '#27AE60', marginHorizontal: 6 },
  teraIntroContainer: { alignItems: 'center', paddingTop: 0, paddingBottom: 10 },
  teraRobotImageLarge: { width: 200, height: 200, marginBottom: 20 },
  teraTextContent: { alignItems: 'center', marginBottom: 30, paddingHorizontal: 20 },
  teraIntroTitle: { fontSize: 22, fontWeight: '800', color: '#1A1A1A', marginBottom: 15 },
  teraIntroDesc: { fontSize: 13, color: '#666', textAlign: 'center', lineHeight: 20 },
  teraTextButton: { paddingVertical: 12, paddingHorizontal: 40, marginBottom: 20 },
  teraContinueTextGreen: { fontSize: 16, fontWeight: '700', color: '#27AE60' },
  paginationDots: { flexDirection: 'row', justifyContent: 'center', marginTop: 10 },
  pDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#DDD', marginHorizontal: 4 },
  pDotActive: { backgroundColor: '#27AE60' },
});
