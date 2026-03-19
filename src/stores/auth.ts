import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { supabase } from '@/lib/supabase';
import type { User, Session } from '@supabase/supabase-js';

export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>(null);
  const session = ref<Session | null>(null);
  const loading = ref(true);

  let initPromise: Promise<void> | null = null;
  
  // Initialize auth state and listen for changes
  const initAuthListener = () => {
    if (initPromise) return initPromise;

    initPromise = new Promise((resolve) => {
      // Get initial session
      supabase.auth.getSession().then(({ data }) => {
        session.value = data.session;
        user.value = data.session?.user || null;
        loading.value = false;
        resolve();
      });

      // Listen for auth events (login, logout, token refresh)
      supabase.auth.onAuthStateChange((_event, currentSession) => {
        session.value = currentSession;
        user.value = currentSession?.user || null;
        loading.value = false;
      });
    });

    return initPromise;
  };

  const isAuthenticated = computed(() => !!user.value);
  const userEmail = computed(() => user.value?.email);
  const displayName = computed(() => {
    return user.value?.user_metadata?.display_name || user.value?.email?.split('@')[0] || 'User';
  });

  async function logout() {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      user.value = null;
      session.value = null;
    } catch (error) {
      console.error('Error logging out:', error);
      throw error;
    }
  }

  async function sendPasswordResetEmail(email: string) {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: window.location.origin + '/update-password',
      });
      if (error) {
        // Better error messages
        if (error.message.includes('Email rate limit exceeded')) {
          throw new Error('Too many reset requests. Please try again in 1 hour.');
        } else if (error.message.includes('Email sending failed') || error.message.includes('recovery email')) {
          throw new Error('Email service is temporarily unavailable. Please try again later or contact support.');
        }
        throw error;
      }
    } catch (error: any) {
      console.error('Error sending reset email:', error);
      throw error;
    }
  }

  async function updatePassword(newPassword: string) {
    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) throw error;
    } catch (error) {
      console.error('Error updating password:', error);
      throw error;
    }
  }

  return {
    user,
    session,
    loading,
    isAuthenticated,
    userEmail,
    displayName,
    initAuthListener,
    logout,
    sendPasswordResetEmail,
    updatePassword
  };
});
