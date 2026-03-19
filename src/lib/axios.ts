import axios from 'axios';
import { supabase } from './supabase';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const api = axios.create({
  baseURL: `${supabaseUrl}/rest/v1`,
  headers: {
    'apikey': supabaseKey,
    'Content-Type': 'application/json',
    'Prefer': 'return=representation' // Ensures POST/PATCH returns the modified rows
  }
});

// Add a request interceptor to inject the JWT token dynamically
api.interceptors.request.use(async (config) => {
  const { data: { session } } = await supabase.auth.getSession();
  
  if (session?.access_token) {
    config.headers['Authorization'] = `Bearer ${session.access_token}`;
  } else {
    // Fallback to anon key if no user is logged in
    config.headers['Authorization'] = `Bearer ${supabaseKey}`;
  }
  
  return config;
}, (error) => {
  return Promise.reject(error);
});
