// This file is a direct copy from your original project
export interface User {
    id: string;
    username: string;
    email: string;
    phone_number: string;
  }
  
  export interface LoginPayload {
    email: string;
    password: string;
    signedIn: boolean;
    language: string;
  }
  
  export interface CallRecord {
    id: string;
    name: string;
    number: string;
    type: 'incoming' | 'outgoing';
    status: 'completed' | 'missed';
    duration: string;
    timestamp: string;
  }