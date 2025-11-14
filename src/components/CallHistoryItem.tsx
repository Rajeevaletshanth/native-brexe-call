// This file is a direct copy from your original project
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import {
  PhoneIncoming,
  PhoneOutgoing,
  PhoneMissed,
} from 'lucide-react-native';
import { CallRecord } from '../types/auth';

interface CallHistoryItemProps {
  call: CallRecord;
  onPress: () => void;
}

export function CallHistoryItem({ call, onPress }: CallHistoryItemProps) {
  const getIcon = () => {
    if (call.status === 'missed') {
      return <PhoneMissed size={20} color="#EF4444" />;
    }
    if (call.type === 'incoming') {
      return <PhoneIncoming size={20} color="#10B981" />;
    }
    return <PhoneOutgoing size={20} color="#2563EB" />;
  };

  const getStatusColor = () => {
    if (call.status === 'missed') {
      return '#EF4444';
    }
    return '#6B7280';
  };

  const formatTimestamp = (isoString: string) => {
    const date = new Date(isoString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <TouchableOpacity style={styles.container} onPress={onPress}>
      <View style={[styles.iconContainer, { backgroundColor: '#F9FAFB' }]}>
        {getIcon()}
      </View>
      <View style={styles.infoContainer}>
        <Text style={styles.name}>{call.name}</Text>
        <Text style={[styles.status, { color: getStatusColor() }]}>
          {call.type} {call.status}
        </Text>
      </View>
      <View style={styles.timeContainer}>
        <Text style={styles.timestamp}>{formatTimestamp(call.timestamp)}</Text>
        {call.status === 'completed' && (
          <Text style={styles.duration}>{call.duration}</Text>
        )}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
    backgroundColor: '#FFFFFF',
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  infoContainer: {
    flex: 1,
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  status: {
    fontSize: 14,
    textTransform: 'capitalize',
  },
  timeContainer: {
    alignItems: 'flex-end',
  },
  timestamp: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 4,
  },
  duration: {
    fontSize: 14,
    color: '#9CA3AF',
  },
});