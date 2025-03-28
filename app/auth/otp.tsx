import React, { useRef, useState } from 'react';
import { View, Image, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { supabase } from '../../lib/supabase';

export default function OTPScreen() {
  const params = useLocalSearchParams();
  const phone = params.phone as string;
  const [otp, setOtp] = useState<string[]>(['', '', '', '']);
  const [loading, setLoading] = useState(false);
  const inputRefs = useRef<(TextInput | null)[]>([]);

  const handleOtpChange = (value: string, index: number) => {
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (value && index < 3) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleVerify = async () => {
    if (otp.every(digit => digit)) {
      setLoading(true);
      const name = params.name as string;
      try {
        // First verify the OTP
        const { data: { session }, error } = await supabase.auth.verifyOtp({
          phone: phone as string,
          token: otp.join(''),
          type: 'sms',
        });
        
        if (error) {
          Alert.alert('Error', error.message);
          return;
        }
        
        if (!session) {
          Alert.alert('Error', 'Authentication session not found');
          return;
        }

        // Then update the user metadata
        const { error: updateError } = await supabase.auth.updateUser({
          data: { 
            display_name: name,
          }
        });
        
        if (updateError) {
          console.error('Error updating user metadata:', updateError);
          Alert.alert('Error', 'Failed to update user metadata');
          return;
        }

        // Then update the profiles table
        const { error: profileError } = await supabase
          .from('profiles')
          .upsert({
            id: session.user.id,
            display_name: name,
            updated_at: new Date().toISOString()
          });
      
        if (profileError) {
          console.error('Error updating profile:', profileError);
          Alert.alert('Error', 'Failed to update profile');
          return;
        }

        // Finally refresh the session and navigate
        await supabase.auth.refreshSession();
        const { data: { user } } = await supabase.auth.getUser();
        
        if (user?.user_metadata?.display_name) {
          router.replace('/tabs/home');
        } else {
          Alert.alert('Error', 'Failed to update user profile');
        }
      } catch (error) {
        console.error('Error during OTP verification:', error);
        Alert.alert('Error', 'Failed to verify OTP');
      } finally {
        setLoading(false);
      }
    }
  };

  const handleResend = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithOtp({
        phone: phone,
      });

      if (error) {
        Alert.alert('Error', error.message);
      } else {
        Alert.alert('Success', 'OTP has been resent to your phone number');
      }
    } catch (error) {
      console.error('Error resending OTP:', error);
      Alert.alert('Error', 'Failed to resend OTP');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Image
        source={require('../../assets/images/authentication.png')}
        style={styles.image}
        resizeMode="contain"
      />
      <Text style={styles.title}>Enter the OTP to verify</Text>
      
      <View style={styles.otpContainer}>
        {otp.map((digit, index) => (
          <TextInput
            key={index}
            ref={(ref) => {
              inputRefs.current[index] = ref;
            }}
            style={styles.otpInput}
            value={digit}
            onChangeText={(value) => handleOtpChange(value, index)}
            keyboardType="number-pad"
            maxLength={1}
          />
        ))}
      </View>

      <TouchableOpacity 
        style={[styles.button, loading && styles.buttonDisabled]} 
        onPress={handleVerify}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Verify</Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity onPress={handleResend}>
        <Text style={styles.resendText}>Did not receive OTP? <Text style={styles.resendLink}>Resend</Text></Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  buttonDisabled: {
    backgroundColor: '#ccc',
  },
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    padding: 20,
  },
  image: {
    width: 200,
    height: 200,
    marginTop: 40,
    marginBottom: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 30,
    color: '#333',
  },
  otpContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '80%',
    marginBottom: 30,
  },
  otpInput: {
    width: 50,
    height: 50,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    textAlign: 'center',
    fontSize: 20,
    backgroundColor: '#fff',
  },
  button: {
    width: '100%',
    height: 50,
    backgroundColor: '#E32636',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 30,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  resendText: {
    marginTop: 20,
    color: '#333',
    fontSize: 14,
  },
  resendLink: {
    color: '#E32636',
    textDecorationLine: 'underline',
  },
});