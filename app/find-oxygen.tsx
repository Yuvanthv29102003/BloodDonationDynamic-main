import React from 'react';
import { View, Text, StyleSheet, Platform, Dimensions, TouchableOpacity, Image } from 'react-native';
import { router } from 'expo-router';

const { width, height } = Dimensions.get('window');

export default function FindOxygenScreen() {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>FIND OXYGEN CYLINDER</Text>
        <View style={styles.placeholder} />
      </View>

      <View style={styles.listContainer}>
        <TouchableOpacity style={styles.listItem}>
          <View style={styles.itemContent}>
            <Image source={require('../assets/images/sp.png')} style={styles.itemIcon} resizeMode="contain" />
            <View style={styles.itemInfo}>
              <View style={styles.titleLocationContainer}>
                <View>
                  <Text style={styles.itemTitle}>S P Health Care</Text>
                  <Text style={styles.itemLocation}>5km,kolathur, Chennai</Text>
                </View>
                <TouchableOpacity 
                  style={styles.viewButton}
                  onPress={() => router.push({
                    pathname: '/oxygen-cylinder-details',
                    params: {
                      name: 'S P Health Care',
                      address: '123 Main Street, Kolathur, Chennai-600099',
                      phone: '+91 1234567891',
                      email: 'SPHealthCare@gmail.com',
                      workingHours: '9:00 AM to 6:00 PM',
                      image: 'sp',
                      latitude: 13.0827,
                      longitude: 80.2707
                    }
                  })}
                >
                  <Text style={styles.viewButtonText}>View details</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </TouchableOpacity>

        <TouchableOpacity style={styles.listItem}>
          <View style={styles.itemContent}>
            <Image source={require('../assets/images/chennai.png')} style={styles.itemIcon} resizeMode="contain" />
            <View style={styles.itemInfo}>
              <View style={styles.titleLocationContainer}>
                <View>
                  <Text style={styles.itemTitle}>Chennai Home Care</Text>
                  <Text style={styles.itemLocation}>3.5km,kolathur, Chennai</Text>
                </View>
                <TouchableOpacity 
                  style={styles.viewButton}
                  onPress={() => router.push({
                    pathname: '/oxygen-cylinder-details',
                    params: {
                      name: 'Chennai Home Care',
                      address: '456 Hospital Road, Kolathur, Chennai-600099',
                      phone: '+91 9876543210',
                      email: 'ChennaiHomeCare@gmail.com',
                      workingHours: '8:00 AM to 8:00 PM',
                      image: 'chennai',
                      latitude: 13.0825,
                      longitude: 80.2705
                    }
                  })}
                >
                  <Text style={styles.viewButtonText}>View details</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </TouchableOpacity>

        <TouchableOpacity style={styles.listItem}>
          <View style={styles.itemContent}>
            <Image source={require('../assets/images/ns.png')} style={styles.itemIcon} resizeMode="contain" />
            <View style={styles.itemInfo}>
              <View style={styles.titleLocationContainer}>
                <View>
                  <Text style={styles.itemTitle}>Ns Oxy Care</Text>
                  <Text style={styles.itemLocation}>4km,kolathur, Chennai</Text>
                </View>
                <TouchableOpacity 
                  style={styles.viewButton}
                  onPress={() => router.push({
                    pathname: '/oxygen-cylinder-details',
                    params: {
                      name: 'Ns Oxy Care',
                      address: '789 Health Avenue, Kolathur, Chennai-600099',
                      phone: '+91 8765432109',
                      email: 'NsOxyCare@gmail.com',
                      workingHours: '9:30 AM to 7:00 PM',
                      image: 'ns',
                      latitude: 13.0830,
                      longitude: 80.2710
                    }
                  })}
                >
                  <Text style={styles.viewButtonText}>View details</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </TouchableOpacity>

        <TouchableOpacity style={styles.listItem}>
          <View style={styles.itemContent}>
            <Image source={require('../assets/images/amos.png')} style={styles.itemIcon} resizeMode="contain" />
            <View style={styles.itemInfo}>
              <View style={styles.titleLocationContainer}>
                <View>
                  <Text style={styles.itemTitle}>Amos Surgicals</Text>
                  <Text style={styles.itemLocation}>2.5km,kolathur, Chennai</Text>
                </View>
                <TouchableOpacity 
                  style={styles.viewButton}
                  onPress={() => router.push({
                    pathname: '/oxygen-cylinder-details',
                    params: {
                      name: 'Amos Surgicals',
                      address: '321 Medical Lane, Kolathur, Chennai-600099',
                      phone: '+91 7654321098',
                      email: 'AmosSurgicals@gmail.com',
                      workingHours: '8:30 AM to 6:30 PM',
                      image: 'amos',
                      latitude: 13.0823,
                      longitude: 80.2703
                    }
                  })}
                >
                  <Text style={styles.viewButtonText}>View details</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </TouchableOpacity>
      </View>
    </View>
  );
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
  listContainer: {
    flex: 1,
    padding: 16,
  },
  listItem: {
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
  itemContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  itemIcon: {
    width: 40,
    height: 40,
    marginRight: 12,
  },
  itemInfo: {
    flex: 1,
  },
  itemTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    marginBottom: 4,
  },
  itemLocation: {
    fontSize: 14,
    color: '#666',
  },
  titleLocationContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    flex: 1,
  },
  viewButton: {
    backgroundColor: '#E32636',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 5,
  },
  viewButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
  },
});