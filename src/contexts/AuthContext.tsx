import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, LoginPayload } from '../types/auth';
import { storage } from '../utils/storage';
import { api } from '../utils/api';
// Import the TwilioManager
import { TwilioManager } from '../utils/TwilioManager'; 

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
 * This is now updated to register the Twilio client.
 */
async function initializeServices() {
  try {
    console.log('Initializing services...');

    // 1. Request OS permissions for microphone, etc.
    const hasPermissions = await TwilioManager.requestPermissions();
    if (!hasPermissions) {
      console.error('Failed to get Twilio permissions.');
      return; 
    }

    // 2. Fetch the Twilio access token from your API
    const { token: twilioToken } = await api.getTwilioToken();

    // 3. Store the token for making outgoing calls (from Dashboard)
    await storage.setTwilioToken(twilioToken);

    // 4. Register this device with Twilio to receive incoming calls
    await TwilioManager.registerClient(twilioToken);

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

  const validateSession = async () => {
    try {
      const savedToken = await storage.getToken();
      const savedUser = await storage.getUser();

      if (savedToken && savedUser) {
        // Use the live API validation
        const validation = await api.validateToken(savedToken);
        
        // Check for 'authenticate: true' as per your API spec
        if (validation.authenticate === true) {
          setToken(savedToken);
          setUser(savedUser);
          // Initialize services on successful session validation
          await initializeServices();
        } else {
          await storage.clear();
        }
      }
    } catch (error) {
      console.error('Session validation failed:', error);
      await storage.clear();
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    const payload: LoginPayload = {
      email,
      password,
      signedIn: true,
      language: 'en',
    };

    // Use the live API login
    const response = await api.login(payload);

    await storage.setToken(response.token);
    await storage.setUser(response.user);

    setToken(response.token);
    setUser(response.user);

    // Initialize services on successful login
    await initializeServices();
  };

  const logout = async () => {
    try {
      // 1. Get the Twilio token to unregister the client
    //   const twilioToken = await storage.getTwilioToken();
    //   if (twilioToken) {
    //     await TwilioManager.cleanup(twilioToken);
    //   }

    await storage.clear();
      
      // 3. Clear app state
      setToken(null);
      setUser(null);
    } catch (error) {
      console.error('Error during Twilio cleanup:', error);
    } finally {
      // 2. Clear all items from storage
      await storage.clear();
      
      // 3. Clear app state
      setToken(null);
      setUser(null);
    }
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