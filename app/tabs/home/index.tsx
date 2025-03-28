import React from 'react';
import { View, Text, StyleSheet, Platform, Dimensions, TouchableOpacity, Image, PermissionsAndroid, Alert, Linking } from 'react-native';
import { router } from 'expo-router';
import { FontAwesome } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { useState, useEffect } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { NotificationCount, subscribeToNotifications } from '../../../lib/services/notificationCountService';
import { supabase } from '@/lib/supabase';

const { width, height } = Dimensions.get('window');

export default function HomeScreen() {
  const { user } = useAuth();
  const display_name = user?.user_metadata?.display_name;
  const [location, setLocation] = useState('Loading...');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [notificationCount, setNotificationCount] = useState<NotificationCount>({
    total: 0,
    unread: 0,
    yourRequests: 0,
    otherRequests: 0
  });

  useEffect(() => {
    const fetchUserAndSubscribe = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        subscribeToNotifications(user.id, setNotificationCount);
      }
    };
    fetchUserAndSubscribe();
    (async () => {
      try {
        let { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          setErrorMsg('Permission to access location was denied');
          setLocation('Location access denied');
          return;
        }

        const location = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        });

        const { latitude, longitude } = location.coords;
        const response = await Location.reverseGeocodeAsync({
          latitude,
          longitude
        });

        if (response && response.length > 0) {
          const address = response[0];
          const locationName = address.city || address.subregion || address.region || 'Unknown location';
          setLocation(locationName);
        } else {
          setLocation('Location not found');
        }
      } catch (error) {
        console.error('Error:', error);
        setErrorMsg('Error fetching location');
        setLocation('Location unavailable');
      }
    })();
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.diagonalBackground} />
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.greeting}>Hello, {display_name || 'Yuvanth'}</Text>
          <View style={styles.locationContainer}>
            <View style={styles.locationDot} />
            <Text style={styles.locationText}>{location}</Text>
          </View>
        </View>
        <TouchableOpacity style={styles.notificationButton} onPress={() => router.push('/notifications')}>
          <View>
            <Image
              source={require('../../../assets/images/notifications.png')}
              style={styles.notificationIcon}
              resizeMode="contain"
            />
            {(notificationCount.yourRequests > 0 || notificationCount.otherRequests > 0) && (
              <View style={styles.notificationBadge}>
                <Text style={styles.notificationBadgeText}>
                  {notificationCount.yourRequests + notificationCount.otherRequests}
                </Text>
              </View>
            )}
          </View>
        </TouchableOpacity>
      </View>
      <View style={styles.card}>
        <View style={styles.cardContent}>
          <Text style={styles.cardTitle}>Donate blood{"\n"}Save life</Text>
          <TouchableOpacity style={styles.guideButtonDonor} onPress={() => Linking.openURL('https://youtu.be/HmdwFmNQwG8?si=XH4KMjYdTz3tBC7n')}>
            <Text style={styles.guideButtonTextDonor}>Donor Guide</Text>
            <Image
              source={require('../../../assets/images/play.png')}
              style={{ width: 16, height: 16, marginLeft: 5 }}
              resizeMode="contain"
            />
          </TouchableOpacity>
        </View>
        <Image
          source={require('../../../assets/images/donor-guide.png')}
          style={styles.cardImage}
          resizeMode="contain"
        />
      </View>

      <View style={styles.buttonGrid}>
      <TouchableOpacity style={styles.gridButton} onPress={() => router.push('/find-blood')}>
          <View style={styles.iconContainer}>
            <Image source={require('../../../assets/images/find-blood.png')} resizeMode="contain" />
          </View>
          <Text style={styles.buttonText}>FIND BLOOD</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.gridButton} onPress={() => router.push('/blood-bank')}>
          <View style={styles.iconContainer}>
            <Image source={require('../../../assets/images/blood-bank.png')} resizeMode="contain" />
          </View>
          <Text style={styles.buttonText}>BLOOD BANK</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.gridButton} onPress={() => router.push('/register-donor')}>
          <View style={styles.iconContainer}>
            <Image source={require('../../../assets/images/donate-blood.png')} resizeMode="contain" />
          </View>
          <Text style={styles.buttonText}>DONATE BLOOD</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.gridButton} onPress={() => router.push('/other-options')}>
          <View style={styles.iconContainer}>
            <Image source={require('../../../assets/images/other-options.png')} resizeMode="contain" />
          </View>
          <Text style={styles.buttonText}>OTHER OPTIONS</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  gridButtonRequests: {
    width: '100%',
    height: 110,
    backgroundColor: '#fff',
    borderRadius: 10,
    // marginHorizontal: width * 0.01,
    marginBottom: 15,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  RequestsIconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  RequestsButtonText: {
    color: '#333',
    fontSize: 20,
    fontWeight: '600',
    marginTop: 8,
  },
  buttonGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    padding: width * 0.04,
    marginTop: height * 0.05,
  },
  gridButton: {
    width: '48%',
    aspectRatio: 1,
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 1,
    marginBottom: 25,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  iconContainer: {
    marginBottom: 10,
  },
  buttonText: {
    color: '#333',
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
  card: {
    backgroundColor: '#D13A42',
    borderRadius: 10,
    margin: width * 0.03,
    padding: width * 0.08,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    overflow: 'hidden',
  },
  cardContent: {
    flex: 1,
    paddingRight: 40,
  },
  cardTitle: {
    color: '#fff',
    fontSize: 24,
    fontWeight: '600',
    marginBottom: 20,
  },
  guideButtonDonor: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#831019',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 5,
    alignSelf: 'flex-start',
  },
  guideButtonTextDonor: {
    color: '#fff',
    marginRight: 5,
    fontSize: 12,
    fontWeight: '600',
  },
  cardImage: {
    width: width * 0.25,
    height: width * 0.25,
  },
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingTop: Platform.OS === 'ios' ? height * 0.05 : height * 0.03,
    position: 'relative',
  },
  diagonalBackground: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 407.586,
    height: 1727.247,
    backgroundColor: '#C91C2A',
    transform: [{ rotate: '22deg' }],
    flexShrink: 0,
    zIndex: 0,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: width * 0.06,
    // marginBottom: height * 0.04,
    zIndex: 1,
  },
  headerLeft: {
    flex: 1,
  },
  greeting: {
    fontSize: 20,
    fontWeight: '600',
    color: '#000',
    fontFamily: 'Inter',
    fontStyle: 'normal',
    lineHeight: 20,
    marginBottom: 4,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  locationDot: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#58DD7A',
    marginRight: 6,
    flexShrink: 0,
  },
  locationText: {
    fontSize: 15,
    color: '#949494',
    fontFamily: 'Inter',
    fontWeight: '600',
    fontStyle: 'normal',
    lineHeight: 15,
  },
  notificationButton: {
    // padding: 8,
  },
  notificationIcon: {
    width: 25.464,
    height: 25.46,
    flexShrink: 0,
  },
  notificationBadge: {
    position: 'absolute',
    right: -6,
    top: -6,
    backgroundColor: '#E32636',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#fff',
  },
  notificationBadgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
    textAlign: 'center',
    paddingHorizontal: 4,
  },
  content: {
    // flex: 1,
    padding: width * 0.08,
    // zIndex: 1,
  },
  donateCard: {
    width: 328,
    height: 172,
    backgroundColor: '#D13A42',
    borderRadius: 10,
    padding: width * 0.06,
    position: 'relative',
    overflow: 'hidden',
    flexShrink: 0,
  },
  donateTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#fff',
    marginBottom: height * 0.02,
    fontFamily: 'Inter',
    fontStyle: 'normal',
    lineHeight: 24.589,
  },
  donorGuideButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#831019',
    width: 113,
    height: 31,
    borderRadius: 5,
    justifyContent: 'center',
    flexShrink: 0,
  },
  donorGuideText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '600',
    marginRight: 4,
    fontFamily: 'Inter',
    fontStyle: 'normal',
    lineHeight: 14.754,
  },
  playIcon: {
    color: '#FFF',
    fontSize: 15,
    width: 15,
    height: 15,
    flexShrink: 0,
  },
  donorImage: {
    position: 'absolute',
    right: width * 0.02,
    bottom: height * 0.02,
    width: width * 0.3,
    height: width * 0.3,
  },
});