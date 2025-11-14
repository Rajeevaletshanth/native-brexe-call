import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

// Placeholder for your app/(tabs)/history.tsx
export default function HistoryScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Call History</Text>
      <Text style={styles.subtitle}>
        Your call history will appear here.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
  },
  title: {
    fontSize: 22,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#6B7280',
  },
});