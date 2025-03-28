import React from 'react';
import { View, Text, StyleSheet, Platform, Dimensions, TouchableOpacity, ScrollView, Image } from 'react-native';
import { router } from 'expo-router';

const { width, height } = Dimensions.get('window');

export default function RulesAndRegulationScreen() {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>RULES & REGULATION</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <View style={styles.titleRow}>
            <Image source={require('../assets/images/who.png')} style={styles.sectionImage} />
            <Text style={styles.sectionTitle}>Who Can Donate Blood?</Text>
          </View>
          <View style={styles.ruleItem}>
            <Text style={styles.ruleText}>• Age Limit: You must be between 18 and 65 years old.</Text>
          </View>
          <View style={styles.ruleItem}>
            <Text style={styles.ruleText}>• Minimum Weight: You should weigh at least 50 kg (110 lbs).</Text>
          </View>
          <View style={styles.ruleItem}>
            <Text style={styles.ruleText}>• Good Health: You should be healthy, without infections, fever, or major illnesses.</Text>
          </View>
          <View style={styles.ruleItem}>
            <Text style={styles.ruleText}>• Normal Blood Pressure: Your blood pressure should not be too high or too low.</Text>
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.titleRow}>
            <Image source={require('../assets/images/donate.png')} style={styles.sectionImage} />
            <Text style={styles.sectionTitle}>Who Cannot Donate Blood?</Text>
          </View>
          <View style={styles.ruleItem}>
            <Text style={styles.ruleText}>• Illness: If you had a cold, fever, or flu in the past 3 days, you cannot donate.</Text>
          </View>
          <View style={styles.ruleItem}>
            <Text style={styles.ruleText}>• Pregnant and Breastfeeding Women: You cannot donate during pregnancy or delivery.</Text>
          </View>
          <View style={styles.ruleItem}>
            <Text style={styles.ruleText}>• Tattoos & Piercings: If you got a tattoo, piercing, or acupuncture, wait 6-12 months before donating.</Text>
          </View>
          <View style={styles.ruleItem}>
            <Text style={styles.ruleText}>• Alcohol & Smoking: Avoid alcohol for 24 hours before donation and do not smoke before or after donating.</Text>
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.titleRow}>
            <Image source={require('../assets/images/what.png')} style={styles.sectionImage} />
            <Text style={styles.sectionTitle}>What to Do After Blood Donation?</Text>
          </View>
          <View style={styles.ruleItem}>
            <Text style={styles.ruleText}>• Rest: Take adequate rest and drink plenty of fluids.</Text>
          </View>
          <View style={styles.ruleItem}>
            <Text style={styles.ruleText}>• Avoid Heavy Work: Do not lift heavy objects or exercise for 24 hours.</Text>
          </View>
          <View style={styles.ruleItem}>
            <Text style={styles.ruleText}>• Eat Healthy Food: Eat iron-rich foods like spinach, eggs, and meat to regain strength.</Text>
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.titleRow}>
            <Image source={require('../assets/images/how.png')} style={styles.sectionImage} />
            <Text style={styles.sectionTitle}>How Often Can You Donate?</Text>
          </View>
          <View style={styles.ruleItem}>
            <Text style={styles.ruleText}>• Whole Blood: Every 3 months (men) and 4 months (women)</Text>
          </View>
          <View style={styles.ruleItem}>
            <Text style={styles.ruleText}>• Platelets: Every 2 weeks, up to 24 times a year.</Text>
          </View>
          <View style={styles.ruleItem}>
            <Text style={styles.ruleText}>• Plasma: Every 28 days, up to 13 times a year.</Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  sectionImage: {
    width: 22,
    height: 22,
    marginRight: 5,
    marginBottom: 10,
    resizeMode: 'contain',
  },
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingTop: Platform.OS === 'ios' ? height * 0.05 : height * 0.03,
    position: 'relative',
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
  content: {
    flex: 1,
    padding: 36,
    zIndex: 1,
  },
  section: {
    marginBottom: 24,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    marginBottom: 12,
  },
  ruleItem: {
    marginBottom: 8,
  },
  ruleText: {
    fontSize: 14,
    color: '#000',
    lineHeight: 20,
    fontWeight: '500',
  },
});