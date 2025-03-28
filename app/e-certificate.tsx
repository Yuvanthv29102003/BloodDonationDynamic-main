import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet, TextInput, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { supabase } from '../lib/supabase';
import { User } from '@supabase/supabase-js';

export default function ECertificateScreen() {
  const [isProfileChecked, setIsProfileChecked] = useState(false);
  const [isCheckboxChecked, setIsCheckboxChecked] = useState(false);
  const [otp, setOtp] = useState('');
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    getUser();
  }, []);

  const getUser = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUser(user);
      }
    } catch (error) {
      console.error('Error getting user:', error);
    }
  };

  const checkProfile = async () => {
    if (!user) {
      Alert.alert('Error', 'Please login to continue.');
      return;
    }

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id);

      if (error) {
        console.error('Error checking profile:', error);
        Alert.alert('Error', 'Failed to check profile. Please try again.');
        return;
      }

      if (data && data.length > 0) {
        setIsProfileChecked(true);
        Alert.alert('Success', 'Profile verified successfully!');
      } else {
        Alert.alert('Profile Not Found', 'Please complete your profile before requesting an OTP.');
      }
    } catch (error) {
      console.error('Error checking profile:', error);
      Alert.alert('Error', 'Failed to check profile. Please try again.');
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>E - CERTIFICATE</Text>
      </View>

      <View style={styles.certificateContainer}>
        <View style={styles.certificate}>
          <Image
            source={require('../assets/images/certificate.png')}
            style={styles.certificateImage}
            resizeMode="contain"
          />
          <View style={styles.lockOverlay}>
            <Ionicons name="lock-closed" size={80} color="#E32636" />
          </View>
        </View>
      </View>

      <View style={styles.messageContainer}>
        <Text style={styles.messageText}>
          REQUEST "OTP" TO SEEKER AND{"\n"}UNLOCK THE CERTIFICATE!!
        </Text>
      

      {!isProfileChecked && (
        <View style={styles.checkboxContainer}>
          <TouchableOpacity 
            style={styles.checkbox} 
            onPress={() => setIsCheckboxChecked(!isCheckboxChecked)}
          >
            {isCheckboxChecked && (
              <Ionicons name="checkmark" size={20} color="#E32636" />
            )}
          </TouchableOpacity>
          <Text style={styles.checkboxText}>
            I confirm that I want to verify my profile for safety purposes
          </Text>
        </View>
      )}

      {!isProfileChecked ? (
        <TouchableOpacity 
          style={[
            styles.checkProfileButton, 
            styles.buttonShadow,
            !isCheckboxChecked && styles.disabledButton
          ]} 
          onPress={checkProfile}
          disabled={!isCheckboxChecked}
        >
          <Text style={[
            styles.checkProfileButtonText,
            !isCheckboxChecked && styles.disabledButtonText
          ]}>Check Profile</Text>
        </TouchableOpacity>
      ) : (
        <TouchableOpacity 
          style={[styles.checkProfileButton, styles.buttonShadow]} 
          onPress={() => router.push('/certificate-verification')}
        >
          <Text style={styles.checkProfileButtonText}>Request OTP to Unlock Certificate</Text>
        </TouchableOpacity>
      )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 40,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  backButton: {
    padding: 8,
  },
  backButtonText: {
    fontSize: 24,
    color: '#000',
  },
  headerTitle: {
    flex: 1,
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    marginRight: 40,
  },
  certificateContainer: {
    flex: 1,
    padding: 15,
    justifyContent: 'center',
    marginTop: -80,
  },
  certificate: {
    width: '100%',
    aspectRatio: 0.7,
    backgroundColor: '#fff',
    borderRadius: 15,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  certificateImage: {
    width: '100%',
    height: '100%',
  },
  lockOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  messageContainer: {
    alignItems: 'center',
    marginTop: -20,
    marginBottom: 20,
  },
  messageText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#E32636',
    textAlign: 'center',
    lineHeight: 24,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 60,
    marginTop: 10,
    marginBottom: 15,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderWidth: 2,
    borderColor: '#E32636',
    borderRadius: 4,
    marginRight: 10,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  checkboxText: {
    flex: 1,
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  buttonShadow: {
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  disabledButton: {
    backgroundColor: '#cccccc',
    opacity: 0.8,
  },
  disabledButtonText: {
    color: '#666666',
  },
  checkProfileButton: {
    backgroundColor: '#E32636',
    marginHorizontal: 40,
    marginTop: 20,
    marginBottom: 100,
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  checkProfileButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});