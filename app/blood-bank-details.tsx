import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ScrollView, ActivityIndicator, Linking, Platform } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { supabase } from '../lib/supabase';
import MapView, { Marker } from 'react-native-maps';

export default function BloodBankDetails() {
  const params = useLocalSearchParams();
  const bloodBank = {
    id: params.id as string,
    name: params.name as string,
    location: params.location as string,
    address: params.address as string,
    email: params.email as string,
    contact: params.contact as string,
    operating_hours: params.operating_hours as string,
    latitude: parseFloat(params.latitude as string),
    longitude: parseFloat(params.longitude as string),
    distance: params.distance as string
  };


  const handleGetDirections = () => {
    const scheme = Platform.select({ ios: 'maps:0,0?q=', android: 'geo:0,0?q=' });
    const latLng = `${bloodBank.latitude},${bloodBank.longitude}`;
    const label = bloodBank.name;
    const url = Platform.select({
      ios: `${scheme}${label}@${latLng}`,
      android: `${scheme}${latLng}(${label})`
    });

    Linking.openURL(url as string);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.imageContainer}>
          <Image
            source={require('../assets/images/blood-bank.png')}
            style={styles.heroImage}
            resizeMode="cover"
          />
        </View>

        <View style={styles.detailsContainer}>
          <Text style={styles.name}>{bloodBank.name}</Text>
          {/* <Text style={styles.location}>{bloodBank.location}</Text> */}
          <Text style={styles.distance}>{bloodBank.distance} away</Text>

          <View style={styles.infoSection}>
            <View style={styles.infoRow}>
              <Text style={styles.sectionTitle}>Name:</Text>
              <Text style={styles.infoText}>{bloodBank.name}</Text>
            </View>

            {/* <View style={styles.infoRow}> */}
              {/* <Text style={styles.sectionTitle}>Location:</Text> */}
              {/* <Text style={styles.infoText}>{bloodBank.location}</Text> */}
            {/* </View> */}

            <View style={styles.infoRow}>
              <Text style={styles.sectionTitle}>Address:</Text>
              <Text style={styles.infoText}>{bloodBank.address}</Text>
            </View>

            <View style={styles.infoRow}>
              <Text style={styles.sectionTitle}>Phone:</Text>
              <TouchableOpacity onPress={() => Linking.openURL(`tel:${bloodBank.contact}`)} style={{ flex: 1, alignItems: 'flex-end' }}>
                <Text style={[styles.infoText, styles.contactText]} numberOfLines={1} ellipsizeMode="tail">{bloodBank.contact}</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.infoRow}>
              <Text style={styles.sectionTitle}>Email:</Text>
              <Text style={[styles.infoText, styles.contactText]}>{bloodBank.email}</Text>
            </View>

            <View style={styles.infoRow}>
              <Text style={styles.sectionTitle}>Working Hours:</Text>
              <Text style={styles.infoText}>{bloodBank.operating_hours}</Text>
            </View>
          </View>

          <View style={styles.mapContainer}>
            <MapView
              style={styles.map}
              initialRegion={{
                latitude: bloodBank.latitude,
                longitude: bloodBank.longitude,
                latitudeDelta: 0.01,
                longitudeDelta: 0.01,
              }}
            >
              <Marker
                coordinate={{
                  latitude: bloodBank.latitude,
                  longitude: bloodBank.longitude,
                }}
                title={bloodBank.name}
                description={bloodBank.location}
              />
            </MapView>
          </View>

          <TouchableOpacity style={styles.callButton} onPress={handleGetDirections}>
            <Text style={styles.callButtonText}>Get Directions</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
    paddingTop: 55,
    paddingHorizontal: 16,
    backgroundColor: 'transparent',
  },
  backButton: {
    padding: 8,
    // backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderRadius: 20,
  },
  backButtonText: {
    fontSize: 24,
    color: '#000',
  },
  content: {
    flex: 1,
  },
  imageContainer: {
    height: 300,
    width: '100%',
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  heroImage: {
    width: 200,
    height: 200,
    borderRadius: 100,
  },
  detailsContainer: {
    padding: 20,
  },
  name: {
    fontSize: 24,
    fontWeight: '600',
    color: '#000',
    marginBottom: 8,
  },
  location: {
    fontSize: 16,
    color: '#666',
    marginBottom: 4,
  },
  distance: {
    fontSize: 14,
    color: '#666',
    marginBottom: 20,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 24,
    minHeight: 100,
  },
  statCard: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    minWidth: 100,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: '600',
    color: '#E32636',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    color: '#666',
  },
  infoSection: {
    marginBottom: 24,
    paddingHorizontal: 16,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    justifyContent: 'space-between',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    width: '35%',
  },
  unitsText: {
    fontSize: 16,
    color: '#E32636',
    fontWeight: '500',
  },
  infoText: {
    fontSize: 16,
    color: '#666',
    width: '60%',
    textAlign: 'right',
  },
  mapContainer: {
    height: 200,
    marginBottom: 24,
    borderRadius: 12,
    overflow: 'hidden',
  },
  map: {
    flex: 1,
  },
  callButton: {
    backgroundColor: '#E32636',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginBottom: 24,
  },
  callButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  errorText: {
    color: '#E32636',
    textAlign: 'center',
    fontSize: 14,
  },
  contactText: {
    color: '#E32636',
    fontWeight: '500'
  },
});