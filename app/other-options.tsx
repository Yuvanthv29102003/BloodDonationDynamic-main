import React from 'react';
import { View, Text, StyleSheet, Platform, Dimensions, TouchableOpacity, Image } from 'react-native';
import { router } from 'expo-router';

const { width, height } = Dimensions.get('window');

export default function OtherOptionsScreen() {
  return (
    <View style={styles.container}>
      <View style={styles.diagonalBackground} />
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Other Options</Text>
        <View style={styles.placeholder} />
      </View>

      <View style={styles.optionsContainer}>
        <TouchableOpacity style={styles.optionButton} onPress={() => router.push('/e-certificate')}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <View style={styles.iconContainer}>
              <Image source={require('../assets/images/e-certificate.png')} resizeMode="contain" />
            </View>
            <Text style={styles.optionText}>E - CERTIFICATE</Text>
          </View>
          <Image source={require('../assets/images/arrow.png')} style={styles.arrowIcon} resizeMode="contain" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.optionButton} onPress={() => router.push('/achievement')}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <View style={styles.iconContainer}>
              <Image source={require('../assets/images/achievement.png')} resizeMode="contain" />
            </View>
            <Text style={styles.optionText}>ACHIEVEMENT</Text>
          </View>
          <Image source={require('../assets/images/arrow.png')} style={styles.arrowIcon} resizeMode="contain" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.optionButton} onPress={() => router.push('/rules-and-regulation')}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <View style={styles.iconContainer}>
              <Image source={require('../assets/images/rules-and-regulation.png')} resizeMode="contain" />
            </View>
            <Text style={styles.optionText}>RULES & REGULATION</Text>
          </View>
          <Image source={require('../assets/images/arrow.png')} style={styles.arrowIcon} resizeMode="contain" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.optionButton} onPress={() => router.push('/find-oxygen')}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <View style={styles.iconContainer}>
              <Image source={require('../assets/images/find-oxygen.png')} resizeMode="contain" />
            </View>
            <Text style={styles.optionText}>FIND OXYGEN CYLINDER</Text>
          </View>
          <Image source={require('../assets/images/arrow.png')} style={styles.arrowIcon} resizeMode="contain" />
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
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 10,
    zIndex: 1,
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
  optionsContainer: {
    flex: 1,
    padding: 20,
    zIndex: 1,
    marginTop: 50,
    marginLeft: 20,
  },
  optionButton: {
    width: 327,
    height: 57,
    flexShrink: 0,
    backgroundColor: '#fff',
    borderRadius: 20,
    marginBottom: 35,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    justifyContent: 'space-between'
  },
  iconContainer: {
    marginRight: 15,
  },
  optionText: {
    color: '#333',
    fontSize: 16,
    fontWeight: '600',
  },
  arrowIcon: {
    width: 20,
    height: 20
  }
});