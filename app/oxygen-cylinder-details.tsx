import React from 'react';
import { View, Text, StyleSheet, Platform, Dimensions, TouchableOpacity, Image, Linking, ScrollView } from 'react-native';
import { router, useLocalSearchParams, Route } from 'expo-router';
import MapView, { Marker } from 'react-native-maps';

type OxygenCylinderParams = {
  name: string;
  address: string;
  phone: string;
  email: string;
  workingHours: string;
  image: string;
  latitude: string;
  longitude: string;
};

const { width, height } = Dimensions.get('window');

export default function OxygenCylinderDetailsScreen() {
  const params = useLocalSearchParams<OxygenCylinderParams>();

  const handleGetDirection = () => {
    const scheme = Platform.select({ ios: 'maps:0,0?q=', android: 'geo:0,0?q=' });
    const latLng = `${params.latitude},${params.longitude}`;
    const label = params.name;
    const url = Platform.select({
      ios: `${scheme}${label}@${latLng}`,
      android: `${scheme}${latLng}(${label})`
    });

    if (url) {
      Linking.openURL(url);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>OXYGEN CYLINDER DETAILS</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.cylinderImagesContainer}>
          <Image
            source={params.image === 'sp' ? require('../assets/images/sp.png')
              : params.image === 'chennai' ? require('../assets/images/chennai.png')
              : params.image === 'ns' ? require('../assets/images/ns.png')
              : require('../assets/images/amos.png')}
            style={styles.cylinderImage}
            resizeMode="contain"
          />
        </View>

        <View style={styles.detailsContainer}>
          <Text style={styles.providerName}>{params.name}</Text>
          
          <View style={styles.detailItem}>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Address:</Text>
              <Text style={styles.detailText}>{params.address}</Text>
            </View>
          </View>
          
          <View style={styles.detailItem}>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Phone:</Text>
              <Text style={styles.detailText}>{params.phone}</Text>
            </View>
          </View>
          
          <View style={styles.detailItem}>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Email:</Text>
              <Text style={styles.detailText}>{params.email}</Text>
            </View>
          </View>
          
          <View style={styles.detailItem}>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Working Hrs:</Text>
              <Text style={styles.detailText}>{params.workingHours}</Text>
            </View>
          </View>
        </View>

        <View style={styles.mapContainer}>
          <MapView
            style={styles.map}
            initialRegion={{
              latitude: parseFloat(params.latitude),
              longitude: parseFloat(params.longitude),
              latitudeDelta: 0.01,
              longitudeDelta: 0.01,
            }}
          >
            <Marker
              coordinate={{
                latitude: parseFloat(params.latitude),
                longitude: parseFloat(params.longitude),
              }}
              title={params.name}
              description="Oxygen Cylinder Provider"
            />
          </MapView>
        </View>

        <TouchableOpacity style={styles.getDirectionButton} onPress={handleGetDirection}>
          <Text style={styles.getDirectionButtonText}>Get Direction</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  )
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
    padding: 16,
  },
  cylinderImagesContainer: {
    height: height * 0.25,
    backgroundColor: '#fff',
    borderRadius: 10,
    marginBottom: 16,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  cylinderImage: {
    width: '100%',
    height: '100%',
  },
  detailsContainer: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 16,
    marginBottom: 16,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  providerName: {
    fontSize: 20,
    fontWeight: '600',
    color: '#000',
    marginBottom: 16,
  },
  detailItem: {
    marginBottom: 12,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    width: '100%',
  },
  detailLabel: {
    fontSize: 14,
    color: '#666',
    width: '35%',
  },
  detailText: {
    fontSize: 16,
    color: '#FF0000',
    fontWeight: '500',
    width: '60%',
    textAlign: 'left',
  },
  mapContainer: {
    height: height * 0.25,
    backgroundColor: '#fff',
    borderRadius: 10,
    marginBottom: 16,
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  map: {
    flex: 1,
  },
  getDirectionButton: {
    backgroundColor: '#E32636',
    borderRadius: 10,
    padding: 16,
    alignItems: 'center',
  },
  getDirectionButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});