import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform, Dimensions, ScrollView, Image } from 'react-native';
import { router } from 'expo-router';

const { width, height } = Dimensions.get('window');

export default function AboutScreen() {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>About Us</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.section}>
          <Image
            source={require('../assets/images/Zomraty.png' )}
            style={styles.logo}
            resizeMode="contain"
          />
          <Text style={styles.appName}>Zomraty E-Blood Bank</Text>
          <Text style={styles.version}>Version 1.0.0</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Our Mission</Text>
          <Text style={styles.sectionText}>
            Zomraty E-Blood Bank is dedicated to connecting blood donors with those in need, making the blood donation process more accessible and efficient. Our platform aims to save lives by creating a robust network of voluntary blood donors.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Key Features</Text>
          <View style={styles.featureItem}>
            <Text style={styles.featureTitle}>• Real-time Blood Requests</Text>
            <Text style={styles.featureText}>Connect with blood donors and hospitals instantly</Text>
          </View>
          <View style={styles.featureItem}>
            <Text style={styles.featureTitle}>• Donor Community</Text>
            <Text style={styles.featureText}>Join a community of active blood donors</Text>
          </View>
          <View style={styles.featureItem}>
            <Text style={styles.featureTitle}>• E-Certificates</Text>
            <Text style={styles.featureText}>Earn certificates for your donations</Text>
          </View>
          <View style={styles.featureItem}>
            <Text style={styles.featureTitle}>• Multi-language Support</Text>
            <Text style={styles.featureText}>Available in multiple languages</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Contact Us</Text>
          <Text style={styles.contactText}>Email: support@zomraty.com</Text>
          <Text style={styles.contactText}>Phone: +1 (555) 123-4567</Text>
          <Text style={styles.contactText}>Address: 123 Blood Bank Street,</Text>
          <Text style={styles.contactText}>Medical District, City - 12345</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.footerText}>Made with ❤️ by Zomraty Team</Text>
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
  content: {
    flex: 1,
    padding: 20,
  },
  section: {
    marginBottom: 30,
    alignItems: 'center',
  },
  logo: {
    width: 150,
    height: 150,
    marginBottom: 16,
  },
  appName: {
    fontSize: 24,
    fontWeight: '600',
    color: '#E32636',
    marginBottom: 8,
  },
  version: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#000',
    marginBottom: 16,
    alignSelf: 'flex-start',
  },
  sectionText: {
    fontSize: 16,
    color: '#333',
    lineHeight: 24,
    textAlign: 'left',
    alignSelf: 'stretch',
  },
  featureItem: {
    marginBottom: 16,
    alignSelf: 'stretch',
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    marginBottom: 4,
  },
  featureText: {
    fontSize: 14,
    color: '#666',
    paddingLeft: 16,
  },
  contactText: {
    fontSize: 16,
    color: '#333',
    marginBottom: 8,
    alignSelf: 'flex-start',
  },
  footerText: {
    fontSize: 14,
    color: '#666',
    marginTop: 16,
  },
});