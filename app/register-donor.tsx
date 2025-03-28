import React, { useState, useCallback, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Image, Platform, Dimensions, ScrollView, FlatList } from 'react-native';
import axios from 'axios';
import { router } from 'expo-router';
import { Switch } from 'react-native';
import { Dropdown } from 'react-native-element-dropdown';
import * as ImagePicker from 'expo-image-picker';
import { Icon } from '@rneui/themed';
import { supabase } from '../lib/supabase';

const { width, height } = Dimensions.get('window');

interface LocationSuggestion {
  properties: {
    place_id: string;
    formatted: string;
  };
}

export default function RegisterDonor() {
  const [showForm, setShowForm] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    age: '',
    phone: '',
    gender: 'Male',
    location: '',
    bloodGroup: '',
    isAvailable: true
  });

  const [locationQuery, setLocationQuery] = useState('');
  const [locationSuggestions, setLocationSuggestions] = useState<LocationSuggestion[]>([]);
  const GEOAPIFY_API_KEY = "1c6e0c0975a44acab9c12850e21df572";

  const [image, setImage] = useState('');

  const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'];

  const handleSubmit = async () => {
    try {
      // First, check if user exists
      const { data: { user } } = await supabase.auth.getUser();
      if (!user?.id) {
        alert('Please sign in to continue');
        return;
      }

      console.log('User ID:', user.id);
      console.log('Email:', formData.email);

      // Validate required fields
      if (!formData.fullName || !formData.email || !formData.age || !formData.phone || !formData.gender || !formData.bloodGroup || !formData.location) {
        alert('Please fill in all required fields');
        return;
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        alert('Please enter a valid email address');
        return;
      }

      // Validate phone number (assuming 10 digits)
      const phoneRegex = /^\d{10}$/;
      if (!phoneRegex.test(formData.phone)) {
        alert('Please enter a valid 10-digit phone number');
        return;
      }

      // Validate age (between 18 and 65)
      const age = parseInt(formData.age);
      if (isNaN(age) || age < 18 || age > 65) {
        alert('Age must be between 18 and 65');
        return;
      }

      // Get coordinates from location string
      const geocodeResponse = await axios.get(
        `https://api.geoapify.com/v1/geocode/search?text=${encodeURIComponent(formData.location)}&apiKey=${GEOAPIFY_API_KEY}`
      );

      const coordinates = geocodeResponse.data.features[0]?.geometry?.coordinates;
      if (!coordinates) {
        alert('Could not determine location coordinates. Please try a different location.');
        return;
      }

      const [longitude, latitude] = coordinates;

      // Check if donor already exists
      const { data: existingDonor, error: donorError } = await supabase
        .from('donors')
        .select('id')
        .eq('id', user.id)
        .single();

      if (donorError) throw donorError;

      // If donor does not exist, create a new donor record
      if (!existingDonor) {
        const { error: createDonorError } = await supabase
          .from('donors')
          .insert([
            {
              id: user.id,
              name: formData.fullName,
              blood_group: formData.bloodGroup,
              location: formData.location,
              latitude: latitude,
              longitude: longitude,
              availability_status: formData.isAvailable ? 'available' : 'unavailable',
              last_donation_date: null
            }
          ]);

        if (createDonorError) throw createDonorError;
      }

      // Check if registration already exists
      console.log('Checking for existing registration...');
      const { data: existingRegistrations, error: registrationCheckError } = await supabase
        .from('registrations')
        .select('id')
        .eq('donor_id', user.id)
        .eq('email', formData.email)
        .limit(1);

      if (registrationCheckError) {
        console.error('Error checking registration:', registrationCheckError);
        throw registrationCheckError;
      }

      console.log('Existing Registrations:', existingRegistrations);

      // Check if any registrations were found
      if (existingRegistrations && existingRegistrations.length > 0) {
        alert('You have already registered with this email. Please check your details or contact support.');
        return;
      }

      // Proceed to insert into registrations table
      const { error: registrationError } = await supabase
        .from('registrations')
        .insert([
          {
            donor_id: user.id,
            display_name: formData.fullName,
            email: formData.email,
            age: parseInt(formData.age),
            phone: formData.phone,
            gender: formData.gender,
            location: formData.location,
            blood_group: formData.bloodGroup,
            is_available: formData.isAvailable,
            avatar_url: image || null,
            status: 'pending'
          }
        ]);

      if (registrationError) throw registrationError;

      alert('Registration successful!');
      router.replace('/tabs/home');
    } catch (error) {
      console.error('Error registering donor:', error);
      alert('Failed to register. Please try again.');
    }
  };

  const handleGenderChange = useCallback((value: any) => {
    setFormData(prev => ({ ...prev, gender: value }));
  }, []);

  const handleImagePickerPress = async() => {
    let result = await ImagePicker.launchImageLibraryAsync(
      {
        // mediaTypes: ImagePicker.MediaTypeOptions.All,
        mediaTypes: ['images', 'videos'],
        allowsEditing: true,
        aspect: [4, 3],
        quality: 1,
      })
    if(!result.canceled) {
      setImage(result.assets[0].uri);
    }
  }

  const handleBloodGroupChange = useCallback((item: any) => {
    setFormData(prev => ({ ...prev, bloodGroup: item.value || item }));
  }, []);

  useEffect(() => {
    const checkExistingRegistration = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user?.id) {
          alert('Please sign in to continue');
          router.replace('/auth/phone');
          return;
        }

        const { data: existingRegistration, error } = await supabase
          .from('registrations')
          .select('*')
          .eq('donor_id', user.id)
          .single();

        if (error && error.code !== 'PGRST116') {
          console.error('Error checking registration:', error);
          return;
        }

        if (existingRegistration) {
          setShowForm(false);
          setErrorMessage('You have already registered as a donor. Please check your profile or contact support for assistance.');
        }
      } catch (error) {
        console.error('Error checking registration:', error);
      }
    };

    checkExistingRegistration();
  }, []);

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Register as Donor</Text>
        <View style={styles.placeholder} />
      </View>

      {!showForm ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorMessage}>{errorMessage}</Text>
          <TouchableOpacity
            style={styles.redirectButton}
            onPress={() => router.replace('/tabs/profile')}
          >
            <Text style={styles.redirectButtonText}>Go to Profile</Text>
          </TouchableOpacity>
        </View>
      ) : (

      <><TouchableOpacity
            onPress={handleImagePickerPress}
          >
            {image ? (
              <Image
                source={{ uri: image }}
                style={styles.profileImage} />
            ) : (
              <View style={[styles.profileImage, styles.iconContainer]}>
                <Icon
                  name="user-circle"
                  type="font-awesome"
                  size={80}
                  color="#ddd" />
              </View>
            )}
          </TouchableOpacity><View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                placeholder="Full Name"
                value={formData.fullName}
                onChangeText={(text) => setFormData({ ...formData, fullName: text })} />
            </View><View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                placeholder="Email"
                keyboardType="email-address"
                value={formData.email}
                onChangeText={(text) => setFormData({ ...formData, email: text })} />
            </View><View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                placeholder="Age"
                keyboardType="numeric"
                value={formData.age}
                onChangeText={(text) => setFormData({ ...formData, age: text })} />
            </View><View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                placeholder="Phone"
                keyboardType="phone-pad"
                value={formData.phone}
                onChangeText={(text) => setFormData({ ...formData, phone: text })} />
            </View><View style={styles.inputContainer}>
              <Dropdown
                style={styles.dropdown}
                placeholderStyle={styles.placeholderStyle}
                selectedTextStyle={styles.selectedTextStyle}
                data={[
                  { label: 'Male', value: 'Male' },
                  { label: 'Female', value: 'Female' },
                  { label: 'Other', value: 'Other' },
                ]}
                maxHeight={300}
                labelField="label"
                valueField="value"
                placeholder="Select Gender"
                value={formData.gender}
                onChange={handleGenderChange} />
            </View><View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                placeholder="Enter your location"
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
                } } />
            </View>
        {locationSuggestions.length > 0 && (
          <View style={[styles.suggestionsContainer, { top: 380 }]}>
            <FlatList
              data={locationSuggestions}
              keyExtractor={(item) => item.properties.place_id}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.suggestionItem}
                  onPress={() => {
                    setFormData({ ...formData, location: item.properties.formatted });
                    setLocationQuery(item.properties.formatted);
                    setLocationSuggestions([]);
                  } }
                >
                  <Text style={styles.suggestionText}>{item.properties.formatted}</Text>
                </TouchableOpacity>
              )}
              style={styles.suggestionsList}
              scrollEnabled={true}
              keyboardShouldPersistTaps="handled" />
          </View>
        )}


        <View style={styles.inputContainer}>
          <Dropdown
            style={styles.dropdown}
            placeholderStyle={styles.placeholderStyle}
            selectedTextStyle={styles.selectedTextStyle}
            data={bloodGroups.map(group => ({
              label: group,
              value: group,
            }))}
            maxHeight={300}
            labelField="label"
            valueField="value"
            placeholder="Select Blood Group"
            value={formData.bloodGroup}
            onChange={handleBloodGroupChange} />
        </View>

        <View style={styles.switchContainer}>
          <Text style={styles.switchLabel}>Always available for Donation</Text>
          <Switch
            value={formData.isAvailable}
            onValueChange={(value) => setFormData({ ...formData, isAvailable: value })}
            trackColor={{ false: '#767577', true: '#E32636' }}
            thumbColor={formData.isAvailable ? '#fff' : '#f4f3f4'} />
        </View>

        <TouchableOpacity style={styles.registerButton} onPress={handleSubmit}>
          <Text style={styles.registerButtonText}>Register as Donor</Text>
        </TouchableOpacity>
      </>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  errorContainer: {
    flex: 1,
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 50
  },
  errorMessage: {
    fontSize: 16,
    color: '#E32636',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 24
  },
  redirectButton: {
    backgroundColor: '#E32636',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8
  },
  redirectButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600'
  },
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: Platform.OS === 'ios' ? 60 : 20,
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
  profileImageContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 40,
    paddingBottom: 40,
    width: '100%'
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 20,
    marginTop: 20,
    alignSelf: 'center'
  },
  iconContainer: {
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 30,
    marginTop: 20
  },
  form: {
    padding: 20,
  },
  inputContainer: {
    marginBottom: 16,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#333',
    backgroundColor: '#fff',
    minHeight: 48,
  },
  dropdown: {
    height: 48,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 12,
    backgroundColor: '#fff',
  },
  placeholderStyle: {
    fontSize: 16,
    color: '#999',
  },
  selectedTextStyle: {
    fontSize: 16,
    color: '#333',
  },
  switchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  switchLabel: {
    fontSize: 16,
    color: '#333',
  },
  registerButton: {
    backgroundColor: '#E32636',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
  },
  registerButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  suggestionsContainer: {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    zIndex: 1000,
    backgroundColor: '#fff',
    borderRadius: 8,
    marginTop: 4,
    maxHeight: 200,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  suggestionsList: {
    borderRadius: 8,
  },
  suggestionItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  suggestionText: {
    fontSize: 14,
    color: '#333',
  },
});
