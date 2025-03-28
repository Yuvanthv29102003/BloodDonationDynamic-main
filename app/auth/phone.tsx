import React, { useState } from 'react';
import { View, Image, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator, FlatList } from 'react-native';
import axios from 'axios';
import { router } from 'expo-router';
import { supabase } from '../../lib/supabase';

interface Place {
  properties: {
    place_id: string;
    formatted: string;
  };
}

const GEOAPIFY_API_KEY = "1c6e0c0975a44acab9c12850e21df572";

export default function PhoneScreen() {
  const [phoneNumber, setPhoneNumber] = React.useState('');
  const [fullName, setFullName] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const [query, setQuery] = useState<string>('');
  const [places, setPlaces] = useState<Place[]>([]);
  const [selectedPlace, setSelectedPlace] = useState<string>('');

  const searchPlaces = async (text: string) => {
    setQuery(text);
    if (text.length > 2) {
      try {
        const response = await axios.get(
          `https://api.geoapify.com/v1/geocode/autocomplete?text=${text}&apiKey=${GEOAPIFY_API_KEY}`
        );
        setPlaces(response.data.features);
      } catch (error) {
        console.error('Error fetching places:', error);
      }
    } else {
      setPlaces([]);
    }
  };

  const handlePlaceSelect = (place: string) => {
    setSelectedPlace(place);
    setPlaces([]);
    setQuery('');
  };

  const handleNext = async () => {
    if (!fullName || !phoneNumber) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }
    
    setLoading(true);
    const { data, error } = await supabase.auth.signInWithOtp({
      phone: phoneNumber,
      options: {
        data: {
          display_name: fullName
        }
      }
    });

    if (error) {
      Alert.alert('Error', error.message);
    } else {
      Alert.alert('Success', 'OTP has been sent to your phone number');
      router.push(`/auth/otp?phone=${encodeURIComponent(phoneNumber)}&name=${encodeURIComponent(fullName)}`);
    }
    setLoading(false);
    // Store user data in profiles table after successful OTP request
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (user) {
      const { error } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          display_name: fullName,
          phone_number: phoneNumber,
          blood_group: '' // Set to an empty string if not applicable
        });

      if (error) {
        console.error('Error updating profile:', error);
      }

      if (error) {
        console.error('Error updating profile:', error);
      }
    }
  };

  return (
    <View style={styles.container}>
      <Image
        source={require('../../assets/images/authentication.png')}
        style={styles.image}
        resizeMode="contain"
      />
      <Text style={styles.title}>Enter your details to verify</Text>
      
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Enter your full name"
          placeholderTextColor="#999"
          value={fullName}
          onChangeText={setFullName}
        />
        <TextInput
          style={styles.input}
          placeholder="+91 Enter your phone number"
          placeholderTextColor="#999"
          keyboardType="phone-pad"
          value={phoneNumber}
          onChangeText={setPhoneNumber}
        />
        <View style={styles.locationContainer}>
          <TextInput
            style={styles.input}
            placeholder="Enter your location"
            placeholderTextColor="#999"
            value={query}
            onChangeText={searchPlaces}
          />
          {places.length > 0 && (
            <View style={styles.autocompleteContainer}>
              <FlatList
                data={places}
                keyExtractor={(item) => item.properties.place_id}
                renderItem={({ item }) => (
                  <TouchableOpacity 
                    style={styles.suggestionItem}
                    onPress={() => handlePlaceSelect(item.properties.formatted)}
                  >
                    <Text style={styles.suggestionText}>{item.properties.formatted}</Text>
                  </TouchableOpacity>
                )}
                style={styles.suggestionsList}
              />
            </View>
          )}
          {selectedPlace ? (
            <View style={styles.selectedLocationContainer}>
              <Text style={styles.selectedLocationText}>{selectedPlace}</Text>
            </View>
          ) : null}
        </View>
      </View>

      <TouchableOpacity 
        style={[styles.button, loading && styles.buttonDisabled]} 
        onPress={handleNext}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Next</Text>
        )}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  locationContainer: {
    position: 'relative',
    width: '100%',
  },
  autocompleteContainer: {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    zIndex: 1000,
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    maxHeight: 200,
  },
  suggestionsList: {
    flexGrow: 0,
  },
  suggestionItem: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  suggestionText: {
    fontSize: 14,
    color: '#333',
  },
  selectedLocationContainer: {
    marginTop: 10,
    padding: 10,
    backgroundColor: '#f8f8f8',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  selectedLocationText: {
    fontSize: 14,
    color: '#333',
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
  inputContainer: {
    width: '100%',
    gap: 15,
  },
  input: {
    width: '100%',
    height: 50,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 15,
    backgroundColor: '#fff',
    fontSize: 16,
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
  buttonDisabled: {
    backgroundColor: '#ccc',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});