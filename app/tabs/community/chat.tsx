import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Image, Platform, Dimensions, Alert, ActivityIndicator } from 'react-native';
import { router, Stack } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import axios from 'axios';
import { supabase } from '../../../lib/supabase';

const { width } = Dimensions.get('window');

export default function CommunityChat() {
  const [image, setImage] = useState('');
  const [thought, setThought] = useState('');
  const [location, setLocation] = useState('');
  const [locationQuery, setLocationQuery] = useState('');
  interface LocationSuggestion {
    properties: {
      place_id: string;
      formatted: string;
    };
  }

  const [locationSuggestions, setLocationSuggestions] = useState<LocationSuggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const GEOAPIFY_API_KEY = "1c6e0c0975a44acab9c12850e21df572";

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

  const handleLocationSearch = async (text: string) => {
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
  };

  const handlePost = async () => {
    if (!thought.trim()) {
      Alert.alert('Error', 'Please enter your thoughts');
      return;
    }

    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        Alert.alert('Error', 'Please login to post');
        return;
      }

      const { data, error } = await supabase
        .from('community_posts')
        .insert([
          {
            user_id: user.id,
            content: thought,
            location: location,
            image_url: image,
            created_at: new Date().toISOString()
          }
        ]);

      if (error) throw error;

      Alert.alert('Success', 'Your post has been shared!');
      router.back();
    } catch (error) {
      console.error('Error posting:', error);
      Alert.alert('Error', 'Failed to share your post');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Community Message</Text>
      </View>

      <View style={styles.content}>
        <Text style={styles.title}>Share your thoughts</Text>
        <TextInput
          style={styles.thoughtInput}
          placeholder="What's on your mind?"
          placeholderTextColor="#999"
          multiline
          value={thought}
          onChangeText={setThought}
        />
        <TouchableOpacity style={styles.locationButton} onPress={() => setLocationQuery('')}>
          <Image
            source={require('../../../assets/images/location.png')}
            style={styles.locationIcon}
            resizeMode="contain"
          />
          <TextInput
            style={styles.locationInput}
            placeholder="Add location (optional)"
            placeholderTextColor="#999"
            value={locationQuery}
            onChangeText={handleLocationSearch}
          />
        </TouchableOpacity>
        {locationSuggestions.length > 0 && (
          <View style={styles.suggestionsContainer}>
            {locationSuggestions.map((item) => (
              <TouchableOpacity
                key={item.properties.place_id}
                style={styles.suggestionItem}
                onPress={() => {
                  setLocation(item.properties.formatted);
                  setLocationQuery(item.properties.formatted);
                  setLocationSuggestions([]);
                }}
              >
                <Text style={styles.suggestionText}>{item.properties.formatted}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        <View style={styles.footer}>
          <TouchableOpacity style={styles.imageButton} onPress={handleImagePickerPress}>
            {image ? (
              <Image
                source={{uri: image}}
                style={styles.imageIcon}
                resizeMode="cover"
              />
            ) : (
              <Image
                source={require('../../../assets/images/image.png')}
                style={styles.imageIcon}
                resizeMode="contain"
              />
            )}
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.postButton, loading && styles.postButtonDisabled]} 
            onPress={handlePost}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.postButtonText}>Post</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  postButtonDisabled: {
    backgroundColor: '#ccc',
  },
  locationInput: {
    flex: 1,
    fontSize: 16,
    color: '#000',
    marginLeft: 8,
  },
  suggestionsContainer: {
    position: 'absolute',
    top: 250,
    left: 16,
    right: 16,
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    zIndex: 1000,
    maxHeight: 200,
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
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: Platform.OS === 'ios' ? 40 : 10,
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
    marginLeft: 16,
  },
  content: {
    flex: 1,
    padding: 16,
    paddingTop: 50,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    marginBottom: 16,
  },
  thoughtInput: {
    height: 120,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#000',
    textAlignVertical: 'top',
    marginBottom: 16,
  },
  locationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  locationIcon: {
    width: 20,
    height: 20,
    marginRight: 8,
  },
  locationText: {
    fontSize: 16,
    color: '#999',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    // marginTop: 'auto',
    marginTop: 200,
  },
  imageButton: {
    width: 40,
    height: 40,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageIcon: {
    width: 40,
    height: 40,
  },
  postButton: {
    backgroundColor: '#E32636',
    borderRadius: 8,
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  postButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});