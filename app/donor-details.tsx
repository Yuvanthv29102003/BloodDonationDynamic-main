import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ScrollView, ActivityIndicator } from 'react-native';
import Confetti from './components/Confetti';
import { Platform } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { router, useLocalSearchParams } from 'expo-router';
import { supabase } from '../lib/supabase';
import { scheduleBookingNotification } from '@/lib/services/notificationService';


interface DonorStats {
  donation_count: number;
  rating: number;
  lives_saved: number;
}

export default function DonorDetails() {
  const params = useLocalSearchParams();
  const donor = {
    id: params.id as string,
    name: params.name as string,
    location: params.location as string,
    blood_group: params.blood_group as string,
    type: params.type as 'donor' | 'blood_bank',
    distance: parseFloat(params.distance as string),
    operating_hours: params.operating_hours as string,
    available_units: params.available_units ? parseInt(params.available_units as string) : undefined,
  };

  const [stats, setStats] = useState<DonorStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);

  const handleDateChange = (event: any, selectedDate?: Date) => {
    if (Platform.OS === 'android') {
      setShowDatePicker(false);
    }
    if (selectedDate) {
      setDate(selectedDate);
    }
  };

  const showDatePickerModal = () => {
    setShowDatePicker(true);
  };

  const hideDatePicker = () => {
    setShowDatePicker(false);
  };

  useEffect(() => {
    const fetchDonorStats = async () => {
      try {
        if (!donor.id) {
          throw new Error('Invalid donor ID');
        }

        if (donor.type === 'donor') {
          const { data, error: statsError } = await supabase
            .from('donor_statistics')
            .select('donation_count, rating, lives_saved')
            .eq('donor_id', donor.id)
            .single();

          if (statsError) throw statsError;

          setStats(data || {
            donation_count: 0,
            rating: 0,
            lives_saved: 0
          });
        } else {
          // For blood banks, we'll use different metrics
          const { data, error: statsError } = await supabase
            .from('blood_bank_statistics')
            .select('donation_count, rating, lives_saved')
            .eq('blood_bank_id', donor.id)
            .single();

          if (statsError) throw statsError;

          setStats(data || {
            donation_count: 0,
            rating: 0,
            lives_saved: 0
          });
        }
      } catch (err) {
        console.error('Error fetching stats:', err);
        setError('Failed to load statistics');
      } finally {
        setLoading(false);
      }
    };

    fetchDonorStats();
  }, [donor.id, donor.type]);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.imageContainer}>
        <Image
          source={donor.type === 'blood_bank' 
            ? require('../assets/images/blood-bank.png')
            : params.gender === 'Female'
            ? require('../assets/images/female.jpg')
            : require('../assets/images/male.png')}
          style={styles.heroImage}
          resizeMode="cover"
        />
      </View>

      <View style={styles.bottomSheet}>
        <View style={styles.bottomSheetHandle} />
        
        <View style={styles.profileSection}>
          <Text style={styles.name}>{donor.name}</Text>
          <Text style={styles.location}>{donor.location}</Text>
        </View>

        <View style={styles.statsContainer}>
          {loading ? (
            <ActivityIndicator size="large" color="#E32636" />
          ) : error ? (
            <Text style={styles.errorText}>{error}</Text>
          ) : stats ? (
            <>
              <View style={styles.statCard}>
                <Text style={styles.statNumber}>{stats.donation_count}+</Text>
                <Text style={styles.statLabel}>Donated</Text>
              </View>
              <View style={styles.statCard}>
                <Text style={styles.statNumber}>{stats.rating.toFixed(1)}+</Text>
                <Text style={styles.statLabel}>Rating</Text>
              </View>
              <View style={styles.statCard}>
                <Text style={styles.statNumber}>{stats.lives_saved}+</Text>
                <Text style={styles.statLabel}>saved lives</Text>
              </View>
            </>
          ) : null}
        </View>

        <View style={styles.dateSection}>
          <View style={styles.dateSectionRow}>
            <Text style={styles.sectionTitle}>Choose date & time</Text>
            <TouchableOpacity 
              style={styles.dateButton} 
              onPress={showDatePickerModal}
            >
              <Text style={styles.dateButtonText}>
                {date.toLocaleDateString('en-US', { 
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </Text>
            </TouchableOpacity>
          </View>

          {showDatePicker && (
            <>
              <TouchableOpacity 
                style={{
                  position: 'absolute',
                  top: -1000,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  height: 3000,
                  backgroundColor: 'rgba(0, 0, 0, 0.5)',
                  zIndex: 1000
                }}
                onPress={hideDatePicker}
              />
              <View style={[styles.datePickerContainer, { zIndex: 1001 }]}>
                <DateTimePicker
                  testID="dateTimePicker"
                  value={date}
                  mode="datetime"
                  display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                  onChange={handleDateChange}
                  minimumDate={new Date()}
                  style={Platform.OS === 'ios' ? styles.iosDatePicker : undefined}
                />
                {Platform.OS === 'ios' && (
                  <TouchableOpacity 
                    style={styles.donePicker} 
                    onPress={hideDatePicker}
                  >
                    <Text style={styles.donePickerText}>Done</Text>
                  </TouchableOpacity>
                )}
              </View>
            </>
          )}
        </View>

        <View style={styles.infoSection}>
          <Text style={styles.infoText}>
            Donar details will be shared after the donar accepts the request !!
          </Text>
        </View>

        <TouchableOpacity 
          style={styles.requestButton} 
          onPress={async () => {
            try {
              // Create booking entry in database
              const { error: bookingError } = await supabase
                .from('booked_donors')
                .insert({
                  donor_id: donor.id,
                  booking_date: date.toISOString(),
                  status: 'pending'
                });

              if (bookingError) throw bookingError;

              // Schedule notification
              await scheduleBookingNotification();
              setShowSuccessPopup(true);
            } catch (error) {
              console.error('Error booking donor:', error);
              alert('Failed to book donor. Please try again.');
            }
          }}
        >
          <Text style={styles.requestButtonText}>Request Book Donar</Text>
        </TouchableOpacity>

      </View>
      {showSuccessPopup && (
        <View style={styles.overlay}>
          <View style={styles.popup}>
            <Confetti isVisible={showSuccessPopup} />
            {/* <Confetti /> */}
            <Text style={styles.popupTitle}>REQUEST SENT SUCCESSFULLY</Text>
            <TouchableOpacity 
              style={styles.popupButton}
              onPress={() => {
                setShowSuccessPopup(false);
                router.replace('/tabs/home');
              }}
            >
              <Text style={styles.popupButtonText}>Thank you</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
    paddingTop: 55,
    paddingHorizontal: 16,
    backgroundColor: 'transparent',
  },
  backButton: {
    padding: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderRadius: 20,
  },
  backButtonText: {
    fontSize: 24,
    color: '#000',
  },
  imageContainer: {
    height: '50%',
    width: '100%',
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden'
  },
  heroImage: {
    width: 200,
    height: 200,
    borderRadius: 100,
    resizeMode: 'cover',
    borderWidth: 2,
    borderColor: '#949494'
  },
  bottomSheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '58%',
    backgroundColor: '#fff',
    borderTopLeftRadius: 54,
    borderTopRightRadius: 54,
    paddingTop: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
    borderWidth: 1,
    // borderColor: '#000',
  },
  bottomSheetHandle: {
    width: 83,
    height: 9,
    flexShrink: 0,
    backgroundColor: '#757575',
    borderRadius: 4,
    alignSelf: 'center',
    marginTop: 12,
    marginBottom: 8,
  },
  profileSection: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  name: {
    width: '100%',
    fontSize: 28,
    fontWeight: '600',
    color: '#000',
    marginBottom: 8,
    fontFamily: 'Inter',
    fontStyle: 'normal',
    lineHeight: 32,
    textAlign: 'center',
  },
  location: {
    width: '100%',
    color: '#666',
    fontFamily: 'Inter',
    fontSize: 16,
    fontStyle: 'normal',
    fontWeight: '500',
    lineHeight: 20,
    marginBottom: 14,
    textAlign: 'center',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 16,
    marginBottom: 22,
    minHeight: 100,
    alignItems: 'center',
  },
  statCard: {
    width: 90,
    height: 90,
    backgroundColor: '#EEF1FF',
    borderRadius: 10,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  statNumber: {
    color: '#000',
    fontFamily: 'Inter',
    fontSize: 25,
    fontStyle: 'normal',
    fontWeight: '500',
    textAlign: 'center',
    marginBottom: 10
  },
  statLabel: {
    color: '#000',
    fontFamily: 'Inter',
    fontSize: 12,
    fontStyle: 'normal',
    fontWeight: '600',
    textAlign: 'center',
    flexShrink: 0
  },
  infoSection: {
    paddingHorizontal: 16,
    marginBottom: 5,
    backgroundColor: '#FFF5F5',
    padding: 16,
    borderRadius: 12,
    marginHorizontal: 16,
  },
  infoText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
  },
  requestButton: {
    backgroundColor: '#E32636',
    margin: 16,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#E32636',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  requestButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  errorText: {
    color: '#E32636',
    textAlign: 'center',
    fontSize: 14,
  },
  dateSection: {
    paddingHorizontal: 16,
    marginBottom: 24,
    backgroundColor: '#FFFFFF',
  },
  dateSectionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
  },
  dateButton: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
    minWidth: 120,
  },
  dateButtonText: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  datePickerContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginTop: 8,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: {
          width: 0,
          height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  iosDatePicker: {
    backgroundColor: '#FFFFFF',
    width: '100%',
    height: 200,
  },
  donePicker: {
    alignItems: 'center',
    padding: 12,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  donePickerText: {
    color: '#E32636',
    fontSize: 16,
    fontWeight: '600',
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 3000,
    height: '100%',
    width: '100%',
    elevation: 5
  },
  popup: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    width: '80%',
    maxWidth: 300,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5
  },
  popupTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
    textAlign: 'center',
    marginBottom: 20
  },
  popupButton: {
    backgroundColor: '#E32636',
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 8
  },
  popupButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500'
  }
});