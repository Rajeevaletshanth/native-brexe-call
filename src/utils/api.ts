// This file is a direct copy from your original project
// (Assuming it has no native dependencies)
import { storage } from './storage';
import { LoginPayload } from '../types/auth';

const API_BASE_URL = 'https://api.yourdomain.com'; // TODO: Update this

type ApiOptions = {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  body?: Record<string, any>;
  headers?: Record<string, string>;
  needsAuth?: boolean;
};

async function apiFetch<T>(
  endpoint: string,
  options: ApiOptions = {},
): Promise<T> {
  const {
    method = 'GET',
    body,
    headers = {},
    needsAuth = false,
  } = options;

  const config: RequestInit = {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...headers,
    },
  };

  if (body) {
    config.body = JSON.stringify(body);
  }

  if (needsAuth) {
    const token = await storage.getToken();
    if (token) {
      (config.headers as Record<string, string>)['Authorization'] =
        `Bearer ${token}`;
    } else {
      throw new Error('No auth token found for protected route');
    }
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, config);

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'API request failed');
  }

  return response.json();
}

export const api = {
  login: (payload: LoginPayload): Promise<any> => {
    // Mock API call
    console.log('Mock login with:', payload.email);
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          token: 'mock_jwt_token_12345',
          user: {
            id: 'u-1',
            username: 'Test User',
            email: payload.email,
            avatar_url: '',
          },
        });
      }, 1000);
    });
    // return apiFetch<LoginResponse>('/auth/login', { method: 'POST', body: payload });
  },

  validateToken: (token: string): Promise<any> => {
    // Mock validation
    console.log('Mock validating token:', token);
    return Promise.resolve({ authenticate: true });
    // return apiFetch<TokenValidation>('/auth/validate', {
    //   method: 'POST',
    //   body: { token },
    // });
  },

  getTwilioToken: (): Promise<{ token: string }> => {
    // Mock Twilio token
    console.log('Mock getting Twilio token');
    return Promise.resolve({ token: 'mock_twilio_token_67890' });
    // return apiFetch<{ token: string }>('/call/token', { needsAuth: true });
  },
};