import { View, Text, StyleSheet, SafeAreaView, Image, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import {
  Calendar,
  MapPin,
  Users,
  Clock,
  ArrowRight,
  MessageSquare,
  Navigation,
  HelpCircle,
  Bell
} from 'lucide-react-native';
import { sessions } from '../../data/sessions';
import { useRouter } from 'expo-router';

const { width } = Dimensions.get('window');

export default function HomeScreen() {
  const router = useRouter();

  // Get the first session as "Next Session" for demo
  const nextSession = sessions[0];

  // Get all unique speakers for "Featured Speakers"
  const featuredSpeakers = sessions.flatMap(s => s.speakers).slice(0, 6);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Header / Hero Section */}
        <LinearGradient
          colors={['#00BCD4', '#0097A7']}
          style={styles.hero}
        >
          <View style={styles.topHeader}>
            <View>
              <Text style={styles.welcomeText}>Halo, Selamat Siang!</Text>
              <Text style={styles.heroTitle}>AI Insights 2026</Text>
            </View>
            <TouchableOpacity style={styles.notificationBtn}>
              <Bell size={24} color="#FFF" />
              <View style={styles.notifBadge} />
            </TouchableOpacity>
          </View>

          <View style={styles.countdownContainer}>
            <View style={styles.countdownItem}>
              <Text style={styles.countdownValue}>02</Text>
              <Text style={styles.countdownLabel}>Hari</Text>
            </View>
            <Text style={styles.countdownDivider}>:</Text>
            <View style={styles.countdownItem}>
              <Text style={styles.countdownValue}>14</Text>
              <Text style={styles.countdownLabel}>Jam</Text>
            </View>
            <Text style={styles.countdownDivider}>:</Text>
            <View style={styles.countdownItem}>
              <Text style={styles.countdownValue}>45</Text>
              <Text style={styles.countdownLabel}>Menit</Text>
            </View>
          </View>
        </LinearGradient>

        <View style={styles.dashboardContent}>
          {/* Quick Actions Grid */}
          <View style={styles.quickActionsGrid}>
            <TouchableOpacity style={styles.actionItem} onPress={() => router.push('/agenda')}>
              <View style={[styles.actionIcon, { backgroundColor: '#E3F2FD' }]}>
                <Calendar size={24} color="#2196F3" />
              </View>
              <Text style={styles.actionLabel}>Agenda</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionItem} onPress={() => router.push('/networking')}>
              <View style={[styles.actionIcon, { backgroundColor: '#F3E5F5' }]}>
                <Users size={24} color="#9C27B0" />
              </View>
              <Text style={styles.actionLabel}>Networking</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionItem} onPress={() => router.push('/chats')}>
              <View style={[styles.actionIcon, { backgroundColor: '#E0F2F1' }]}>
                <MessageSquare size={24} color="#009688" />
              </View>
              <Text style={styles.actionLabel}>Obrolan</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionItem}>
              <View style={[styles.actionIcon, { backgroundColor: '#FFF3E0' }]}>
                <Navigation size={24} color="#FF9800" />
              </View>
              <Text style={styles.actionLabel}>Peta</Text>
            </TouchableOpacity>
          </View>

          {/* Next Session Widget */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Sesi Berikutnya</Text>
            <TouchableOpacity onPress={() => router.push('/agenda')}>
              <Text style={styles.seeAllText}>Lihat Semua</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={styles.nextSessionCard}
            onPress={() => router.push({ pathname: '/agenda', params: { sessionId: nextSession.id } })}
          >
            <LinearGradient
              colors={['#FFF', '#F8F9FA']}
              style={styles.nextSessionContent}
            >
              <View style={styles.sessionTimeTag}>
                <Clock size={14} color="#00BCD4" />
                <Text style={styles.sessionTimeText}>{nextSession.startTime} - {nextSession.endTime}</Text>
              </View>
              <Text style={styles.sessionTitleText}>{nextSession.title}</Text>
              <View style={styles.sessionFooter}>
                <View style={[styles.trackBadge, { backgroundColor: '#00BCD420' }]}>
                  <Text style={[styles.trackBadgeText, { color: '#00BCD4' }]}>{nextSession.track}</Text>
                </View>
                <ArrowRight size={20} color="#00BCD4" />
              </View>
            </LinearGradient>
          </TouchableOpacity>

          {/* Featured Speakers */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Pembicara Unggulan</Text>
          </View>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.speakersScroll}
          >
            {featuredSpeakers.map((speaker, index) => (
              <TouchableOpacity key={`${speaker.id}-${index}`} style={styles.speakerCard}>
                <Image source={{ uri: speaker.avatar }} style={styles.speakerImage} />
                <Text style={styles.speakerName} numberOfLines={1}>{speaker.name}</Text>
                <Text style={styles.speakerCompany} numberOfLines={1}>{speaker.company}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Announcements */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Pengumuman</Text>
          </View>
          <View style={styles.announcementCard}>
            <View style={styles.announcementIcon}>
              <Bell size={20} color="#00BCD4" />
            </View>
            <View style={styles.announcementTextContainer}>
              <Text style={styles.announcementTitle}>Registrasi Ulang Dibuka</Text>
              <Text style={styles.announcementDate}>10 Menit yang lalu</Text>
              <Text style={styles.announcementDesc}>Silakan kunjungi loket utama untuk pengambilan name tag dan souvenir.</Text>
            </View>
          </View>

          {/* Sponsors Section */}
          <View style={styles.sponsorsSection}>
            <Text style={styles.sponsorsTitle}>Disponsori Oleh</Text>
            <View style={styles.sponsorsGrid}>
              <Image source={{ uri: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2f/Google_2015_logo.svg/2560px-Google_2015_logo.svg.png' }} style={styles.sponsorLogo} resizeMode="contain" />
              <Image source={{ uri: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/44/Microsoft_logo.svg/2048px-Microsoft_logo.svg.png' }} style={styles.sponsorLogo} resizeMode="contain" />
              <Image source={{ uri: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/51/IBM_logo.svg/2560px-IBM_logo.svg.png' }} style={styles.sponsorLogo} resizeMode="contain" />
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  content: {
    flex: 1,
  },
  hero: {
    paddingTop: 40,
    paddingBottom: 30,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 3,
    borderBottomRightRadius: 3,
  },
  topHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 30,
  },
  welcomeText: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 14,
    fontWeight: '500',
  },
  heroTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#FFF',
    marginTop: 4,
  },
  notificationBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  notifBadge: {
    position: 'absolute',
    top: 10,
    right: 12,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#FF5252',
    borderWidth: 2,
    borderColor: '#00BCD4',
  },
  countdownContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    paddingVertical: 15,
    borderRadius: 20,
  },
  countdownItem: {
    alignItems: 'center',
    width: 60,
  },
  countdownValue: {
    fontSize: 24,
    fontWeight: '800',
    color: '#FFF',
  },
  countdownLabel: {
    fontSize: 10,
    color: 'rgba(255, 255, 255, 0.8)',
    textTransform: 'uppercase',
    marginTop: 2,
  },
  countdownDivider: {
    fontSize: 24,
    fontWeight: '800',
    color: '#FFF',
    marginBottom: 15,
  },
  dashboardContent: {
    padding: 20,
  },
  quickActionsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 30,
    marginTop: -40,
    backgroundColor: '#FFF',
    borderRadius: 20,
    padding: 20,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
  },
  actionItem: {
    alignItems: 'center',
  },
  actionIcon: {
    width: 50,
    height: 50,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  actionLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#444',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1A1A1A',
  },
  seeAllText: {
    color: '#00BCD4',
    fontWeight: '700',
    fontSize: 14,
  },
  nextSessionCard: {
    marginBottom: 30,
    borderRadius: 20,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    overflow: 'hidden',
  },
  nextSessionContent: {
    padding: 20,
  },
  sessionTimeTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E0F7FA',
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
    marginBottom: 12,
    gap: 6,
  },
  sessionTimeText: {
    fontSize: 12,
    color: '#00BCD4',
    fontWeight: '700',
  },
  sessionTitleText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 15,
    lineHeight: 24,
  },
  sessionFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  trackBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 6,
  },
  trackBadgeText: {
    fontSize: 11,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  speakersScroll: {
    paddingRight: 20,
    marginBottom: 30,
  },
  speakerCard: {
    width: 100,
    marginRight: 15,
    alignItems: 'center',
  },
  speakerImage: {
    width: 70,
    height: 70,
    borderRadius: 35,
    marginBottom: 8,
    borderWidth: 2,
    borderColor: '#FFF',
  },
  speakerName: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1A1A1A',
    textAlign: 'center',
  },
  speakerCompany: {
    fontSize: 10,
    color: '#666',
    textAlign: 'center',
  },
  announcementCard: {
    flexDirection: 'row',
    backgroundColor: '#FFF',
    padding: 16,
    borderRadius: 20,
    marginBottom: 30,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
  },
  announcementIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#E0F7FA',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  announcementTextContainer: {
    flex: 1,
  },
  announcementTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  announcementDate: {
    fontSize: 11,
    color: '#999',
    marginVertical: 4,
  },
  announcementDesc: {
    fontSize: 13,
    color: '#666',
    lineHeight: 18,
  },
  sponsorsSection: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  sponsorsTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#999',
    textTransform: 'uppercase',
    letterSpacing: 2,
    marginBottom: 20,
  },
  sponsorsGrid: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 30,
    opacity: 0.6,
  },
  sponsorLogo: {
    width: 80,
    height: 40,
  },
});
