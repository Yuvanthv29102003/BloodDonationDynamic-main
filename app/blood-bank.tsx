import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Dimensions, ScrollView, ActivityIndicator, Linking } from 'react-native';
import { router } from 'expo-router';
import { supabase } from '../lib/supabase';
import * as Location from 'expo-location';
import MapView, { Marker } from 'react-native-maps';

const { width } = Dimensions.get('window');

interface BloodBank {
  id: string;
  name: string;
  email: string;
  address: string;
  location: string;
  latitude: number;
  longitude: number;
  contact: string;
  operating_hours: string;
  distance?: string;
  inventory?: { [key: string]: number };
}

export default function BloodBankScreen() {
  const [bloodBanks, setBloodBanks] = useState<BloodBank[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(null);

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

  const fetchBloodBanks = async (userLat: number, userLon: number) => {
    try {
      // Fetch blood banks
      const { data: bloodBanksData, error: bloodBanksError } = await supabase
        .from('blood_banks')
        .select('*');

      if (bloodBanksError) throw bloodBanksError;

      // Fetch blood inventory for all blood banks
      const { data: inventoryData, error: inventoryError } = await supabase
        .from('blood_inventory')
        .select('*');

      if (inventoryError) throw inventoryError;

      // Process and combine the data
      const processedBloodBanks = bloodBanksData.map(bank => {
        // Calculate distance
        const distance = calculateDistance(
          userLat,
          userLon,
          bank.latitude,
          bank.longitude
        );

        // Group inventory by blood bank
        const bankInventory = inventoryData
          .filter(item => item.blood_bank_id === bank.id)
          .reduce((acc, item) => {
            acc[item.blood_group] = item.units;
            return acc;
          }, {} as { [key: string]: number });

        return {
          ...bank,
          distance: `${distance.toFixed(1)}km`,
          inventory: bankInventory
        };
      });

      // Sort by distance
      const sortedBloodBanks = processedBloodBanks.sort((a, b) => 
        parseFloat(a.distance!) - parseFloat(b.distance!)
      );

      setBloodBanks(sortedBloodBanks);
    } catch (error) {
      console.error('Error fetching blood banks:', error);
      setError('Failed to fetch blood banks');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const getLocationAndFetchData = async () => {
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

        await fetchBloodBanks(location.coords.latitude, location.coords.longitude);
      } catch (error) {
        console.error('Error:', error);
        setError('Error fetching location');
      }
    };

    getLocationAndFetchData();
  }, []);

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
        <Text style={styles.headerTitle}>Available Blood Banks</Text>
      </View>

      <ScrollView style={styles.content}>
        {bloodBanks.map((bank) => (
          <TouchableOpacity 
            key={bank.id} 
            style={styles.bankCard}
            onPress={() => {
              router.push({
                pathname: '/blood-bank-details',
                params: {
                  id: bank.id,
                  name: bank.name,
                  location: bank.location,
                  address: bank.address,
                  email: bank.email || 'Not available',
                  contact: bank.contact,
                  operating_hours: bank.operating_hours,
                  latitude: bank.latitude.toString(),
                  longitude: bank.longitude.toString(),
                  distance: bank.distance
                }
              });
            }}
          >
            <View style={styles.bankInfo}>
              <Image
                source={require('../assets/images/blood-bank.png')}
                style={styles.bankImage}
                resizeMode="contain"
              />
              <View style={styles.bankDetails}>
                <Text style={styles.bankName}>{bank.name}</Text>
                <Text style={styles.bankLocation}>{bank.location}</Text>
                <Text style={styles.bankDistance}>{bank.distance}</Text>
                <Text style={styles.availableUnits}>
                  Available Units: {bank.inventory ? Object.values(bank.inventory).reduce((a, b) => a + b, 0) : 0}
                </Text>
              </View>
              <TouchableOpacity 
                style={styles.viewButton}
                onPress={() => {
                  router.push({
                    pathname: '/blood-bank-details',
                    params: {
                      id: bank.id,
                      name: bank.name,
                      location: bank.location,
                      address: bank.address,
                      email: bank.email || 'Not available',
                      contact: bank.contact,
                      operating_hours: bank.operating_hours,
                      latitude: bank.latitude.toString(),
                      longitude: bank.longitude.toString(),
                      distance: bank.distance
                    }
                  });
                }}
              >
                <Text style={styles.viewButtonText}>View details</Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  availableUnits: {
    fontSize: 14,
    color: '#E32636',
    marginTop: 4,
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
  },
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 55,
    paddingHorizontal: 20,
    paddingBottom: 20,
    backgroundColor: '#fff',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
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
    marginLeft: 20,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  bankCard: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 8,
    marginBottom: 28,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  nameButtonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 0,
  },
  bankInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  bankImage: {
    width: 40,
    height: 40,
    marginRight: 10,
  },
  bankDetails: {
    flex: 1,
  },
  bankName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    marginBottom: 0,
  },
  bankLocation: {
    fontSize: 14,
    color: '#666',
    marginBottom: 0,
  },
  bankDistance: {
    fontSize: 14,
    color: '#666',
  },
  viewButton: {
    backgroundColor: '#E32636',
    borderRadius: 5,
    paddingVertical: 6,
    paddingHorizontal: 12,
    marginLeft: 8,
  },
  viewButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
  },
});