import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import { CallHistoryItem } from '../components/CallHistoryItem';
import { CallRecord } from '../types/auth';
import { PhoneCall, TrendingUp, Clock, Users } from 'lucide-react-native';
import { TwilioManager } from '../utils/TwilioManager';
import { Input } from '../components/Input';
import { Button } from '../components/Button';
import { storage } from '../utils/storage'; // Import storage

// Mock data from your original file
const MOCK_CALLS: CallRecord[] = [
  {
    id: '1',
    name: 'Jane Cooper',
    number: '+1 (555) 123-4567',
    type: 'incoming',
    status: 'completed',
    duration: '2:34',
    timestamp: '2023-10-27T10:30:00Z',
  },
  {
    id: '2',
    name: 'John Doe',
    number: '+1 (555) 987-6543',
    type: 'outgoing',
    status: 'missed',
    duration: '0:00',
    timestamp: '2023-10-27T09:15:00Z',
  },
];

export default function DashboardScreen() {
  const { user } = useAuth();
  const [phoneNumber, setPhoneNumber] = useState('');

  // Make function async to await storage
  const handleMakeCall = async () => {
    console.log(phoneNumber);
    if (!phoneNumber) {
      Alert.alert('Error', 'Please enter a phone number to call.');
      return;
    }

    // Retrieve valid Twilio access token from storage per instructions
    const accessToken = await storage.getTwilioToken(); 

    if (!accessToken) {
      Alert.alert(
        'Error', 
        'Twilio token not found. Please log out and log in again.'
      );
      return;
    }

    // E.164 format is recommended (e.g., +1234567890)
    // TODO: Ensure TwilioManager is initialized in AuthContext
    TwilioManager.makeCall(accessToken, phoneNumber);

    Alert.alert('Make Call', `Calling ${phoneNumber}... (Twilio integration needed)`);
  };

  const handleCallPress = (call: CallRecord) => {
    Alert.alert('Call Details', `${call.name}\n${call.number}`);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>
            Hello, {user?.username || 'User'}
          </Text>
          <Text style={styles.subtitle}>Dashboard Overview</Text>
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.dialerContainer}>
          <Input
            label="Make a Call"
            placeholder="Enter phone number (e.g., +123...)"
            value={phoneNumber}
            onChangeText={setPhoneNumber}
            keyboardType="phone-pad"
            style={styles.dialerInput}
          />
          <Button
            title="Call"
            onPress={handleMakeCall}
            style={styles.callButton}
          />
        </View>

        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <View style={styles.statIconContainer}>
              <PhoneCall size={20} color="#2563EB" />
            </View>
            <Text style={styles.statValue}>24</Text>
            <Text style={styles.statLabel}>Total Calls</Text>
          </View>

          <View style={styles.statCard}>
            <View style={styles.statIconContainer}>
              <Clock size={20} color="#10B981" />
            </View>
            <Text style={styles.statValue}>2.5h</Text>
            <Text style={styles.statLabel}>Call Time</Text>
          </View>

          <View style={styles.statCard}>
            <View style={styles.statIconContainer}>
              <TrendingUp size={20} color="#F59E0B" />
            </View>
            <Text style={styles.statValue}>+12%</Text>
            <Text style={styles.statLabel}>This Week</Text>
          </View>

          <View style={styles.statCard}>
            <View style={styles.statIconContainer}>
              <Users size={20} color="#8B5CF6" />
            </View>
            <Text style={styles.statValue}>18</Text>
            <Text style={styles.statLabel}>Contacts</Text>
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Calls</Text>
            <TouchableOpacity>
              <Text style={styles.seeAll}>See All</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.callList}>
            {MOCK_CALLS.map((call) => (
              <CallHistoryItem
                key={call.id}
                call={call}
                onPress={() => handleCallPress(call)}
              />
            ))}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

// Styles are identical to your original file
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    backgroundColor: '#FFF',
    paddingHorizontal: 20,
    paddingTop: 60, // This might need to be adjusted with safe-area-context
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  greeting: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#6B7280',
  },
  content: {
    flex: 1,
  },
  dialerContainer: {
    backgroundColor: '#FFF',
    padding: 20,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  dialerInput: {
    marginBottom: 16,
  },
  callButton: {},
  statsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 16,
    gap: 12,
  },
  statCard: {
    flex: 1,
    minWidth: '47%',
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  statIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F9FAFB',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#6B7280',
  },
  section: {
    marginTop: 8,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  seeAll: {
    fontSize: 14,
    color: '#2563EB',
    fontWeight: '500',
  },
  callList: {
    backgroundColor: '#FFF',
  },
});