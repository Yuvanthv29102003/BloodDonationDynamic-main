import React, { useState, useCallback, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Image, Platform, Dimensions, ScrollView, FlatList } from 'react-native';
import axios from 'axios';
import { router } from 'expo-router';
import { Switch } from 'react-native';
import { Dropdown } from 'react-native-element-dropdown';
import * as ImagePicker from 'expo-image-picker';
import { Icon } from '@rneui/themed';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';

const { width, height } = Dimensions.get('window');

interface LocationSuggestion {
  properties: {
    place_id: string;
    formatted: string;
  };
}

export default function UpdateProfile() {
  const { displayName } = useAuth();
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

  useEffect(() => {
    fetchUserProfile();
  }, []);

  const fetchUserProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user?.id) {
        const { data, error } = await supabase
          .from('registrations')
          .select('*')
          .eq('donor_id', user.id)
          .single();

        if (error) throw error;

        if (data) {
          setFormData({
            fullName: data.display_name || '',
            email: data.email || '',
            age: data.age?.toString() || '',
            phone: data.phone || '',
            gender: data.gender || 'Male',
            location: data.location || '',
            bloodGroup: data.blood_group || '',
            isAvailable: data.is_available || true
          });
          setLocationQuery(data.location || '');
          if (data.avatar_url) {
            setImage(data.avatar_url);
          }
        }
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  };

  const handleSubmit = async () => {
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

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user?.id) throw new Error('No user found');

      const { error } = await supabase
        .from('registrations')
        .upsert({
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
          status: 'active',
          updated_at: new Date().toISOString()
        });

      if (error) throw error;

      alert('Profile updated successfully!');
      router.back();
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Failed to update profile. Please try again.');
    }
  };

  const handleGenderChange = useCallback((value: any) => {
    setFormData(prev => ({ ...prev, gender: value }));
  }, []);

  const handleImagePickerPress = async() => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images', 'videos'],
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });
    
    if(!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };

  const handleBloodGroupChange = useCallback((value: any) => {
    setFormData(prev => ({ ...prev, bloodGroup: value }));
  }, []);

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Update your Profile</Text>
        <View style={styles.placeholder} />
      </View>

      <View style={styles.profileImageContainer}>
        <TouchableOpacity
          style={styles.profileImageContainer}
          onPress={handleImagePickerPress}
        >
          {image ? (
            <Image
              source={{uri: image}}
              style={styles.profileImage}
            />
          ) : (
            <View style={[styles.profileImage, styles.iconContainer]}>
              <Icon
                name="user-circle"
                type="font-awesome"
                size={80}
                color="#ddd"
              />
            </View>
          )}
        </TouchableOpacity>
      </View>

      <View style={styles.form}>
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Full Name"
            value={formData.fullName}
            onChangeText={(text) => setFormData({ ...formData, fullName: text })}
          />
        </View>

        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Email"
            keyboardType="email-address"
            value={formData.email}
            onChangeText={(text) => setFormData({ ...formData, email: text })}
          />
        </View>

        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Age"
            keyboardType="numeric"
            value={formData.age}
            onChangeText={(text) => setFormData({ ...formData, age: text })}
          />
        </View>

        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Phone"
            keyboardType="phone-pad"
            value={formData.phone}
            onChangeText={(text) => setFormData({ ...formData, phone: text })}
          />
        </View>

        <View style={styles.inputContainer}>
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
            onChange={handleGenderChange}
          />
        </View>

        <View style={styles.inputContainer}>
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
            }}
          />
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
                  }}
                >
                  <Text style={styles.suggestionText}>{item.properties.formatted}</Text>
                </TouchableOpacity>
              )}
              style={styles.suggestionsList}
              scrollEnabled={true}
              keyboardShouldPersistTaps="handled"
            />
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
            onChange={handleBloodGroupChange}
          />
        </View>

        <View style={styles.switchContainer}>
          <Text style={styles.switchLabel}>Always available for Donation</Text>
          <Switch
            value={formData.isAvailable}
            onValueChange={(value) => setFormData({ ...formData, isAvailable: value })}
            trackColor={{ false: '#767577', true: '#E32636' }}
            thumbColor={formData.isAvailable ? '#fff' : '#f4f3f4'}
          />
        </View>

        <TouchableOpacity style={styles.updateButton} onPress={handleSubmit}>
          <Text style={styles.updateButtonText}>Update profile</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: Platform.OS === 'ios' ? 40 : 20,
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
    marginTop: 20,
    marginBottom: 20,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  iconContainer: {
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: -10,
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
  updateButton: {
    backgroundColor: '#E32636',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginBottom: 24
  },
  updateButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600'
  },
  suggestionsContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    maxHeight: 200,
    zIndex: 1000,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
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
  }
});