import { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  SafeAreaView,
  TextInput,
  Platform,
  StatusBar,
} from 'react-native';
import { MessageSquare, Search, Menu, MapPin, Heart, Clock, Play } from 'lucide-react-native';
import { sessions } from '@/data/sessions';

type FilterType = 'All Sessions' | 'My Favorites';
type DateFilter = 'All days' | 'Feb 3' | 'Feb 4';

export default function AgendaScreen() {
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [sessionFilter, setSessionFilter] = useState<FilterType>('All Sessions');
  const [dateFilter, setDateFilter] = useState<DateFilter>('All days');
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);

  const toggleFavorite = (sessionId: string) => {
    setFavorites((prev) => {
      const newFavorites = new Set(prev);
      if (newFavorites.has(sessionId)) {
        newFavorites.delete(sessionId);
      } else {
        newFavorites.add(sessionId);
      }
      return newFavorites;
    });
  };

  const filteredSessions = useMemo(() => {
    return sessions.filter((session) => {
      const matchesSearch = 
        session.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        session.speakers.some(s => s.name.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchesSessionFilter =
        sessionFilter === 'All Sessions' || favorites.has(session.id);
      const matchesDateFilter =
        dateFilter === 'All days' || session.date === dateFilter;
      
      return matchesSearch && matchesSessionFilter && matchesDateFilter;
    });
  }, [searchQuery, sessionFilter, dateFilter, favorites]);

  const dates: DateFilter[] = ['All days', 'Feb 3', 'Feb 4'];

  // Mock "Live" status logic for showcase
  const getSessionStatus = (sessionId: string) => {
    if (sessionId === '1') return 'LIVE';
    if (sessionId === '2') return 'STARTING SOON';
    return null;
  };

  const getTrackColor = (track: string) => {
    switch (track) {
      case 'Track 1': return '#00BCD4';
      case 'Track 2': return '#673AB7';
      default: return '#666';
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        {!showSearch ? (
          <>
            <Image
              source={{ uri: 'https://i.pravatar.cc/150?u=myprofile' }}
              style={styles.profileImage}
            />
            <Text style={styles.headerTitle}>Agenda</Text>
            <View style={styles.headerIcons}>
              <TouchableOpacity style={styles.iconButton} onPress={() => setShowSearch(true)}>
                <Search size={22} color="#333" />
              </TouchableOpacity>
              <TouchableOpacity style={styles.iconButton}>
                <Menu size={22} color="#333" />
              </TouchableOpacity>
            </View>
          </>
        ) : (
          <View style={styles.searchBarWrapper}>
            <Search size={20} color="#999" />
            <TextInput
              style={styles.searchInput}
              placeholder="Cari sesi atau pembicara..."
              value={searchQuery}
              onChangeText={setSearchQuery}
              autoFocus
            />
            <TouchableOpacity onPress={() => { setShowSearch(false); setSearchQuery(''); }}>
              <Text style={styles.cancelSearchText}>Batal</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      <ScrollView style={styles.content} stickyHeaderIndices={[0]} showsVerticalScrollIndicator={false}>
        <View style={styles.stickyFilters}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.dateFilterContainer}
            contentContainerStyle={styles.dateFilterContent}
          >
            {dates.map((date) => (
              <TouchableOpacity
                key={date}
                onPress={() => setDateFilter(date)}
                style={[
                  styles.dateFilter,
                  dateFilter === date && styles.dateFilterActive
                ]}>
                <Text
                  style={[
                    styles.dateFilterText,
                    dateFilter === date && styles.dateFilterTextActive,
                  ]}>
                  {date}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          <View style={styles.sessionFilterContainer}>
            <TouchableOpacity
              onPress={() => setSessionFilter('All Sessions')}
              style={[
                styles.sessionFilterButton,
                sessionFilter === 'All Sessions' && styles.sessionFilterButtonActive,
              ]}>
              <Text style={[
                styles.sessionFilterText,
                sessionFilter === 'All Sessions' && styles.sessionFilterTextActive
              ]}>Semua Sesi</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setSessionFilter('My Favorites')}
              style={[
                styles.sessionFilterButton,
                sessionFilter === 'My Favorites' && styles.sessionFilterButtonActive,
              ]}>
              <Heart 
                size={14} 
                color={sessionFilter === 'My Favorites' ? '#FFF' : '#333'} 
                fill={sessionFilter === 'My Favorites' ? '#FFF' : 'none'}
              />
              <Text style={[
                styles.sessionFilterText,
                styles.favText,
                sessionFilter === 'My Favorites' && styles.sessionFilterTextActive
              ]}>Favorit saya</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.sessionsWrapper}>
          <View style={styles.timelineLine} />
          {filteredSessions.map((session, index) => {
            const status = getSessionStatus(session.id);
            const trackColor = getTrackColor(session.track);
            
            return (
              <View key={session.id} style={styles.sessionItem}>
                <View style={styles.timelinePointContainer}>
                  <View style={[styles.timelinePoint, status === 'LIVE' && styles.timelinePointLive]} />
                </View>

                <View style={styles.sessionCard}>
                  <View style={styles.cardHeader}>
                    <View style={[styles.trackBadge, { backgroundColor: trackColor + '20' }]}>
                      <Text style={[styles.trackBadgeText, { color: trackColor }]}>{session.track}</Text>
                    </View>
                    {status && (
                      <View style={[styles.statusBadge, status === 'LIVE' ? styles.liveBadge : styles.soonBadge]}>
                        {status === 'LIVE' && <View style={styles.liveDot} />}
                        <Text style={styles.statusBadgeText}>{status}</Text>
                      </View>
                    )}
                  </View>

                  <Text style={styles.sessionTitle}>{session.title}</Text>

                  <View style={styles.timeInfoRow}>
                    <Clock size={14} color="#666" />
                    <Text style={styles.sessionTime}>
                      {session.startTime} - {session.endTime} ({session.duration})
                    </Text>
                    <MapPin size={14} color="#666" style={{ marginLeft: 12 }} />
                    <Text style={styles.trackText}>{session.track}</Text>
                  </View>

                  <View style={styles.divider} />

                  <View style={styles.cardFooter}>
                    <View style={styles.speakersContainer}>
                      {session.speakers.map((speaker) => (
                        <View key={speaker.id} style={styles.speakerMiniRow}>
                          <Image source={{ uri: speaker.avatar }} style={styles.speakerMiniImage} />
                          <Text style={styles.speakerMiniName}>{speaker.name}</Text>
                        </View>
                      ))}
                    </View>
                    
                    <View style={styles.cardActions}>
                      {status === 'LIVE' && (
                        <TouchableOpacity style={styles.joinButton}>
                          <Play size={12} color="#FFF" fill="#FFF" />
                          <Text style={styles.joinButtonText}>Gabung</Text>
                        </TouchableOpacity>
                      )}
                      <TouchableOpacity
                        style={[styles.favIconBtn, favorites.has(session.id) && styles.favIconBtnActive]}
                        onPress={() => toggleFavorite(session.id)}>
                        <Heart
                          size={20}
                          color={favorites.has(session.id) ? '#FFF' : '#666'}
                          fill={favorites.has(session.id) ? '#FFF' : 'none'}
                        />
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              </View>
            );
          })}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#EEE',
    height: 60,
  },
  headerTitle: {
    flex: 1,
    fontSize: 20,
    fontWeight: '700',
    color: '#000',
    marginLeft: 12,
  },
  profileImage: {
    width: 36,
    height: 36,
    borderRadius: 18,
  },
  headerIcons: {
    flexDirection: 'row',
    gap: 8,
  },
  iconButton: {
    padding: 8,
  },
  searchBarWrapper: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0F2F5',
    borderRadius: 10,
    paddingHorizontal: 10,
    height: 40,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 15,
    color: '#000',
  },
  cancelSearchText: {
    marginLeft: 10,
    color: '#00BCD4',
    fontWeight: '600',
  },
  content: {
    flex: 1,
  },
  stickyFilters: {
    backgroundColor: '#FFF',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  dateFilterContainer: {
    paddingVertical: 12,
  },
  dateFilterContent: {
    paddingHorizontal: 16,
    gap: 10,
  },
  dateFilter: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F5F5F5',
  },
  dateFilterActive: {
    backgroundColor: '#00BCD420',
  },
  dateFilterText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  dateFilterTextActive: {
    color: '#00BCD4',
    fontWeight: '700',
  },
  sessionFilterContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingBottom: 12,
    gap: 10,
  },
  sessionFilterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 18,
    backgroundColor: '#F0F2F5',
  },
  sessionFilterButtonActive: {
    backgroundColor: '#333',
  },
  sessionFilterText: {
    fontSize: 13,
    color: '#333',
    fontWeight: '600',
  },
  favText: {
    marginLeft: 6,
  },
  sessionFilterTextActive: {
    color: '#FFF',
  },
  sessionsWrapper: {
    padding: 16,
    paddingLeft: 24,
  },
  timelineLine: {
    position: 'absolute',
    left: 31,
    top: 0,
    bottom: 0,
    width: 2,
    backgroundColor: '#E9ECEF',
  },
  sessionItem: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  timelinePointContainer: {
    width: 16,
    alignItems: 'center',
    marginRight: 15,
    paddingTop: 15,
  },
  timelinePoint: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#CED4DA',
    borderWidth: 2,
    borderColor: '#FFF',
    zIndex: 1,
  },
  timelinePointLive: {
    backgroundColor: '#00BCD4',
    width: 16,
    height: 16,
    borderRadius: 8,
    marginLeft: -2,
    shadowColor: '#00BCD4',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 5,
  },
  sessionCard: {
    flex: 1,
    backgroundColor: '#FFF',
    borderRadius: 15,
    padding: 15,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  trackBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  trackBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  liveBadge: {
    backgroundColor: '#00BCD4',
  },
  soonBadge: {
    backgroundColor: '#FFC107',
  },
  statusBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#FFF',
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#FFF',
    marginRight: 5,
  },
  sessionTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#000',
    marginBottom: 8,
    lineHeight: 22,
  },
  timeInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  sessionTime: {
    fontSize: 12,
    color: '#666',
    marginLeft: 4,
  },
  trackText: {
    fontSize: 12,
    color: '#666',
    marginLeft: 4,
  },
  divider: {
    height: 1,
    backgroundColor: '#F1F3F5',
    marginBottom: 12,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  speakersContainer: {
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  speakerMiniRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  speakerMiniImage: {
    width: 24,
    height: 24,
    borderRadius: 12,
  },
  speakerMiniName: {
    fontSize: 12,
    color: '#333',
    fontWeight: '500',
  },
  cardActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  joinButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#00BCD4',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    gap: 4,
  },
  joinButtonText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFF',
  },
  favIconBtn: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#F8F9FA',
    borderWidth: 1,
    borderColor: '#E9ECEF',
  },
  favIconBtnActive: {
    backgroundColor: '#FF4444',
    borderColor: '#FF4444',
  },
});
;
