import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { Session, Subscription } from '@supabase/supabase-js';
import { router } from 'expo-router';

type AuthContextType = {
  session: Session | null;
  loading: boolean;
  signOut: () => Promise<void>;
  displayName: string | null;
  user: Session['user'] | null;
};

const AuthContext = createContext<AuthContextType>({
  session: null,
  loading: true,
  signOut: async () => { },
  displayName: null,
  user: null
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [displayName, setDisplayName] = useState<string | null>(null);
  const [user, setUser] = useState<Session['user'] | null>(null);

  const signOut = async () => {
    try {
      // First clear all state
      setSession(null);
      setDisplayName(null);
      setUser(null);
      
      // Then sign out from Supabase
      await supabase.auth.signOut();

      // Finally navigate to auth screen
      router.replace('/auth/phone');
    } catch (error) {
      console.error('Error signing out:', error);
      throw error;
    }
  };

  useEffect(() => {
    let subscription: Subscription;

    const fetchUserName = async (user: any) => {
      try {
        // First try to get name from user metadata
        let name = null;
        if (user?.user_metadata?.display_name) {
          name = user.user_metadata.display_name;
        }

        // If no name in metadata, try to get from profiles table
        if (!name && user?.id) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('display_name')
            .eq('id', user.id)
            .single();
          
          if (profile?.display_name) {
            name = profile.display_name;
          }
        }

        setDisplayName(name);
      } catch (error) {
        console.error('Error fetching user name:', error);
      }
    };

    // Add delay to allow splash screen to show
    const timer = setTimeout(async () => {
      try {
        // Check for existing session
        const { data: { session: currentSession } } = await supabase.auth.getSession();
        if (currentSession) {
          setSession(currentSession);
          setUser(currentSession.user);
          // Get user metadata including display name
          const { data: { user } } = await supabase.auth.getUser();
          await fetchUserName(user);
        }
        setLoading(false);

        // Listen for auth changes
        const { data: { subscription: authSubscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
          setSession(session);
          setUser(session?.user || null);
          
          if (session) {
            // Fetch the latest user metadata to ensure we have the most up-to-date name
            const { data: { user } } = await supabase.auth.getUser();
            await fetchUserName(user);
            router.replace('/tabs/home');
          } else {
            setDisplayName(null);
            router.replace('/auth/phone');
          }
        });

        subscription = authSubscription;
      } catch (error) {
        console.error('Error in auth setup:', error);
        setLoading(false);
      }
    }, 1500);

    return () => {
      clearTimeout(timer);
      subscription?.unsubscribe();
    };
  }, []);

  return (
    <AuthContext.Provider value={{ session, loading, signOut, displayName, user }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}