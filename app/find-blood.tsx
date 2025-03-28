import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Dimensions, Alert, FlatList, TextInput, ScrollView } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import MapView, { Marker, Callout } from 'react-native-maps';
import * as Location from 'expo-location';
import { router } from 'expo-router';
import { LocationObject } from 'expo-location';
import { Icon } from '@rneui/themed';
import axios from 'axios';

const { width, height } = Dimensions.get('window');

const OPEN_CAGE_API_KEY = "a1a4d053e14b4cb9863b6edcd8809028";
const GEOAPIFY_API_KEY = "1c6e0c0975a44acab9c12850e21df572";

// Function to calculate distance between two geographical points
const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
  const R = 6371; // Radius of the Earth in km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c; // Distance in km
  return distance.toFixed(2); // Return distance rounded to 2 decimal places
};

interface Hospital {
  id: number;
  name: string;
  latitude: number;
  longitude: number;
  address?: string;
  distance?: string;
}

interface OpenCageResult {
  formatted: string;
  geometry: {
    lat: number;
    lng: number;
  };
}

export default function FindBlood() {
  // const { userName, setUserName } = useAuth();
  const bloodGroups = ['O+', 'O-', 'B+', 'B-', 'A+', 'A-', 'AB+', 'AB-'];
  const [selectedBloodGroup, setSelectedBloodGroup] = useState<string | null>(null);
  const [selectedTiming, setSelectedTiming] = useState<'now' | 'later'>('now');
  const [location, setLocation] = useState<LocationObject | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [requests, setRequests] = useState<any[]>([]);
  const [isMapReady, setIsMapReady] = useState(false);
  const [locationQuery, setLocationQuery] = useState('');
  const [locationSuggestions, setLocationSuggestions] = useState<any[]>([]);
  const [units, setUnits] = useState('');
  const [region, setRegion] = useState({
    latitude: 0,
    longitude: 0,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  });

  const mapRef = useRef<MapView>(null);

  const validateCoordinates = (coords: any) => {
    if (!coords || typeof coords.latitude !== 'number' || typeof coords.longitude !== 'number') {
      return false;
    }
    return coords.latitude >= -90 && coords.latitude <= 90 &&
           coords.longitude >= -180 && coords.longitude <= 180;
  };

  useEffect(() => {
    if (hospitals.length > 0 && location && mapRef.current) {
      const coordinates = [
        ...hospitals.filter(h => validateCoordinates(h)).map(h => ({
          latitude: h.latitude,
          longitude: h.longitude,
        })),
        location.coords ? {
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
        } : null
      ].filter((coord): coord is { latitude: number; longitude: number } => coord !== null);

      if (coordinates.length > 0) {
        setTimeout(() => {
          try {
            mapRef.current?.fitToCoordinates(coordinates, {
              edgePadding: {
                top: 150,
                right: 150,
                bottom: 150,
                left: 150,
              },
              animated: true,
            });
          } catch (error) {
            console.error('Error fitting coordinates:', error);
          }
        }, 1000);
      }
    }
  }, [hospitals, location]);

  const fetchNearbyHospitals = async (lat: number, lng: number) => {
    try {
      console.log('Searching for hospitals at:', lat, lng);
      
      const reverseQuery = await fetch(
        `https://api.opencagedata.com/geocode/v1/json?q=${lat}+${lng}&key=${OPEN_CAGE_API_KEY}&no_annotations=1`
      );
      const locationData = await reverseQuery.json();
      
      const city = locationData.results[0]?.components?.city || 
                  locationData.results[0]?.components?.town || 
                  locationData.results[0]?.components?.county || 
                  locationData.results[0]?.components?.state || 
                  'Unknown City';
      
      const searchQueries = [
        `clinics in ${city}`,
        `nursing homes in ${city}`,
        `health centers in ${city}`,
        `hospitals in ${city}`,
        `government hospital ${city}`,
        `medical center ${city}`,
        `hospital near ${lat},${lng}`,
        `healthcare facility near ${lat},${lng}`
      ];

      let allHospitals: Hospital[] = [];
      
      for (const query of searchQueries) {
        console.log('Trying query:', query);
        const response = await fetch(
          `https://api.opencagedata.com/geocode/v1/json?q=${encodeURIComponent(query)}&key=${OPEN_CAGE_API_KEY}&limit=20&proximity=${lat},${lng}`
        );
        const data = await response.json();
        
        if (data.results) {
          const results = data.results.filter((place: OpenCageResult) => {
            const name = place.formatted.toLowerCase();
            const isNearby = 
              Math.abs(place.geometry.lat - lat) < 1.0 && 
              Math.abs(place.geometry.lng - lng) < 1.0;
            
            const excludeTerms = [
              'animal', 'veterinary', 'vet', 'taxi', 
              'parking', 'garage', 'school', 'college',
              'laboratory', 'lab'
            ];
            const hasExcludedTerm = excludeTerms.some(term => name.includes(term));
            
            const includeTerms = [
              'hospital', 'medical', 'healthcare', 'clinic', 
              'seva', 'dispensary', 'health', 'nursing',
              'care center', 'polyclinic', 'primary care'
            ];
            const hasIncludedTerm = includeTerms.some(term => name.includes(term));
            
            return isNearby && hasIncludedTerm && !hasExcludedTerm;
          });

          const mappedResults = results.map((result: OpenCageResult, index: number) => {
            const nameParts = result.formatted.split(',');
            const distance = Math.sqrt(
              Math.pow(result.geometry.lat - lat, 2) + 
              Math.pow(result.geometry.lng - lng, 2)
            ) * 111;
            
            return {
              id: allHospitals.length + index,
              name: nameParts[0].replace(/\s*\([^)]*\)/g, '').trim(),
              address: nameParts.slice(1, 3).join(',').trim(),
              latitude: result.geometry.lat,
              longitude: result.geometry.lng,
              distance: distance.toFixed(1)
            };
          });

          allHospitals = [...allHospitals, ...mappedResults];
        }
      }

      const sortedHospitals = allHospitals.sort((a, b) => 
        parseFloat(a.distance || '0') - parseFloat(b.distance || '0')
      );

      const uniqueHospitals = sortedHospitals.filter((hospital, index, self) =>
        index === self.findIndex((h) => (
          Math.abs(h.latitude - hospital.latitude) < 0.0001 &&
          Math.abs(h.longitude - hospital.longitude) < 0.0001
        ))
      );

      console.log('Final hospitals found:', uniqueHospitals);
      setHospitals(uniqueHospitals);

    } catch (error) {
      console.error("Error fetching hospitals:", error);
      Alert.alert(
        "Error",
        "Failed to fetch hospitals. Please check your internet connection and try again."
      );
      setHospitals([]);
    }
  };

  useEffect(() => {
    (async () => {
      try {
        let { status } = await Location.getForegroundPermissionsAsync();
        
        if (status !== 'granted') {
          const { status: newStatus } = await Location.requestForegroundPermissionsAsync();
          if (newStatus !== 'granted') {
            setErrorMsg('Please enable location permissions in your device settings');
            return;
          }
        }

        const currentLocation = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        });
        
        console.log('Current location:', currentLocation);
        setLocation(currentLocation);
        await fetchNearbyHospitals(
          currentLocation.coords.latitude,
          currentLocation.coords.longitude
        );
      } catch (error: any) {
        setErrorMsg('Error getting location: ' + error.message);
        console.error('Location error:', error);
      }
    })();
  }, []);

  useEffect(() => {
    if (hospitals.length > 0) {
      console.log('Creating markers for hospitals:', hospitals.map(h => ({
        id: h.id,
        name: h.name,
        lat: h.latitude,
        lng: h.longitude
      })));
    }
  }, [hospitals]);

  useEffect(() => {
    if (hospitals.length > 0 && isMapReady) {
      setIsMapReady(false);
      setTimeout(() => {
        setIsMapReady(true);
      }, 100);
    }
  }, [hospitals]);

  const handleAddBloodRequest = async () => {
    if (!selectedBloodGroup) {
      Alert.alert('Please select a blood group');
      return;
    }

    if (!locationQuery.trim()) {
      Alert.alert('Please enter a location');
      return;
    }

    if (!units.trim() || parseInt(units) <= 0) {
      Alert.alert('Please enter a valid number of units');
      return;
    }

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user?.id) {
        Alert.alert('Please sign in to continue');
        return;
      }

      const { error: requestError } = await supabase
        .from('blood_requests')
        .insert([
          {
            user_id: user.id,
            blood_group: selectedBloodGroup,
            requester_name: 'Yuvanth',
            request_status: 'pending',
            location: locationQuery,
            units: parseInt(units),
            latitude: location?.coords.latitude,
            longitude: location?.coords.longitude
          }
        ]);

      if (requestError) throw requestError;

      const { error: notificationError } = await supabase
        .from('notifications')
        .insert([
          {
            user_id: user.id,
            name: 'Yuvanth',
            blood_group: selectedBloodGroup,
            requester_blood_group: selectedBloodGroup,
            units: parseInt(units),
            location: locationQuery,
            distance: '5.2km',
            status: 'pending',
            address: locationQuery,
            is_read: false
          }
        ]);

      if (notificationError) throw notificationError;

      Alert.alert('Blood request added successfully!');
      router.replace('/notifications');
    } catch (error) {
      console.error('Error adding blood request:', error);
      Alert.alert('Failed to add blood request. Please try again.');
    }
  };  

  const fetchBloodRequests = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user?.id) return;

      const { data: requestsData, error: fetchError } = await supabase
        .from('profiles')
        .select('*')
        .eq('blood_group', selectedBloodGroup);

      if (fetchError) {
        console.error('Error fetching blood requests:', fetchError);
        return;
      }

      setRequests(requestsData);
    } catch (error) {
      console.error('Error fetching blood requests:', error);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Find Donor</Text>
        <TouchableOpacity style={styles.locationButton}>
          <Image
            source={require('../assets/images/location.png')}
            style={styles.locationIcon}
            resizeMode="contain"
          />
        </TouchableOpacity>
      </View>

      {location ? (
        <>
          <MapView
            key={hospitals.length > 0 ? 'hospitals-loaded' : 'loading'}
            ref={mapRef}
            style={styles.map}
            initialRegion={{
              latitude: location.coords.latitude,
              longitude: location.coords.longitude,
              latitudeDelta: 0.5,
              longitudeDelta: 0.5,
            }}
            showsUserLocation
            loadingEnabled
            toolbarEnabled
            maxZoomLevel={20}
            minZoomLevel={8}
            onMapReady={() => {
              setIsMapReady(true);
              if (hospitals.length > 0) {
                const coordinates = [
                  ...hospitals.map(h => ({
                    latitude: h.latitude,
                    longitude: h.longitude,
                  })),
                  {
                    latitude: location.coords.latitude,
                    longitude: location.coords.longitude,
                  }
                ];

                // First zoom out to show all hospitals
                mapRef.current?.fitToCoordinates(coordinates, {
                  edgePadding: {
                    top: 100,
                    right: 100,
                    bottom: 100,
                    left: 100,
                  },
                  animated: true
                });

                // Then zoom in to user location after a delay
                setTimeout(() => {
                  mapRef.current?.animateToRegion({
                    latitude: location.coords.latitude,
                    longitude: location.coords.longitude,
                    latitudeDelta: 0.02,
                    longitudeDelta: 0.02,
                  }, 3000);
                }, 2500);
              }
            }}
          >
            {hospitals.map((hospital) => (
              <Marker
                key={`hospital-${hospital.id}`}
                coordinate={{
                  latitude: hospital.latitude,
                  longitude: hospital.longitude,
                }}
                title={hospital.name}
                description={`${hospital.address} (${hospital.distance}km away)`}
              >
                <View style={{
                  width: 30,
                  height: 30,
                  backgroundColor: '#E32636',
                  borderRadius: 20,
                  justifyContent: 'center',
                  alignItems: 'center',
                  elevation: 5,
                }}>
                  <Icon
                    name="heartbeat"
                    type="font-awesome"
                    color="white"
                    size={20}
                  />
                </View>
              </Marker>
            ))}
          </MapView>
          <View style={[styles.debugContainer, { zIndex: 1 }]}>
            <Text>Hospitals found: {hospitals.length}</Text>
          </View>
        </>
      ) : (
        <View style={styles.container}>
          <Text>Loading location...</Text>
          {errorMsg && <Text style={styles.errorText}>{errorMsg}</Text>}
        </View>
      )}

      <View style={styles.content}>
        <Text style={styles.sectionTitle}>Pick your Blood Group</Text>
        <View style={styles.bloodGroupGrid}>
          {bloodGroups.map((group) => (
            <TouchableOpacity
              key={group}
              style={[
                styles.bloodGroupButton,
                selectedBloodGroup === group && styles.activeBloodGroupButton
              ]}
              onPress={() => {
                setSelectedBloodGroup(group);
                fetchBloodRequests();
              }}
            >
              <Text style={[
                styles.bloodGroupText,
                selectedBloodGroup === group && styles.activeBloodGroupText
              ]}>{group}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.sectionTitle}>Select when you need ?</Text>
        <View style={styles.timingButtons}>
          <TouchableOpacity 
            style={[styles.timingButton, selectedTiming === 'now' && styles.activeTimingButton]}
            onPress={() => setSelectedTiming('now')}
          >
            <Text style={[styles.timingButtonText, selectedTiming === 'now' && styles.activeTimingButtonText]}>Now</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.timingButton, selectedTiming === 'later' && styles.activeTimingButton]}
            onPress={() => setSelectedTiming('later')}
          >
            <Text style={[styles.timingButtonText, selectedTiming === 'later' && styles.activeTimingButtonText]}>Book later</Text>
          </TouchableOpacity>
        </View>

        <View style={[styles.inputContainer, { zIndex: 2 }]}>
          <TextInput
            style={styles.input}
            placeholder="Enter location"
            value={locationQuery}
            onChangeText={async (text) => {
              setLocationQuery(text);
              if (text.length > 2) {
                try {
                  const response = await axios.get(
                    `https://api.geoapify.com/v1/geocode/autocomplete?text=${text}&apiKey=${GEOAPIFY_API_KEY}`
                  );
                  setLocationSuggestions(response.data.features);
                } catch (error) {
                  console.error("Error fetching places:", error);
                }
              } else {
                setLocationSuggestions([]);
              }
            }}
          />
          {locationSuggestions.length > 0 && (
            <View style={[styles.suggestionsContainer, { position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 1000 }]}>
              <FlatList
                data={locationSuggestions}
                keyExtractor={(item) => item.properties.place_id}
                renderItem={({ item }) => (
                  <TouchableOpacity 
                    style={styles.suggestionItem}
                    onPress={() => {
                      setLocationQuery(item.properties.formatted);
                      setLocationSuggestions([]);
                    }}
                  >
                    <Text style={styles.suggestionText}>{item.properties.formatted}</Text>
                  </TouchableOpacity>
                )}
                style={styles.suggestionsList}
                scrollEnabled={true}
                keyboardShouldPersistTaps="handled"
                nestedScrollEnabled={true}
                // maxHeight={200}
              />
            </View>
          )}
        </View>

        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Enter number of Units"
            keyboardType="numeric"
            value={units}
            onChangeText={setUnits}
          />
        </View>

        <TouchableOpacity 
          style={styles.requestButton}
          onPress={handleAddBloodRequest}
        >
          <Text style={styles.requestButtonText}>Add Blood Request</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.searchButton} 
          onPress={() => {
            if (!selectedBloodGroup) {
              Alert.alert('Error', 'Please select a blood group');
              return;
            }
            router.push({
              pathname: '/available-donors',
              params: {
                bloodGroup: selectedBloodGroup,
                timing: selectedTiming
              }
            });
          }}
        >
          <Text style={styles.searchButtonText}>Search for Donor</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  searchButton: {
    backgroundColor: '#E32636',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 16,
    shadowColor: '#E32636',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  searchButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 60,
    paddingBottom: 20,
    backgroundColor: '#fff',
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
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000',
  },
  locationButton: {
    padding: 8,
  },
  locationIcon: {
    width: 24,
    height: 24,
  },
  map: {
    width: '100%',
    height: height * 0.4,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#000',
  },
  bloodGroupGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: -58,
  },
  bloodGroupButton: {
    width: '23%',
    aspectRatio: 1,
    backgroundColor: '#fff',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  activeBloodGroupButton: {
    backgroundColor: '#E32636',
    borderColor: '#E32636',
  },
  bloodGroupText: {
    fontSize: 16,
    color: '#000',
  },
  activeBloodGroupText: {
    color: '#fff',
  },
  timingButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  timingButton: {
    width: '48%',
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  activeTimingButton: {
    backgroundColor: '#E32636',
    borderColor: '#E32636',
  },
  timingButtonText: {
    fontSize: 16,
    color: '#000',
  },
  activeTimingButtonText: {
    color: '#fff',
  },
  inputContainer: {
    marginBottom: 16,
  },
  input: {
    height: 48,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 16,
    fontSize: 16,
  },
  suggestionsContainer: {
    backgroundColor: '#fff',
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    maxHeight: 200,
    width: '100%',
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0
  },
  suggestionsList: {
    flex: 1
  },
  suggestionItem: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee'
  },
  suggestionText: {
    fontSize: 14,
    color: '#333'
  },
  requestButton: {
    backgroundColor: '#E32636',
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
  },
  requestButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  debugContainer: {
    position: 'absolute',
    top: 100,
    left: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    padding: 8,
    borderRadius: 4,
  },
  errorText: {
    color: 'red',
    marginTop: 8,
  },
});