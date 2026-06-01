import React from 'react';
import { StyleSheet, View, Text, ActivityIndicator } from 'react-native';
import { Lock } from 'lucide-react-native';

interface ChatMessagesHeaderProps {
  isLoadingMore: boolean;
}

export function ChatMessagesHeader({ isLoadingMore }: ChatMessagesHeaderProps) {
  return (
    <View>
      <View style={{ height: 40, justifyContent: 'center' }}>
        {isLoadingMore && <ActivityIndicator color="#25D366" />}
      </View>
      <View style={styles.encryptedBannerWrapper}>
        <View style={styles.encryptedBanner}>
          <Lock color="#D4A106" size={14} style={{ marginRight: 6 }} />
          <Text style={styles.encryptedText}>Messages are end-to-end encrypted</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  encryptedBannerWrapper: { alignItems: 'center', marginVertical: 15 },
  encryptedBanner: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FCF3C6', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 },
  encryptedText: { fontSize: 12, color: '#4B4228', fontWeight: '500' },
});
