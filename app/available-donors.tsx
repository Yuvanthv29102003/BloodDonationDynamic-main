import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ScrollView, ActivityIndicator } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { supabase } from '../lib/supabase';
import * as Location from 'expo-location';

export interface Donor {
  id: string;
  name: string;
  blood_group: string;
  distance: number;
  location: string;
  latitude: number;
  longitude: number;
  availability_status: string;
  last_donation_date: string | null;
  type?: 'donor' | 'blood_bank';
  contact?: string;
  operating_hours?: string;
  available_units?: number;
  gender?: string;
}

export default function AvailableDonors() {
  const params = useLocalSearchParams();
  const selectedBloodGroup = params.bloodGroup as string;
  const selectedTiming = params.timing as 'now' | 'later';

  const [donors, setDonors] = useState<Donor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(null);

  useEffect(() => {
    const fetchLocation = async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          setError('Location permission denied');
          return;
        }

        const location = await Location.getCurrentPositionAsync({});
        setUserLocation({
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
        });

        await fetchDonors(location.coords.latitude, location.coords.longitude);
      } catch (error) {
        setError('Error getting location');
        console.error('Location error:', error);
      }
    };

    fetchLocation();
  }, [selectedBloodGroup]);

  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371; // Earth's radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  const fetchDonors = async (userLat: number, userLon: number) => {
    try {
      // Fetch individual donors
      const { data: donorsData, error: donorsError } = await supabase
        .from('donors')
        .select('id, name, blood_group, latitude, longitude, availability_status, last_donation_date, gender, location')
        .eq('blood_group', selectedBloodGroup)
        .eq('availability_status', 'available');

      if (donorsError) throw donorsError;

      // Fetch blood banks
      const { data: bloodBanksData, error: bloodBanksError } = await supabase
        .from('blood_banks')
        .select('*');

      if (bloodBanksError) throw bloodBanksError;

      // Process donors data
      const donorsWithDistance = donorsData.map(donor => ({
        ...donor,
        type: 'donor' as const,
        distance: calculateDistance(userLat, userLon, donor.latitude, donor.longitude)
      }));

      // Process blood banks data
      const bloodBanksWithDistance = bloodBanksData
        .filter(bank => bank.available_blood_groups?.includes(selectedBloodGroup))
        .map(bank => ({
          id: bank.id,
          name: bank.name,
          blood_group: selectedBloodGroup,
          distance: calculateDistance(userLat, userLon, bank.latitude, bank.longitude),
          location: bank.address,
          latitude: bank.latitude,
          longitude: bank.longitude,
          availability_status: 'available',
          last_donation_date: null,
          type: 'blood_bank' as const,
          contact: bank.contact,
          operating_hours: bank.operating_hours,
          available_units: bank.blood_units?.[selectedBloodGroup] || 0
        }));

      // Combine and sort all sources
      const allSources = [...donorsWithDistance, ...bloodBanksWithDistance]
        .sort((a, b) => a.distance - b.distance);

      setDonors(allSources);
    } catch (error) {
      console.error('Error fetching donors:', error);
      setError('Failed to fetch donors');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Available Donors</Text>
        <View style={styles.placeholder} />
      </View>

      {loading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#E32636" />
        </View>
      ) : error ? (
        <View style={styles.centerContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : donors.length === 0 ? (
        <View style={styles.centerContainer}>
          <Text style={styles.noDataText}>No donors available for {selectedBloodGroup} blood group</Text>
        </View>
      ) : (
        <ScrollView style={styles.donorList}>
          {donors.map((donor) => (
            <View key={donor.id} style={styles.donorCard}>
              <View style={styles.donorInfo}>
                <Image 
                  source={donor.type === 'blood_bank' 
                    ? require('../assets/images/blood-bank.png')
                    : donor.gender === 'Female'
                    ? require('../assets/images/female.jpg')
                    : require('../assets/images/male.png')} 
                  style={styles.donorImage} 
                />
                <View style={styles.donorDetails}>
                  <Text style={styles.donorName}>{donor.name}</Text>
                  <Text style={styles.donorDistance}>{donor.distance ? `${donor.distance.toFixed(1)}km` : 'Distance unavailable'}, {donor.location}</Text>
                  <Text style={styles.bloodGroup}>
                    {donor.blood_group}
                    {donor.type === 'blood_bank' && donor.available_units !== undefined && 
                      ` (${donor.available_units} units available)`}
                  </Text>
                  {donor.type === 'blood_bank' && donor.operating_hours && (
                    <Text style={styles.additionalInfo}>{donor.operating_hours}</Text>
                  )}
                </View>
              </View>
              <TouchableOpacity 
                style={[styles.viewButton, donor.type === 'blood_bank' && styles.bloodBankButton]}
                onPress={() => {
                  router.push({
                    pathname: '/donor-details',
                    params: {
                      id: donor.id,
                      name: donor.name,
                      location: donor.location,
                      blood_group: donor.blood_group,
                      type: donor.type,
                      gender: donor.gender,
                      distance: donor.distance.toString(),
                      operating_hours: donor.operating_hours,
                      available_units: donor.available_units?.toString()
                    }
                  });
                }}
              >
                <Text style={[styles.viewButtonText, donor.type === 'blood_bank' && styles.bloodBankButtonText]}>
                  View details
                </Text>
              </TouchableOpacity>
            </View>
          ))}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    color: '#E32636',
    fontSize: 16,
    textAlign: 'center',
  },
  noDataText: {
    color: '#666',
    fontSize: 16,
    textAlign: 'center',
  },
  bloodGroup: {
    fontSize: 14,
    color: '#E32636',
    fontWeight: '500',
  },
  additionalInfo: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 55,
    paddingHorizontal: 16,
    backgroundColor: '#fff',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
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
  donorList: {
    flex: 1,
    padding: 16,
  },
  donorCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
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
    justifyContent: 'center',
  },
  donorName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#000',
    marginBottom: 4,
  },
  donorDistance: {
    fontSize: 14,
    color: '#666',
  },
  viewButton: {
    backgroundColor: '#fff',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  viewButtonText: {
    color: '#666',
    fontSize: 14,
  },
  bloodBankButton: {
    backgroundColor: '#E32636',
    borderColor: '#E32636',
  },
  bloodBankButtonText: {
    color: '#fff',
  },
});