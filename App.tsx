import React, { useEffect } from 'react';
import { ActivityIndicator, View, StyleSheet, StatusBar } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { TwilioManager } from './src/utils/TwilioManager';

import { AuthProvider, useAuth } from './src/contexts/AuthContext';
import LoginScreen from './src/screens/LoginScreen';
import DashboardScreen from './src/screens/DashboardScreen';
import HistoryScreen from './src/screens/HistoryScreen';
import ProfileScreen from './src/screens/ProfileScreen';

import { Phone, History, User } from 'lucide-react-native';

// --- Define our Navigators ---
const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

/**
 * This is the new replacement for your `app/(tabs)/_layout.tsx`
 */
function MainAppTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: '#2563EB',
        tabBarInactiveTintColor: '#6B7280',
        tabBarIcon: ({ color, size }) => {
          if (route.name === 'Dashboard') {
            return <Phone size={size} color={color} />;
          } else if (route.name === 'History') {
            return <History size={size} color={color} />;
          } else if (route.name === 'Profile') {
            return <User size={size} color={color} />;
          }
          return null;
        },
      })}>
      <Tab.Screen name="Dashboard" component={DashboardScreen} />
      <Tab.Screen name="History" component={HistoryScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}

/**
 * This is the new replacement for your `app/_layout.tsx`
 * It contains all the auth logic.
 */
function RootNavigator() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    // We're still checking for a token
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2563EB" />
      </View>
    );
  }

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {isAuthenticated ? (
        // User is signed in, show the main app
        <Stack.Screen name="MainApp" component={MainAppTabs} />
      ) : (
        // User is not signed in, show the login screen
        <Stack.Screen name="Login" component={LoginScreen} />
      )}
      {/* You can add other screens like "NotFound" here */}
    </Stack.Navigator>
  );
}

TwilioManager.initializeListeners();

/**
 * This is the main App component, wrapping everything in the providers.
 */
export default function App() {
  return (
    <AuthProvider>
      <NavigationContainer>
        <RootNavigator />
        <StatusBar barStyle="dark-content" />
      </NavigationContainer>
    </AuthProvider>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
  },
});