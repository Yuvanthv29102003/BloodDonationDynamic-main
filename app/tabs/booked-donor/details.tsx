import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, ActivityIndicator } from 'react-native';
import { router, useLocalSearchParams, Stack } from 'expo-router';
import { supabase } from '../../../lib/supabase';
import { Icon } from '@rneui/themed';

interface DonorStats {
  total_donations: number;
  rating: number;
  lives_saved: number;
  points: number;
  last_donation_date: string | null;
  next_donation_date: string | null;
}

export default function BookedDonorDetails() {
  const params = useLocalSearchParams();
  const [stats, setStats] = useState<DonorStats | null>(null);  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCompleting, setIsCompleting] = useState(false);

  const handleCompleteDonation = async () => {
    try {
      setIsCompleting(true);

      // Complete the donation using the new function
      const { error } = await supabase
        .rpc('complete_donation_v2', {
          p_booked_donor_id: params.id as string,
          p_donor_id: params.donor_id as string
        });

      if (error) throw error;

      // Add a small delay to ensure the database has updated
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Fetch the updated achievements
      const { data: achievementsData, error: achievementsError } = await supabase
        .from('donor_achievements')
        .select('total_donations, rating, lives_saved, points, last_donation_date, next_donation_date')
        .eq('donor_id', params.donor_id)
        .single();

      if (achievementsError) {
        console.error('Error fetching achievements:', achievementsError);
        throw achievementsError;
      }

      // Set the updated stats from achievements data
      setStats({
        total_donations: achievementsData.total_donations,
        rating: achievementsData.rating,
        lives_saved: achievementsData.lives_saved,
        points: achievementsData.points,
        last_donation_date: achievementsData.last_donation_date,
        next_donation_date: achievementsData.next_donation_date
      });

      // Navigate back after a short delay to show updated stats
      setTimeout(() => {
        router.back();
      }, 500);
    } catch (err) {
      console.error('Error completing donation:', err);
      setError('Failed to complete donation');
    } finally {
      setIsCompleting(false);
    }
  };

  useEffect(() => {
    const fetchDonorStats = async () => {
      try {
        const { data, error: statsError } = await supabase
          .from('donor_achievements')
          .select('total_donations, rating, lives_saved, points, last_donation_date, next_donation_date')
          .eq('donor_id', params.donor_id)
          .single();

        if (statsError) {
          // If no achievements exist yet, create initial record
          const { data: newStats, error: insertError } = await supabase
            .from('donor_achievements')
            .insert({
              donor_id: params.donor_id,
              total_donations: 0,
              rating: 0,
              lives_saved: 0,
              points: 0,
              last_donation_date: null,
              next_donation_date: null
            })
            .select()
            .single();

          if (insertError) throw insertError;
          setStats(newStats);
        } else {
          setStats(data);
        }
      } catch (err) {
        console.error('Error fetching stats:', err);
        setError('Failed to load statistics');
      } finally {
        setLoading(false);
      }
    };

    fetchDonorStats();
  }, [params.donor_id]);

  if (loading) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <ActivityIndicator size="large" color="#E32636" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Donor Details</Text>
        <View style={styles.placeholder} />
      </View>

      <View style={styles.profileCard}>
        <View style={styles.profileImageContainer}>
          <Image
            source={params.gender === 'Female' 
              ? require('../../../assets/images/female.jpg')
              : require('../../../assets/images/male.png')}
            style={styles.profileImage}
          />
          <View style={styles.verifiedBadge}>
            <Text style={styles.verifiedText}>✓</Text>
          </View>
        </View>

        <Text style={styles.name}>{params.donor_name}</Text>
        <Text style={styles.location}>{params.donor_location}</Text>

        <View style={styles.actionButtons}>
          <TouchableOpacity style={styles.actionButton}>
            <Icon name="phone" type="feather" size={18} color="#fff" style={styles.actionIcon} />
            <Text style={styles.actionButtonText}>Call Now</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton}>
            <Icon name="message-circle" type="feather" size={18} color="#fff" style={styles.actionIcon} />
            <Text style={styles.actionButtonText}>Message</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity 
          style={[styles.completeButton, isCompleting && styles.disabledButton]}
          onPress={handleCompleteDonation}
          disabled={isCompleting}
        >
          <Text style={styles.completeButtonText}>
            {isCompleting ? 'Completing...' : 'Complete Donation'}
          </Text>
        </TouchableOpacity>

        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{stats?.total_donations}+</Text>
            <Text style={styles.statLabel}>Donated</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{stats?.rating.toFixed(1)}+</Text>
            <Text style={styles.statLabel}>Rating</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{stats?.lives_saved}+</Text>
            <Text style={styles.statLabel}>saved lives</Text>
          </View>
        </View>

        <View style={styles.bookingInfo}>
          <Text style={styles.bookingLabel}>
            Donor Booked on <Text style={styles.bookingDate}>
              {new Date(params.booking_date as string).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
            </Text>
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
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
  },
  profileCard: {
    alignItems: 'center',
    padding: 20,
    paddingTop: 20,
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginTop: 52,
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
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8
  },
  actionIcon: {
    marginRight: 4
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
  completeButton: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
    minWidth: 200,
    alignItems: 'center',
    marginBottom: 20,
  },
  disabledButton: {
    backgroundColor: '#A5D6A7',
  },
  completeButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginBottom: 20,
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
    elevation: 3,
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: '600',
    color: '#000',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    color: '#666',
  },
  bookingInfo: {
    alignItems: 'center',
  },
  bookingLabel: {
    fontSize: 14,
    color: '#666',
  },
  bookingDate: {
    fontSize: 14,
    fontWeight: '500',
    color: '#000',
  },
});