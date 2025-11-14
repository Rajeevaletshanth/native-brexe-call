import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, LoginPayload } from '../types/auth';
import { storage } from '../utils/storage';
import { api } from '../utils/api';
// import { TwilioManager } from '@/utils/TwilioManager'; // TODO: Manually configure Twilio

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

/**
 * Main function to initialize all services after auth
 * TODO: This will need to be re-written based on the new native libraries
 * (e.g., react-native-push-notification, react-native-vision-camera)
 */
async function initializeServices() {
  try {
    console.log('TODO: Request permissions for new native modules');
    // const hasPermissions = await TwilioManager.requestPermissions();
    // if (!hasPermissions) return;
    // await TwilioManager.registerForPushNotifications();
    // const { token: twilioToken } = await api.getTwilioToken();
    // await TwilioManager.initialize();
  } catch (error) {
    console.error('Error initializing services:', error);
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    validateSession();
  }, []);

  // This function is identical to your original
  const validateSession = async () => {
    try {
      const savedToken = await storage.getToken();
      const savedUser = await storage.getUser();

      if (savedToken && savedUser) {
        const validation = await api.validateToken(savedToken);
        if (validation.authenticate) {
          setToken(savedToken);
          setUser(savedUser);
          await initializeServices();
        } else {
          await storage.clear();
        }
      }
    } catch (error) {
      await storage.clear();
    } finally {
      setIsLoading(false);
    }
  };

  // This function is identical to your original
  const login = async (email: string, password: string) => {
    const payload: LoginPayload = {
      email,
      password,
      signedIn: true,
      language: 'en',
    };

    const response = await api.login(payload);

    await storage.setToken(response.token);
    await storage.setUser(response.user);

    setToken(response.token);
    setUser(response.user);

    await initializeServices();
  };

  // This function is identical to your original
  const logout = async () => {
    // await TwilioManager.cleanup(); // TODO: Add cleanup
    await storage.clear();
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        login,
        logout,
        isAuthenticated: !!token && !!user,
      }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}