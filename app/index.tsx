import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, View, Text, SafeAreaView, TouchableOpacity, TextInput, Image, Platform, StatusBar, ScrollView, useWindowDimensions, NativeSyntheticEvent, NativeScrollEvent } from 'react-native';
import { useRouter } from 'expo-router';

const ONBOARDING_DATA = [
  {
    id: '1',
    emoji: '👋',
    title: '#Kenalin Tera',
    subtitle: 'AI partner kamu di ITD Summit',
    desc: 'Bantu ubah diskusi jadi insight dan dokumen siap pakai',
  },
  {
    id: '2',
    emoji: '💰',
    title: '#Dari panjang jadi kepake',
    subtitle: 'Insight dalam hitungan detik',
    desc: 'Ringkas sesi dan ambil poin penting tanpa baca ulang',
  },
  {
    id: '3',
    emoji: '🎯',
    title: '#Fokus pada substansi',
    subtitle: 'Biar Tera yang mencatat',
    desc: 'Jangan terlewat detail penting saat rapat',
  },
  {
    id: '4',
    emoji: '🚀',
    title: '#Lebih produktif',
    subtitle: 'Aksi nyata setelah diskusi',
    desc: 'Dapatkan action items secara otomatis',
  }
];

export default function OnboardingScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);
  const { width } = useWindowDimensions();
  const slideWidth = width - 40; // Subtract paddingHorizontal of the container
  const scrollViewRef = useRef<ScrollView>(null);

  useEffect(() => {
    const timer = setInterval(() => {
      let nextIndex = currentIndex + 1;
      if (nextIndex >= ONBOARDING_DATA.length) {
        nextIndex = 0;
      }
      scrollViewRef.current?.scrollTo({ x: nextIndex * slideWidth, animated: true });
    }, 2500);

    return () => clearInterval(timer);
  }, [currentIndex, slideWidth]);

  const navigateToHome = () => {
    router.replace('/(tabs)/chats');
  };

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const offsetX = event.nativeEvent.contentOffset.x;
    const index = Math.round(offsetX / slideWidth);
    if (currentIndex !== index) {
      setCurrentIndex(index);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Top Left Button */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.exploreBtn} activeOpacity={0.7} onPress={navigateToHome}>
            <Text style={styles.exploreBtnText}>Jelajahi Fitur</Text>
          </TouchableOpacity>
        </View>

        {/* Content Centered */}
        <View style={styles.content}>
          <View style={{ width: '100%' }}>
            <ScrollView
              ref={scrollViewRef}
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              onScroll={handleScroll}
              scrollEventThrottle={16}
              contentContainerStyle={{ paddingTop: 10 }}
            >
              {ONBOARDING_DATA.map((item) => (
                <View key={item.id} style={{ width: slideWidth, alignItems: 'center' }}>
                  <View style={styles.illustrationContainer}>
                    <Text style={styles.illustrationEmoji}>{item.emoji}</Text>
                  </View>

                  <View style={styles.textContainer}>
                    <Text style={styles.titleText}>{item.title}</Text>
                    <Text style={styles.subtitleText}>{item.subtitle}</Text>
                    <Text style={styles.descText}>{item.desc}</Text>
                  </View>
                </View>
              ))}
            </ScrollView>
          </View>

          {/* Progress Indicator */}
          <View style={styles.progressContainer}>
            {ONBOARDING_DATA.map((_, index) => (
              <View
                key={index}
                style={[
                  styles.progressDot,
                  currentIndex === index && styles.progressDotActive
                ]}
              />
            ))}
          </View>

          {/* Inputs & Buttons */}
          <View style={styles.formContainer}>
            <TextInput
              style={styles.input}
              placeholder="Email"
              placeholderTextColor="#999"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />

            <TouchableOpacity
              style={styles.nextButton}
              activeOpacity={0.8}
              onPress={navigateToHome}
            >
              <Text style={styles.nextButtonText}>Next</Text>
            </TouchableOpacity>

            <View style={styles.dividerContainer}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>or</Text>
              <View style={styles.dividerLine} />
            </View>

            <TouchableOpacity
              style={styles.googleButton}
              activeOpacity={0.7}
              onPress={navigateToHome}
            >
              <Image
                source={{ uri: 'https://img.icons8.com/color/48/000000/google-logo.png' }}
                style={styles.googleIcon}
              />
              <Text style={styles.googleButtonText}>Sign in with Google</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Image
            source={require('../assets/images/logo.jpg')}
            style={styles.logoImage}
          />
          <Text style={styles.versionText}>v1.4.1</Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FAFAFD', // Light greyish background as in image
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  container: {
    flex: 1,
    paddingHorizontal: 20,
  },
  header: {
    paddingVertical: 15,
  },
  exploreBtn: {
    alignSelf: 'flex-start',
    backgroundColor: '#F0F2F5',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#EAEAEA',
  },
  exploreBtnText: {
    fontSize: 12,
    color: '#333',
    fontWeight: '600',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: -40, // slightly adjust vertical center
  },
  illustrationContainer: {
    width: 200,
    height: 200,
    backgroundColor: '#F5F5F5',
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 30,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
  },
  illustrationEmoji: {
    fontSize: 80,
  },
  textContainer: {
    width: '100%',
    alignItems: 'flex-start',
    marginBottom: 30,
  },
  titleText: {
    fontSize: 24,
    fontWeight: '900',
    color: '#111',
    marginBottom: 4,
  },
  subtitleText: {
    fontSize: 22,
    fontWeight: '800',
    color: '#0F9D58', // Green color
    marginBottom: 10,
  },
  descText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  progressContainer: {
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'space-between',
    marginBottom: 40,
    gap: 10,
  },
  progressDot: {
    flex: 1,
    height: 3,
    backgroundColor: '#E0E0E0',
    borderRadius: 2,
  },
  progressDotActive: {
    backgroundColor: '#0F9D58',
  },
  formContainer: {
    width: '100%',
  },
  input: {
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: '#333',
    marginBottom: 15,
  },
  nextButton: {
    backgroundColor: '#74C69D', // Light green matches image
    borderRadius: 24,
    paddingVertical: 14,
    alignItems: 'center',
    marginBottom: 20,
  },
  nextButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '700',
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#EAEAEA',
  },
  dividerText: {
    marginHorizontal: 10,
    color: '#999',
    fontSize: 14,
  },
  googleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#EAEAEA',
    borderRadius: 24,
    paddingVertical: 14,
  },
  googleIcon: {
    width: 20,
    height: 20,
    marginRight: 10,
  },
  googleButtonText: {
    color: '#333',
    fontSize: 15,
    fontWeight: '600',
  },
  footer: {
    alignItems: 'center',
    paddingBottom: 20,
  },
  logoImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginBottom: 8,
  },
  versionText: {
    fontSize: 12,
    color: '#999',
    fontWeight: '500',
  },
});
