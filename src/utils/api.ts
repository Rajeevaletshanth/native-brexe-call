// This file is a direct copy from your original project
// (Assuming it has no native dependencies)
import { storage } from './storage';
import { LoginPayload } from '../types/auth';

const API_BASE_URL = 'http://51.21.108.179:5001'; 

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
    // Use live API endpoint per instructions
    console.log('Attempting login with:', payload.email);
    return apiFetch<any>('/admin/login', {
      method: 'POST',
      body: payload,
    });
  },

  validateToken: (token: string): Promise<any> => {
    // Use live API endpoint per instructions
    console.log('Validating token...');
    return apiFetch<any>('/validate', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
      // Response is expected to have an 'authenticate' boolean property
      // as checked in AuthContext.tsx
    });
  },

  getTwilioToken: (): Promise<{ token: string }> => {
    // Use live API endpoint per instructions
    console.log('Getting Twilio token...');
    // apiFetch returns the full JSON response, which includes a 'token' key
    return apiFetch<{ token: string }>('/twilio/token', {
      method: 'GET',
      needsAuth: true 
    });
  },
};