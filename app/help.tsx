import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput, Platform, Dimensions, Alert, ActivityIndicator } from 'react-native';
import { router } from 'expo-router';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import * as WebBrowser from 'expo-web-browser';
import queryString from 'query-string';

const { width, height } = Dimensions.get('window');

interface FAQItem {
  question: string;
  answer: string;
}

const faqs: FAQItem[] = [
  {
    question: 'How do I register as a blood donor?',
    answer: 'To register as a blood donor, go to your profile and click on "Register as Donor". Fill in your details including blood type, medical history, and contact information.'
  },
  {
    question: 'What are the eligibility requirements for blood donation?',
    answer: 'Generally, you must be at least 18 years old, weigh at least 50kg, and be in good health. Certain medical conditions or recent travel may affect eligibility.'
  },
  {
    question: 'How often can I donate blood?',
    answer: 'Most people can donate whole blood every 12 weeks. The exact interval depends on the type of donation and your health status.'
  },
  {
    question: 'How long does the donation process take?',
    answer: 'The actual blood donation takes about 8-10 minutes. However, the entire process, including registration and recovery, usually takes about 1 hour.'
  }
];

export default function HelpScreen() {
  const { user } = useAuth();
  const [expandedFAQ, setExpandedFAQ] = useState<number | null>(null);
  const [reportText, setReportText] = useState('');
  const [reportType, setReportType] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleReport = async () => {
    if (!reportType) {
      Alert.alert('Error', 'Please select a report type');
      return;
    }

    if (!reportText.trim()) {
      Alert.alert('Error', 'Please describe your issue');
      return;
    }

    try {
      // Show loading indicator
      setIsLoading(true);

      // Insert report into database
      const { data, error } = await supabase
        .from('reports')
        .insert({
          user_id: user?.id,
          type: reportType,
          description: reportText,
          status: 'pending'
        })
        .select();

      if (error) {
        console.error('Database error:', error.message);
        Alert.alert('Error', `Failed to submit report: ${error.message}`);
        setIsLoading(false);
        return;
      }

      // Create a serverless function approach instead of client-side EmailJS
      // This is just a placeholder - you'll need to implement this function in your backend
    //   const { data: emailData, error: emailError } = await supabase.functions.invoke('send-notification-email', {
    //     body: {
    //       to_email: 'yuvanthv1029@gmail.com',
    //       from_name: user?.email || 'App User',
    //       subject: `New Report: ${reportType}`,
    //       message: `Report Type: ${reportType}\n\nDescription: ${reportText}\n\nUser ID: ${user?.id || 'Anonymous'}`
    //     }
    //   });

    //   if (emailError) {
    //     console.error('Email sending error:', emailError);
    //     Alert.alert(
    //       'Partial Success',
    //       'Your report has been submitted, but we could not send the email notification. Our team will still review your report.',
    //       [{ text: 'OK', onPress: () => {
    //         setReportText('');
    //         setReportType(null);
    //       }}]
    //     );
    //     setIsLoading(false);
    //     return;
    //   }

      setIsLoading(false);
      Alert.alert(
        'Success',
        'Your report has been submitted. We will review it shortly.',
        [{ text: 'OK', onPress: () => {
          setReportText('');
          setReportType(null);
        }}]
      );
    } catch (error) {
      setIsLoading(false);
      console.error('Error submitting report:', error);
      Alert.alert('Error', 'An unexpected error occurred. Please try again later.');
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Help & Report</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Frequently Asked Questions</Text>
          {faqs.map((faq, index) => (
            <TouchableOpacity
              key={index}
              style={styles.faqItem}
              onPress={() => setExpandedFAQ(expandedFAQ === index ? null : index)}
            >
              <Text style={styles.faqQuestion}>{faq.question}</Text>
              {expandedFAQ === index && (
                <Text style={styles.faqAnswer}>{faq.answer}</Text>
              )}
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Report an Issue</Text>
          <View style={styles.reportTypeContainer}>
            <TouchableOpacity
              style={[styles.reportTypeButton, reportType === 'technical' && styles.reportTypeSelected]}
              onPress={() => setReportType('technical')}
            >
              <Text style={[styles.reportTypeText, reportType === 'technical' && styles.reportTypeTextSelected]}>Technical Issue</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.reportTypeButton, reportType === 'user' && styles.reportTypeSelected]}
              onPress={() => setReportType('user')}
            >
              <Text style={[styles.reportTypeText, reportType === 'user' && styles.reportTypeTextSelected]}>Report User</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.reportTypeButton, reportType === 'other' && styles.reportTypeSelected]}
              onPress={() => setReportType('other')}
            >
              <Text style={[styles.reportTypeText, reportType === 'other' && styles.reportTypeTextSelected]}>Other</Text>
            </TouchableOpacity>
          </View>
          <TextInput
            style={styles.reportInput}
            placeholder="Describe your issue here..."
            multiline
            numberOfLines={4}
            value={reportText}
            onChangeText={setReportText}
          />
          <TouchableOpacity 
            style={styles.submitButton} 
            onPress={handleReport}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <Text style={styles.submitButtonText}>Submit Report</Text>
            )}
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Contact Support</Text>
          <Text style={styles.supportText}>
            Need immediate assistance? Contact our support team:
          </Text>
          <Text style={styles.supportEmail}>yuvanthv1029@gmail.com</Text>
          <Text style={styles.supportPhone}>+1 (555) 123-4567</Text>
          <Text style={styles.supportHours}>Available 24/7</Text>
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
    padding: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#000',
    marginBottom: 16,
  },
  faqItem: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#f0f0f0',
  },
  faqQuestion: {
    fontSize: 16,
    fontWeight: '500',
    color: '#000',
  },
  faqAnswer: {
    fontSize: 14,
    color: '#666',
    marginTop: 8,
    lineHeight: 20,
  },
  reportTypeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  reportTypeButton: {
    flex: 1,
    backgroundColor: '#f8f8f8',
    padding: 12,
    borderRadius: 8,
    marginHorizontal: 4,
    alignItems: 'center',
  },
  reportTypeSelected: {
    backgroundColor: '#E32636',
  },
  reportTypeText: {
    fontSize: 14,
    color: '#666',
  },
  reportTypeTextSelected: {
    color: '#fff',
  },
  reportInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    height: 120,
    textAlignVertical: 'top',
    marginBottom: 16,
  },
  submitButton: {
    backgroundColor: '#E32636',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    height: 50,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  supportText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  supportEmail: {
    fontSize: 16,
    color: '#E32636',
    marginBottom: 4,
  },
  supportPhone: {
    fontSize: 16,
    color: '#E32636',
    marginBottom: 4,
  },
  supportHours: {
    fontSize: 14,
    color: '#666',
  },
});