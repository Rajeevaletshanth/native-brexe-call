// This file is a direct copy from your original project
import AsyncStorage from '@react-native-async-storage/async-storage';
import { User } from '../types/auth';

const STORAGE_KEYS = {
  TOKEN: '@brexe_token',
  USER: '@brexe_user',
  TWILIO_TOKEN: '@brexe_twilio_token', 
};

export const storage = {
  async setToken(token: string): Promise<void> {
    await AsyncStorage.setItem(STORAGE_KEYS.TOKEN, token);
  },

  async getToken(): Promise<string | null> {
    return await AsyncStorage.getItem(STORAGE_KEYS.TOKEN);
  },

  async setUser(user: User): Promise<void> {
    await AsyncStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
  },

  async getUser(): Promise<User | null> {
    const userString = await AsyncStorage.getItem(STORAGE_KEYS.USER);
    return userString ? JSON.parse(userString) : null;
  },

  // Added function to set Twilio token
  async setTwilioToken(token: string): Promise<void> {
    await AsyncStorage.setItem(STORAGE_KEYS.TWILIO_TOKEN, token);
  },

  // Added function to get Twilio token
  async getTwilioToken(): Promise<string | null> {
    return await AsyncStorage.getItem(STORAGE_KEYS.TWILIO_TOKEN);
  },

  async clear(): Promise<void> {
    // Added Twilio token to multiRemove
    await AsyncStorage.multiRemove([
      STORAGE_KEYS.TOKEN,
      STORAGE_KEYS.USER,
      STORAGE_KEYS.TWILIO_TOKEN,
    ]);
  },
};