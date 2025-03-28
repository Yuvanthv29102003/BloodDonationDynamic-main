import React, { useEffect } from 'react';
import { View, Image, Text, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { supabase } from '../../lib/supabase';

export default function SplashScreen() {
  useEffect(() => {
    const timer = setTimeout(() => {
      const checkAuth = async () => {
        try {
          const { data: { session } } = await supabase.auth.getSession();
          if (session) {
            router.replace('/tabs/home');
          } else {
            router.replace('/auth/phone');
          }
        } catch (error) {
          console.error('Auth check failed:', error);
          router.replace('/auth/phone');
        }
      };
      
      checkAuth();
    }, 3000); // Changed to 3 seconds for better UX

    return () => clearTimeout(timer);
  }, []);

  return (
    <View style={styles.container}>
      <Image
        source={require('../../assets/images/blood-bag.png')}
        style={styles.logo}
        resizeMode="contain"
      />
      <Text style={styles.title}>Zomraty E-Blood Bank</Text>
      <Text style={styles.subtitle}>Give blood Save lifes</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  logo: {
    width: 150,
    height: 150,
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#E32636',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
  },
});