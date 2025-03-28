import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, ActivityIndicator, ScrollView } from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import { supabase } from '../../../lib/supabase';

interface DonorInfo {
  name: string;
  location: string;
}

interface BookedDonor {
  gender: string | number | (string | number)[] | null | undefined;
  id: string;
  donor_id: string;
  booking_date: string;
  status: string;
  donor: DonorInfo & { gender?: string };
}

interface DonorStats {
  donation_count: number;
  rating: number;
  lives_saved: number;
}

export default function BookedDonorProfile() {
  const [bookedDonors, setBookedDonors] = useState<BookedDonor[]>([]);
  const [stats, setStats] = useState<{[key: string]: DonorStats}>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCompleting, setIsCompleting] = useState(false);

  const handleCompleteDonation = async (donorId: string, bookingId: string) => {
    try {
      setIsCompleting(true);

      // Call the backend function to complete the donation
      const { error } = await supabase
        .rpc('complete_donation', {
          booked_donor_id: bookingId,
          donor_id: donorId
        });

      if (error) throw error;

      // Refresh the list after completion
      fetchBookedDonors();
    } catch (err) {
      console.error('Error completing donation:', err);
      setError('Failed to complete donation');
    } finally {
      setIsCompleting(false);
    }
  };

  const fetchBookedDonors = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const { data: bookingData, error: bookingError } = await supabase
        .from('booked_donors')
        .select(`
          id,
          donor_id,
          booking_date,
          status,
          donor:donors(name, location, gender)
        `)
        .in('status', ['pending', 'accepted'])
        .order('booking_date', { ascending: false });

      if (bookingError) {
        throw bookingError;
      }

      if (!bookingData || bookingData.length === 0) {
        setBookedDonors([]);
        setError('No booked donors yet\nBook a donor first to view their details.');
        return;
      }

      // Transform the data to match the BookedDonor interface
      const transformedData: BookedDonor[] = bookingData.map(booking => {
        const donorData = Array.isArray(booking.donor) ? booking.donor[0] : booking.donor;
        
        return {
          id: booking.id,
          donor_id: booking.donor_id,
          booking_date: booking.booking_date,
          status: booking.status,
          gender: donorData?.gender,
          donor: {
            name: donorData?.name || 'Anonymous Donor',
            location: donorData?.location || 'Location not available',
            gender: donorData?.gender
          }
        };
      });

      setBookedDonors(transformedData);

      // Fetch stats for all donors
      const statsPromises = transformedData.map(donor =>
        supabase
          .from('donor_statistics')
          .select('donation_count, rating, lives_saved')
          .eq('donor_id', donor.donor_id)
          .single()
      );

      const statsResults = await Promise.all(statsPromises);
      const donorStats: {[key: string]: DonorStats} = {};

      statsResults.forEach((result, index) => {
        if (result.data) {
          donorStats[transformedData[index].donor_id] = result.data;
        } else {
          donorStats[transformedData[index].donor_id] = {
            donation_count: 0,
            rating: 0,
            lives_saved: 0
          };
        }
      });

      setStats(donorStats);
    } catch (err) {
      console.error('Error fetching booked donors:', err);
      setError('Failed to load donor information');
    } finally {
      setLoading(false);
    }
  };

  // Use useFocusEffect to refresh the list when the screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      fetchBookedDonors();
    }, [])
  );

  if (loading) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <ActivityIndicator size="large" color="#E32636" />
      </View>
    );
  }

  if (error || bookedDonors.length === 0) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <Text style={styles.errorText}>{error || 'No donor information found'}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Booked Donors</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.scrollContainer}>
        {bookedDonors.map((donor) => (
          <View key={donor.id} style={styles.donorCard}>
            <View style={styles.donorInfo}>
              <Image
                source={donor.gender === 'Female' 
                  ? require('../../../assets/images/female.jpg')
                  : require('../../../assets/images/male.png')}
                style={styles.donorImage}
              />
              <View style={styles.donorDetails}>
                <Text style={styles.donorName}>{donor.donor.name}</Text>
                <Text style={styles.donorLocation}>{donor.donor.location}</Text>
                <Text style={styles.bookingDate}>
                  Booked on {new Date(donor.booking_date).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                </Text>
              </View>
              <TouchableOpacity 
                style={styles.viewButton}
                onPress={() => router.push({
                  pathname: '/tabs/booked-donor/details',
                  params: {
                    id: donor.id,
                    donor_id: donor.donor_id,
                    donor_name: donor.donor.name,
                    donor_location: donor.donor.location,
                    booking_date: donor.booking_date,
                    gender: donor.gender
                  }
                })}
              >
                <Text style={styles.viewButtonText}>View details</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  scrollContainer: {
    flex: 1,
    padding: 16,
  },
  donorCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  donorInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  donorImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 12,
  },
  donorDetails: {
    flex: 1,
  },
  donorName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    marginBottom: 4,
  },
  donorLocation: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  viewButton: {
    backgroundColor: '#E32636',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  viewButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
  },
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    color: '#E32636',
    fontSize: 16,
    textAlign: 'center',
    padding: 20,
    lineHeight: 24,
    fontWeight: '500',
    backgroundColor: '#FFF5F5',
    borderRadius: 12,
    margin: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 55,
    paddingHorizontal: 16,
    paddingBottom: 10,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  backButton: {
    padding: 8,
  },
  backButtonText: {
    fontSize: 24,
    color: '#000',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
  },
  placeholder: {
    width: 40,
  },
  profileCard: {
    alignItems: 'center',
    padding: 20,
    paddingTop: 20,
    backgroundColor: '#fff',
    marginBottom: 16,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  profileImageContainer: {
    position: 'relative',
    marginBottom: 15,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  verifiedBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#E32636',
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  verifiedText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  name: {
    fontSize: 20,
    fontWeight: '600',
    color: '#000',
    marginBottom: 5,
  },
  details: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  location: {
    fontSize: 14,
    color: '#666',
    marginBottom: 20,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 20,
  },
  actionButton: {
    backgroundColor: '#E32636',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 25,
    minWidth: 120,
    alignItems: 'center',
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
  statsContainer: {
    width: 306,
    height: 75,
    flexShrink: 0,
    borderRadius: 20,
    backgroundColor: '#FFF',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 4,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    alignSelf: 'center',
    marginBottom: 20,
  },
  statItem: {
    width: 90,
    height: 90,
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
  bookingInfo: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 4
  },
  bookingLabel: {
    flexShrink: 0,
    color: '#757575',
    fontFamily: 'Inter',
    fontSize: 16,
    fontStyle: 'normal',
    fontWeight: '500',
    lineHeight: 20,
  },
  bookingDate: {
    fontSize: 16,
    fontWeight: '500',
    color: '#000',
    fontFamily: 'Inter',
    lineHeight: 20,
    marginLeft: 4
  },
  completeButton: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 20,
    paddingVertical: 20,
    borderRadius: 25,
    minWidth: 200,
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 20,
  },
  disabledButton: {
    backgroundColor: '#A5D6A7',
  },
  completeButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500'
  }
});