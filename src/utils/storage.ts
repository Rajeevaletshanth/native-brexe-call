// This file is a direct copy from your original project
import AsyncStorage from '@react-native-async-storage/async-storage';
import { User } from '../types/auth';

const STORAGE_KEYS = {
  TOKEN: '@brexe_token',
  USER: '@brexe_user',
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

  async clear(): Promise<void> {
    await AsyncStorage.multiRemove([STORAGE_KEYS.TOKEN, STORAGE_KEYS.USER]);
  },
};