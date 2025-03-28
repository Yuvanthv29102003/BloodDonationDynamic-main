import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Platform, Dimensions, TouchableOpacity, Image, ActivityIndicator } from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import { supabase } from '../lib/supabase';

const { width, height } = Dimensions.get('window');

interface DonorStats {
  donation_count: number;
  last_donation_date: string | null;
  next_donation_date: string | null;
  rating: number;
  lives_saved: number;
  points: number;
}

export default function AchievementScreen() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<DonorStats>({
    donation_count: 0,
    last_donation_date: null,
    next_donation_date: null,
    rating: 0,
    lives_saved: 0,
    points: 0
  });

  const fetchStats = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No user logged in');

      // First check if user has completed registration
      const { data: registrationData, error: registrationError } = await supabase
        .from('registrations')
        .select('status, donor_id')
        .eq('donor_id', user.id)
        .single();

      if (registrationError) {
        if (registrationError.code === 'PGRST116') {
          // Check if user exists in donors table first
          const { data: donorData, error: donorError } = await supabase
            .from('donors')
            .select('id')
            .eq('user_id', user.id)
            .single();

          if (!donorError && donorData) {
            // User exists in donors table, proceed to stats
            const { data: statsData, error: statsError } = await supabase
              .from('donor_statistics')
              .select('donation_count, last_donation_date, next_donation_date, rating, lives_saved, points')
              .eq('donor_id', donorData.id)
              .single();

            if (statsError) {
              if (statsError.code === 'PGRST116') {
                // Create new stats
                const { data: newStats, error: createError } = await supabase
                  .from('donor_statistics')
                  .insert([{
                    donor_id: donorData.id,
                    donation_count: 0,
                    rating: 0,
                    lives_saved: 0,
                    points: 0,
                    last_donation_date: null,
                    next_donation_date: null
                  }])
                  .select()
                  .single();

                if (createError) throw createError;
                setStats(newStats);
                return;
              }
              throw statsError;
            }
            setStats(statsData);
            return;
          }
          
          setError('Please complete your donor registration first');
          return;
        }
        throw registrationError;
      }

      if (registrationData.status !== 'approved') {
        setError('Your donor registration is pending approval');
        return;
      }

      // Get the donor ID from registration data
      const donorId = registrationData.donor_id;

      // Get the donor statistics
      const { data: statsData, error: statsError } = await supabase
        .from('donor_statistics')
        .select('donation_count, last_donation_date, next_donation_date, rating, lives_saved, points')
        .eq('donor_id', donorId)
        .single();

      if (statsError) {
        // If no statistics found, create a new entry
        if (statsError.code === 'PGRST116') {
          const { data: newStats, error: createError } = await supabase
            .from('donor_statistics')
            .insert([{
              donor_id: donorId,
              donation_count: 0,
              rating: 0,
              lives_saved: 0,
              points: 0,
              last_donation_date: null,
              next_donation_date: null
            }])
            .select()
            .single();

          if (createError) throw createError;
          
          setStats(newStats);
          return;
        }
        throw statsError;
      }

      setStats(statsData);
    } catch (err) {
      console.error('Error fetching stats:', err);
      setError('Failed to load achievements');
    } finally {
      setLoading(false);
    }
  };

  // Use useFocusEffect to refresh stats when screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      fetchStats();
    }, [])
  );

  const formatDate = (dateString: string | null) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: '2-digit'
    }).replace(/\//g, '/');
  };

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
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>ACHIEVEMENT</Text>
        <View style={styles.placeholder} />
      </View>

      <View style={styles.content}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>DONATED</Text>
          <View style={styles.donatedContainer}>
            <View style={styles.donatedItem}>
              <Text style={styles.totalDonatedNumber}>{stats.donation_count}</Text>
              <Text style={styles.totalDonatedLabel}>Total Donated</Text>
            </View>
            <View style={styles.donatedItem}>
              <Text style={styles.lastDonatedDate}>{formatDate(stats.last_donation_date)}</Text>
              <Text style={styles.lastDonatedLabel}>Last Donated</Text>
            </View>
            <View style={styles.donatedItem}>
              <Text style={styles.nextDonatedDate}>{formatDate(stats.next_donation_date)}</Text>
              <Text style={styles.nextDonatedLabel}>Next Donation</Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>MEDALS</Text>
          <View style={styles.medalsContainer}>
            <View style={styles.medalItem}>
              <View style={[styles.medalCircle, styles.goldMedal]} />
              <Text style={styles.medalLabel}>Gold</Text>
              <Text style={[styles.medalPoints, styles.goldPoints]}>{stats.points >= 1000 ? 1000 : 0}</Text>
            </View>
            <View style={styles.medalItem}>
              <View style={[styles.medalCircle, styles.silverMedal]} />
              <Text style={styles.medalLabel}>Silver</Text>
              <Text style={[styles.medalPoints, styles.silverPoints]}>{stats.points >= 500 ? 500 : 0}</Text>
            </View>
            <View style={styles.medalItem}>
              <View style={[styles.medalCircle, styles.bronzeMedal]} />
              <Text style={styles.medalLabel}>Bronze</Text>
              <Text style={[styles.medalPoints, styles.bronzePoints]}>{stats.points >= 200 ? 200 : 0}</Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>MILESTONE</Text>
          <View style={styles.milestoneContainer}>
            <View style={styles.milestoneItem}>
              <Image source={require('../assets/images/milestone-1.png')} style={styles.milestoneImage} resizeMode="contain" />
              <Text style={styles.milestoneText}>Earn 200 points</Text>
              <Text style={styles.certificationTextStyle}>Bronze Certified</Text>
            </View>
            <View style={styles.milestoneItem}>
              <Image source={require('../assets/images/milestone-2.png')} style={styles.milestoneImage} resizeMode="contain" />
              <Text style={styles.milestoneText}>Donate Blood</Text>
              <Text style={styles.certificationTextStyle}>Silver Certified</Text>
            </View>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingTop: Platform.OS === 'ios' ? height * 0.05 : height * 0.03,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 10,
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
  content: {
    flex: 1,
    padding: 20,
  },
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 15,
  },
  donatedContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: 'transparent',
    borderRadius: 12,
    paddingVertical: 5,
    paddingHorizontal: 0,
    marginHorizontal: -5
  },
  donatedItem: {
    alignItems: 'center',
    width: 125,
    height: 131.287,
    flexShrink: 0,
    borderRadius: 25,
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    margin: 5,
    padding: 15,
    paddingTop: 30,
    backgroundColor: '#FFF'
  },
  lastDonatedDate: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
    marginBottom: 35,
    backgroundColor: '#ECEEF1',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 12,
    textAlign: 'center',
    minWidth: 90
  },
  nextDonatedDate: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
    marginBottom: 35,
    backgroundColor: '#AA9083',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 12,
    textAlign: 'center',
    minWidth: 90
  },
  totalDonatedNumber: {
    fontSize: 24,
    fontWeight: '600',
    color: '#000',
    marginBottom: 35,
    backgroundColor: '#EAB021',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 12,
  },
  totalDonatedLabel: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center'
  },
  lastDonatedLabel: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center'
  },
  nextDonatedLabel: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center'
  },
  medalsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: 'transparent',
    borderRadius: 12,
    paddingVertical: 5,
    paddingHorizontal: 0,
    marginHorizontal: -5,
    gap: 10
  },
  medalItem: {
    alignItems: 'center',
    width: 125,
    height: 131.287,
    flexShrink: 0,
    borderRadius: 25,
    backgroundColor: '#FFF',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    margin: 5
  },
  medalImage: {
    width: 60,
    height: 60,
    marginBottom: 8,
    resizeMode: 'contain'
  },
  medalLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    marginBottom: 4,
  },
  medalPoints: {
    fontSize: 14,
    fontWeight: '500',
    width: 44,
    height: 23,
    flexShrink: 0,
    marginTop: 10,
    borderRadius: 7.431,
    textAlign: 'center',
    lineHeight: 23,
  },
  goldPoints: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    backgroundColor: '#EAB021',
  },
  silverPoints: {
    color: '#C0C0C0',
    fontSize: 14,
    fontWeight: '600',
    backgroundColor: '#E5E5E5',
  },
  bronzePoints: {
    color: '#CD7F32',
    fontSize: 14,
    fontWeight: '600',
    backgroundColor: '#DEB887',
  },
  medalCircle: {
    width: 34.68,
    height: 34.68,
    borderRadius: 17.34,
    marginBottom: 8,
    display: 'flex',
    padding: 0,
    paddingLeft: 0.02,
    justifyContent: 'center',
    alignItems: 'center',
    flexShrink: 0,
  },
  goldMedal: {
    backgroundColor: '#FFD700',
    boxShadow: '0px 8px 12px rgba(234, 176, 32, 0.40)',
    elevation: 5,
  },
  silverMedal: {
    backgroundColor: '#C0C0C0',
    boxShadow: '0px 8px 12px rgba(192, 192, 192, 0.40)',
    elevation: 5,
  },
  bronzeMedal: {
    backgroundColor: '#CD7F32',
    boxShadow: '0px 11.077px 16.615px 0px #D0C3AF',
    elevation: 5,
  },
  milestoneContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    gap: 15
  },
  milestoneItem: {
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 25,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  milestoneImage: {
    width: 45,
    height: 45,
    marginBottom: 10,
    resizeMode: 'contain',
    borderRadius: 22.5
  },
  milestoneText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000',
    marginBottom: 4,
    textAlign: 'center'
  },
  certificationTextStyle: {
    fontSize: 14,
    color: '#949494',
    marginLeft: 'auto',
    marginTop: 20,
    backgroundColor: '#F6F4EE',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12
  },
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    color: 'red',
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 20,
  },
});