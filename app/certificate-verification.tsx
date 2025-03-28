import React, { useRef, useState, useCallback } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Image, Platform, Dimensions, Alert, ActivityIndicator, Modal } from 'react-native';
import * as MediaLibrary from 'expo-media-library';
import * as Sharing from 'expo-sharing';
import ViewShot from 'react-native-view-shot';
import { supabase } from '../lib/supabase';
import { router } from 'expo-router';
import { useAuth } from '../context/AuthContext';

const { width, height } = Dimensions.get('window');

export default function CertificateVerificationScreen() {
  const [showOptions, setShowOptions] = useState(false);
  const certificateRef = useRef<View>(null);
  const viewShotRef = useRef<ViewShot>(null);
  const [showShareMenu, setShowShareMenu] = useState(false);
  const { displayName } = useAuth();
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [showCertificate, setShowCertificate] = useState(false);
  const [loading, setLoading] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const otpInputRefs = useRef<Array<TextInput | null>>([]);

  const sendOtp = async () => {
    if (!phoneNumber) {
      Alert.alert('Error', 'Please enter a phone number');
      return;
    }
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithOtp({
        phone: `+91${phoneNumber}`
      });

      if (error) {
        Alert.alert('Error', error.message);
      } else {
        Alert.alert('Success', 'OTP has been sent to your phone number');
        setOtpSent(true);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  const verifyOtp = async () => {
    if (!otp) {
      Alert.alert('Error', 'Please enter OTP');
      return;
    }
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.verifyOtp({
        phone: `+91${phoneNumber}`,
        token: otp,
        type: 'sms'
      });

      if (error) {
        Alert.alert('Error', error.message);
      } else {
        setShowCertificate(true);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to verify OTP');
    } finally {
      setLoading(false);
    }
  };

  const currentDate = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>CERTIFICATE VERIFICATION</Text>
      </View>

      <View style={styles.content}>
        {!showCertificate ? (
          <View style={styles.verificationSection}>
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Phone Number</Text>
              <View style={styles.phoneInputContainer}>
                <Text style={styles.countryCode}>+91</Text>
                <TextInput
                  style={[styles.input, styles.phoneInput]}
                  value={phoneNumber}
                  onChangeText={setPhoneNumber}
                  placeholder="Enter your phone number"
                  keyboardType="phone-pad"
                  maxLength={10}
                  editable={!otpSent}
                />
                <TouchableOpacity 
                  style={[styles.sendButton, otpSent && styles.disabledButton]} 
                  onPress={sendOtp}
                  disabled={loading || otpSent}
                >
                  {loading ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <Text style={styles.sendButtonText}>Send OTP</Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.inputContainer}>
              <View style={styles.otpRow}>
                <Text style={styles.label}>OTP</Text>
                <View style={styles.otpInputContainer}>
                  {[0, 1, 2, 3].map((index) => (
                    <TextInput
                      key={index}
                      ref={(ref) => (otpInputRefs.current[index] = ref)}
                      style={styles.otpDigitInput}
                      value={otp[index] || ''}
                      onChangeText={(value) => {
                        if (value.length <= 1) {
                          const newOtp = otp.split('');
                          newOtp[index] = value;
                          const newOtpString = newOtp.join('');
                          setOtp(newOtpString);
                          
                          if (value && index < 3) {
                            otpInputRefs.current[index + 1]?.focus();
                          }
                        }
                      }}
                      keyboardType="number-pad"
                      maxLength={1}
                      returnKeyType="done"
                      autoComplete="sms-otp"
                      textContentType="oneTimeCode"
                      autoCapitalize="none"
                      autoCorrect={false}
                      editable={otpSent}
                    />
                  ))}
                </View>
              </View>
            </View>

            <TouchableOpacity 
              style={[styles.verifyButton, (!otpSent || loading) && styles.disabledButton]} 
              onPress={verifyOtp}
              disabled={!otpSent || loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.verifyButtonText}>Verify OTP</Text>
              )}
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.certificateSection}>
            <ViewShot ref={viewShotRef} options={{ format: 'png', quality: 0.9 }}>

              <View style={styles.certificate}>
                  <View style={styles.findBloodContainer}>
                    <Image
                      source={require('../assets/images/blood.png')}
                      style={styles.findBloodImage}
                      resizeMode="contain"
                    />
                  </View>
                  <View style={styles.headerContainer}>
                    <Image
                      source={require('../assets/images/blood-bag.png')}
                      style={styles.logo}
                      resizeMode="contain"
                    />
                    <Text style={styles.certificateTitle}>ZOMRATY E-BLOOD BANK</Text>
                  </View>
                  <Text style={styles.certificateSubtitle1}>CERTIFICATE</Text>
                  <Text style={styles.certificateSubtitle2}>OF BLOOD DONATION</Text>
                  
                  <Text style={styles.presentedText}>This Certificate is Presented to</Text>
                  <Text style={styles.userName}>{displayName?.toUpperCase() || 'YUVANTH'}</Text>
                  
                  <Text style={styles.appreciationText}>
                    for following and participating in blood donation.{"\n"}
                    Thankyou We really appreciate your actions.
                  </Text>

                  <View style={styles.certificateFooter}>
                    <Text style={styles.date}>{currentDate}</Text>
                    <Image
                      source={require('../assets/images/badge.png')}
                      style={styles.badge}
                      resizeMode="contain"
                    />
                    <View style={styles.signatureContainer}>
                      <Text style={styles.signatureName}>Thowfiq Rizwan</Text>
                      <Text style={styles.signatureTitle}>Head of The Blood Donation Unit</Text>
                    </View>
                  </View>
                </View>


              </ViewShot>

              <TouchableOpacity 
                style={styles.shareButton}
                onPress={async () => {
                  try {
                    if (!viewShotRef.current) {
                      throw new Error('ViewShot reference is not available');
                    }
                    const uri = await viewShotRef.current?.capture?.() || '';
                    await Sharing.shareAsync(uri);
                  } catch (error) {
                    Alert.alert('Error', 'Failed to share certificate');
                  }
                }}
              >
                <Text style={styles.shareButtonText}>Share Certificate</Text>
              </TouchableOpacity>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingTop: 40,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  backButton: {
    padding: 8,
  },
  backButtonText: {
    fontSize: 24,
    color: '#E32636',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 16,
    color: '#333',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  verificationSection: {
    flex: 1,
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    color: '#333',
    marginRight: 20,
  },
  phoneInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  countryCode: {
    fontSize: 16,
    marginRight: 8,
    color: '#333',
  },
  input: {
    flex: 1,
    height: 48,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 12,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  phoneInput: {
    flex: 1,
  },
  sendButton: {
    backgroundColor: '#E32636',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    marginLeft: 8,
  },
  sendButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  verifyButton: {
    backgroundColor: '#E32636',
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
  },
  verifyButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  disabledButton: {
    opacity: 0.6,
  },
  certificateSection: {
    flex: 1,
    alignItems: 'center',
  },
  certificate: {
    width: width * 0.9,
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    alignItems: 'center',
    position: 'relative',
    overflow: 'hidden',
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  logo: {
    width: 50,
    height: 50,
    marginRight: 10,
  },
  certificateTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#E32636',
    textAlign: 'center',
  },
  certificateSubtitle1: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 20,
    textAlign: 'center',
  },
  certificateSubtitle2: {
    fontSize: 24,
    color: '#666',
    marginBottom: 30,
    textAlign: 'center',
  },
  presentedText: {
    fontSize: 18,
    color: '#666',
    marginBottom: 10,
    textAlign: 'center',
  },
  userName: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#E32636',
    marginBottom: 20,
    textAlign: 'center',
  },
  appreciationText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 30,
  },
  certificateFooter: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 30,
  },
  date: {
    fontSize: 16,
    color: '#000',
    borderBottomWidth: 1,
    borderBottomColor: '#000',
  },
  signatureContainer: {
    alignItems: 'center',
    marginLeft: -20,
  },
  signatureName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  signatureTitle: {
    fontSize: 14,
    color: '#666',
  },
  shareButton: {
    backgroundColor: '#E32636',
    marginHorizontal: 40,
    marginTop: 20,
    marginBottom: 40,
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  shareButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  findBloodContainer: {
    position: 'absolute',
    top: '45%',
    left: '68%',
    transform: [{ translateX: -150 }, { translateY: -50 }],
    width: 200,
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 0,
  },
  findBloodImage: {
    width: '200%',
    height: '200%',
    opacity: 0.3,
  },
  otpRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
  },
  otpInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 15,
    marginLeft: 30,
  },
  otpDigitInput: {
    width: 50,
    height: 50,
    borderWidth: 1,
    borderColor: '#E32636',
    borderRadius: 10,
    fontSize: 22,
    backgroundColor: '#fff',
    textAlign: 'center',
    color: '#333',
  },
  badge: {
    width: 100,
    height: 100,
    // paddingBottom: 40,
    marginBottom: 60,
    // marginRight: 20,
    // marginLeft: 20,
    // marginHorizontal: -20,
  },
});