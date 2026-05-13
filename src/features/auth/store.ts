import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { supabase } from '@/shared/lib/supabase';
import type { User, Session } from '@supabase/supabase-js';

export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>(null);
  const session = ref<Session | null>(null);
  const loading = ref(true);
  const permissionsReady = ref(false);
  const role = ref<string>('staff');
  const permissions = ref<string[]>([]);
  const profile = ref<{ full_name?: string; phone?: string } | null>(null);

  let initPromise: Promise<void> | null = null;
  let onAuthChangeUnsubscribe: (() => void) | null = null;
  
  async function fetchUserPermissions(userId: string) {
    try {
      // Use maybeSingle() instead of single() to avoid 406 error when no profile row exists
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('role, full_name, phone')
        .eq('id', userId)
        .maybeSingle();

      if (profileError) {
        console.error('Error fetching profile:', profileError);
      }
        
      if (profileData && profileData.role) {
        role.value = profileData.role;
        profile.value = { full_name: profileData.full_name, phone: profileData.phone };
        // Fetch permissions for this role
        const { data: permData, error: permError } = await supabase
          .from('role_permissions')
          .select('permission_code')
          .eq('role_code', profileData.role);

        if (permError) {
          console.error('Error fetching role_permissions:', permError);
        }
          
        if (permData) {
          permissions.value = permData.map(p => p.permission_code);
        }
      } else {
        // No profile found — default to 'staff' with no permissions
        // This prevents a crash when the profiles table has no row for this user
        console.warn(`No profile found for user ${userId}. Defaulting to staff role with no permissions.`);
        role.value = 'staff';
        permissions.value = [];
        profile.value = null;
      }
    } catch (e) {
      console.error('Failed to fetch permissions', e);
    }
  }
  
  // Initialize auth state and listen for changes
  const initAuthListener = () => {
    if (initPromise) return initPromise;

    initPromise = new Promise((resolve) => {
      // Get initial session first, then set up listener
      supabase.auth.getSession().then(async ({ data }) => {
        session.value = data.session;
        user.value = data.session?.user || null;
        if (user.value) {
          await fetchUserPermissions(user.value.id);
        }
        permissionsReady.value = true;
        loading.value = false;
        resolve();

        // Listen for subsequent auth events (login, logout, token refresh)
        // Only set up AFTER initial session is resolved to avoid race condition
        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, currentSession) => {
          session.value = currentSession;
          user.value = currentSession?.user || null;
          permissionsReady.value = false;
          if (user.value) {
            await fetchUserPermissions(user.value.id);
          } else {
            role.value = 'staff';
            permissions.value = [];
            profile.value = null;
          }
          permissionsReady.value = true;
          loading.value = false;
        });
        onAuthChangeUnsubscribe = () => subscription.unsubscribe();
      });
    });

    return initPromise;
  };

  const isAuthenticated = computed(() => !!user.value);
  const userEmail = computed(() => user.value?.email);
  const displayName = computed(() => {
    return profile.value?.full_name || user.value?.user_metadata?.display_name || user.value?.email?.split('@')[0] || 'User';
  });

  const hasPermission = (permissionCode: string): boolean => {
    if (role.value === 'admin') return true; // Admin has all permissions
    return permissions.value.includes(permissionCode);
  };

  async function logout() {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.warn('Supabase signout returned an error (ignoring):', error);
      }
    } catch (error) {
      console.error('Error logging out from Supabase:', error);
    } finally {
      // Always clear local state to prevent getting stuck
      user.value = null;
      session.value = null;
      role.value = 'staff';
      permissions.value = [];
      profile.value = null;
      permissionsReady.value = false;
      // Reset initPromise so next login will re-fetch permissions
      initPromise = null;
      if (onAuthChangeUnsubscribe) {
        onAuthChangeUnsubscribe();
        onAuthChangeUnsubscribe = null;
      }
    }
  }

  async function sendPasswordResetEmail(email: string) {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: window.location.origin + '/update-password',
      });
      if (error) {
        throw new Error(error.message);
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

  async function updateProfile(fullName: string, phone: string) {
    if (!user.value) return;
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: fullName,
          phone: phone
        })
        .eq('id', user.value.id);
        
      if (error) throw error;
      
      // Update local state immediately
      if (!profile.value) profile.value = {};
      profile.value.full_name = fullName;
      profile.value.phone = phone;
    } catch (err) {
      console.error('Error updating profile:', err);
      throw err;
    }
  }

  return {
    user,
    session,
    loading,
    permissionsReady,
    isAuthenticated,
    userEmail,
    displayName,
    role,
    permissions,
    hasPermission,
    initAuthListener,
    logout,
    sendPasswordResetEmail,
    updatePassword,
    updateProfile,
    profile
  };
});
