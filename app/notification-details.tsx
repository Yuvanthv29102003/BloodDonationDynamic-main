import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ScrollView, Linking, Platform } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import MapView, { Marker } from 'react-native-maps';

export default function NotificationDetails() {
  const params = useLocalSearchParams();
  const notification = {
    id: params.id as string,
    name: params.name as string,
    blood_group: params.blood_group as string,
    units: parseInt(params.units as string),
    location: params.location as string,
    distance: params.distance as string,
    address: params.address as string,
    latitude: 13.0827, // Default to Chennai coordinates
    longitude: 80.2707
  };

  const handleGetDirections = () => {
    const scheme = Platform.select({ ios: 'maps:0,0?q=', android: 'geo:0,0?q=' });
    const latLng = `${notification.latitude},${notification.longitude}`;
    const label = notification.location;
    const url = Platform.select({
      ios: `${scheme}${label}@${latLng}`,
      android: `${scheme}${latLng}(${label})`
    });

    Linking.openURL(url as string);
  };

  const handleAccept = async () => {
    try {
      // Navigate back to notifications page after accepting
      router.back();
    } catch (error) {
      console.error('Error accepting notification:', error);
      alert('Failed to accept notification');
    }
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
            source={require('../assets/images/donor-guide.png')}
            style={styles.heroImage}
            resizeMode="cover"
          />
        </View>

        <View style={styles.detailsContainer}>
          <Text style={styles.name}>{notification.name}</Text>
          <Text style={styles.distance}>{notification.distance} away</Text>

          <View style={styles.infoSection}>
            <View style={styles.infoRow}>
              <View style={styles.bloodInfoContainer}>
                <Text style={[styles.sectionTitle, styles.bloodGroupText]}>Blood Group: {notification.blood_group}</Text>
                {/* <Text style={styles.bloodGroupText}>{notification.blood_group}</Text> */}
                <Text style={[styles.sectionTitle, styles.unitsText]}> Units Needed: {notification.units}</Text>
                {/* <Text style={styles.unitsText}>{notification.units}</Text> */}
              </View>
            </View>

            <View style={styles.infoRow}>
              <Text style={styles.infoText}>{notification.location}</Text>
            </View>

            <View style={styles.infoRow}>
              <Text style={styles.infoText}>{notification.address}</Text>
            </View>
          </View>

          <View style={styles.mapContainer}>
            <MapView
              style={styles.map}
              initialRegion={{
                latitude: notification.latitude,
                longitude: notification.longitude,
                latitudeDelta: 0.01,
                longitudeDelta: 0.01,
              }}
            >
              <Marker
                coordinate={{
                  latitude: notification.latitude,
                  longitude: notification.longitude,
                }}
                title={notification.location}
                description={notification.name}
              />
            </MapView>
          </View>

          <View style={styles.buttonContainer}>
            <TouchableOpacity style={styles.directionButton} onPress={handleGetDirections}>
              <Text style={styles.directionButtonText}>Get Direction</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.acceptButton} onPress={handleAccept}>
              <Text style={styles.acceptButtonText}>Accept</Text>
            </TouchableOpacity>
          </View>
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
    // backgroundColor: '#f5f5f5',
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
    fontSize: 30,
    fontWeight: '400',
    color: '#000',
    marginBottom: 8,
    textAlign: 'center',
  },
  distance: {
    fontSize: 16,
    color: '#666',
    marginBottom: 20,
    textAlign: 'center',
  },
  infoSection: {
    marginBottom: 24,
    alignItems: 'center',
  },
  infoRow: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    paddingHorizontal: 2,
  },
  bloodGroupText: {
    width: '100%',
    fontSize: 20,
    color: '#E32636',
    fontWeight: '500',
    textAlign: 'center',
    // marginBottom: 8, 
  },
  infoText: {
    width: '100%',
    fontSize: 16,
    color: '#666',
    marginRight: 8,
    fontWeight: '500',
  },
  unitsText: {
    fontSize: 20,
    color: '#E32636',
    fontWeight: '500',
    textAlign: 'center',
  },
  mapContainer: {
    height: 200,
    marginBottom: 12,
    borderRadius: 12,
    overflow: 'hidden',
  },
  map: {
    flex: 1,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    marginBottom: 24,
    gap: 12,
  },
  directionButton: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E32636',
  },
  directionButtonText: {
    color: '#E32636',
    fontSize: 16,
    fontWeight: '600',
  },
  acceptButton: {
    flex: 1,
    backgroundColor: '#E32636',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  acceptButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  bloodInfoContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    padding: 24,
    marginBottom: 16,
    backgroundColor: '#FFF5F5',
    borderRadius: 12,
  },
  sectionTitle: {
    fontSize: 16,
    color: '#666',
    fontWeight: '500',
    paddingBottom: 4,
  },
});