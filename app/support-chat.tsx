import React, { useState, useRef, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet, KeyboardAvoidingView, Platform, Image } from 'react-native';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { supabase } from '../lib/supabase';
import { router } from 'expo-router';
import { sendEmail } from '../lib/services/emailService';
import { useAuth } from '../context/AuthContext';

const GEMINI_API_KEY = process.env.EXPO_PUBLIC_GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY!);

interface Message {
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
}

const BLOOD_RELATED_KEYWORDS = [
  'blood', 'donor', 'donation', 'hospital', 'receiver', 'bank',
  'transfusion', 'type', 'group', 'plasma', 'platelets', 'rh',
  'positive', 'negative', 'emergency', 'donate', 'appointment',
  'cancel', 'request', 'status'
];

export default function SupportChat() {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([
    {
      text: 'Hi! I\'m BloodBot, your blood donation assistant. How can I help you today?',
      sender: 'bot',
      timestamp: new Date()
    }
  ]);
  const [inputText, setInputText] = useState('');
  const scrollViewRef = useRef<ScrollView>(null);
  const [showQuickActions, setShowQuickActions] = useState(true);

  useEffect(() => {
    scrollViewRef.current?.scrollToEnd({ animated: true });
  }, [messages]);

  const handleQuickAction = async (action: string) => {
    let userMessage = '';
    switch(action) {
      case 'cancel':
        userMessage = 'I need to cancel my blood request';
        break;
      case 'status':
        userMessage = 'I want to update my donation status';
        break;
      case 'find':
        userMessage = 'I need help finding a blood donor';
        break;
      case 'report':
        const reportMessage = 'Please select a reason for your report:\n\n1. Fake Information - Report incorrect donor details\n2. Inappropriate Behavior - Report harassment or misconduct\n3. Scam/Fraud - Report users asking for money\n4. Unresponsive User - Report users not replying to requests\n\nPlease type 1, 2, 3, or 4 to select your report reason.';
        setMessages(prev => [...prev, { text: reportMessage, sender: 'bot', timestamp: new Date() }]);
        setShowQuickActions(false);
        return;
      default:
        return;
    }

    const message: Message = {
      text: userMessage,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, message]);
    setShowQuickActions(false);

    const botResponse = await generateResponse(userMessage);
    const botMessage: Message = {
      text: botResponse,
      sender: 'bot',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, botMessage]);
  };

  const generateResponse = async (userMessage: string) => {
    try {
      const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
      
      const { data: bloodRequests } = await supabase
        .from('blood_requests')
        .select('*')
        .eq('request_status', 'pending')
        .limit(5);
  
      const { data: bloodBanks } = await supabase
        .from('blood_banks')
        .select('name, address, operating_hours, available_blood_groups')
        .limit(5);
  
      let prompt = `You are BloodBot, a specialized blood donation assistant. `;
      const lowerCaseMessage = userMessage.toLowerCase();
  
      if (lowerCaseMessage.includes('cancel')) {
        if (bloodRequests && bloodRequests.length > 0) {
          prompt += `Here are the pending blood requests that can be cancelled:\n\n`;
          bloodRequests.forEach(request => {
            prompt += `Request ID: ${request.id}\nBlood Group: ${request.blood_group}\nStatus: ${request.request_status}\n\n`;
          });
          prompt += `To cancel a request, please provide the Request ID.`;
        } else {
          prompt += `You don't have any pending blood requests to cancel.`;
        }
      } else if (lowerCaseMessage.includes('status')) {
        prompt += `To update your donation status, please provide:\n\n1. Your Donor ID\n2. New status (Available/Unavailable)\n3. Reason for status change (optional)\n\nThis will help us maintain accurate donor availability information.`;
      } else if (lowerCaseMessage.includes('find donor')) {
        prompt += `To help find a donor, please provide:\n\n1. Required blood group\n2. Location/City\n3. Urgency level (Emergency/Regular)\n4. Any specific requirements\n\nI'll search our database for matching donors and blood banks.`;
      } else if (lowerCaseMessage.includes('fake information')) {
        prompt += `I understand you want to report fake donor information. To help us investigate:\n\n1. Please provide the donor's name or ID\n2. What information do you believe is incorrect?\n3. Do you have any evidence to support this claim?\n\nOur team will review your report and take appropriate action.`;
      } else if (lowerCaseMessage.includes('inappropriate behavior')) {
        prompt += `I'm sorry to hear about the inappropriate behavior. To help us address this:\n\n1. When did this incident occur?\n2. Please describe the specific behavior\n3. Were there any witnesses?\n4. Have you reported this user before?\n\nWe take these reports very seriously and will investigate promptly.`;
      } else if (lowerCaseMessage.includes('scam') || lowerCaseMessage.includes('fraud')) {
        prompt += `Thank you for reporting potential fraud. Please provide:\n\n1. The user's name/ID who attempted the scam\n2. What type of payment or compensation was requested?\n3. Any screenshots or messages as evidence\n4. When did this occur?\n\nWe have zero tolerance for scams and will take immediate action.`;
      } else if (lowerCaseMessage.includes('unresponsive')) {
        prompt += `I understand you're having trouble with an unresponsive user. To help address this situation effectively, please provide:

    1. The user's name or ID you're trying to contact
    2. How long have you been waiting for a response?
    3. Have you tried contacting them through other means (phone/email)?
    4. Is this for an urgent blood requirement?
    5. What blood type are you looking for?
    6. Your preferred location for blood donation

    This information will help us:
    - Connect you with active donors in your area
    - Escalate urgent cases to our emergency response team
    - Identify patterns of unresponsive users
    - Improve our donor response system

    In the meantime, I can help you find alternative donors or nearby blood banks.`;
      } else if (lowerCaseMessage.includes('hospital') || lowerCaseMessage.includes('blood bank')) {
        if (bloodBanks && bloodBanks.length > 0) {
          prompt += `Here are some nearby blood banks and hospitals:\n\n`;
          bloodBanks.forEach(bank => {
            prompt += `${bank.name}\nAddress: ${bank.address}\nOperating Hours: ${bank.operating_hours}\nAvailable Blood Groups: ${bank.available_blood_groups.join(', ')}\n\n`;
          });
        }
        prompt += `Would you like specific information about any of these facilities or help finding others?`;
      } else {
        prompt += `Please assist with this blood donation related query: ${userMessage}\n\nProvide relevant information about blood donation, donor eligibility, donation process, or connect them with appropriate resources. Keep responses focused on blood donation and medical aspects.`;
      }
  
      prompt += ' Be concise, helpful, and empathetic.';
      
      const result = await model.generateContent(prompt);
      const response = await result.response;
      return response.text();
    } catch (error) {
      console.error('Error generating response:', error);
      return 'I apologize, but I\'m having trouble processing your request. Please try again.';
    }
  };

  const isBloodRelatedQuery = (text: string): boolean => {
    const lowercaseText = text.toLowerCase();
    return BLOOD_RELATED_KEYWORDS.some(keyword => lowercaseText.includes(keyword));
  };

  const handleSend = async () => {
    if (!inputText.trim()) return;

    const userMessage: Message = {
      text: inputText.trim(),
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');

    // Check if the message is a report selection
    const reportTypes = {
      '1': 'Fake Information',
      '2': 'Inappropriate Behavior',
      '3': 'Scam/Fraud',
      '4': 'Unresponsive User'
    };

    const reportType = reportTypes[userMessage.text as keyof typeof reportTypes];
    if (reportType) {
      try {
        await sendEmail({
          to_email: 'yuvanthv1029@gmail.com',
          from_name: user?.email || 'Anonymous User',
          subject: `Blood Donation App Report: ${reportType}`,
          message: `Report Type: ${reportType}\n\nUser ID: ${user?.id || 'Anonymous'}\n\nTimestamp: ${new Date().toLocaleString()}`
        });

        const botMessage: Message = {
          text: 'Thank you for your report. Our team has been notified and will investigate the issue.',
          sender: 'bot',
          timestamp: new Date()
        };
        setMessages(prev => [...prev, botMessage]);
      } catch (error) {
        const errorMessage: Message = {
          text: 'Sorry, there was an error submitting your report. Please try again later.',
          sender: 'bot',
          timestamp: new Date()
        };
        setMessages(prev => [...prev, errorMessage]);
      }
      return;
    }

    const botResponse = await generateResponse(userMessage.text);
    const botMessage: Message = {
      text: botResponse,
      sender: 'bot',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, botMessage]);
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Support Chat</Text>
      </View>
      <ScrollView
        ref={scrollViewRef}
        style={styles.messagesContainer}
        contentContainerStyle={styles.scrollContent}
      >
        {messages.map((message, index) => (
          <View
            key={index}
            style={[
              styles.messageWrapper,
              message.sender === 'user' ? styles.userMessage : styles.botMessage
            ]}
          >
            <Text style={[styles.messageText, message.sender === 'user' ? styles.userMessageText : styles.botMessageText]}>{message.text}</Text>
            <Text style={styles.timestamp}>
              {message.timestamp.toLocaleTimeString()}
            </Text>
          </View>
        ))}
        {showQuickActions && (
          <View style={styles.quickActionsContainer}>
            <TouchableOpacity style={styles.quickActionButton} onPress={() => handleQuickAction('cancel')}>
              <Text style={styles.quickActionText}>Cancel Blood Request</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.quickActionButton} onPress={() => handleQuickAction('status')}>
              <Text style={styles.quickActionText}>Update Status</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.quickActionButton} onPress={() => handleQuickAction('find')}>
              <Text style={styles.quickActionText}>Find Donor</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.quickActionButton} onPress={() => handleQuickAction('report')}>
              <Text style={styles.quickActionText}>Report a User!!</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          value={inputText}
          onChangeText={setInputText}
          placeholder="Type your message here..."
          multiline
          maxLength={500}
          textAlignVertical="center"
        />
        <TouchableOpacity
          style={[styles.sendButton, !inputText.trim() && styles.sendButtonDisabled]}
          onPress={handleSend}
          disabled={!inputText.trim()}
        >
          <Text style={styles.sendButtonText}>Send</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5'
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingTop: Platform.OS === 'ios' ? 50 : 20,
    paddingBottom: 15,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0'
  },
  backButton: {
    padding: 10
  },
  backButtonText: {
    fontSize: 24,
    color: '#333'
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginLeft: 15
  },
  messagesContainer: {
    flex: 1,
    padding: 15
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 10
  },
  messageWrapper: {
    maxWidth: '80%',
    marginVertical: 5,
    padding: 12,
    borderRadius: 20
  },
  userMessage: {
    alignSelf: 'flex-end',
    backgroundColor: '#007AFF',
    marginLeft: '20%',
    borderTopRightRadius: 4
  },
  botMessage: {
    alignSelf: 'flex-start',
    backgroundColor: '#E9E9EB',
    marginRight: '20%',
    borderTopLeftRadius: 4
  },
  messageText: {
    fontSize: 16,
    lineHeight: 20
  },
  userMessageText: {
    color: '#ffffff'
  },
  botMessageText: {
    color: '#000000'
  },
  timestamp: {
    fontSize: 12,
    color: '#666666',
    marginTop: 5,
    alignSelf: 'flex-end'
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 15,
    paddingBottom: Platform.OS === 'ios' ? 30 : 15,
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderTopColor: '#E9E9EB',
    alignItems: 'center'
  },
  input: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 10,
    marginRight: 10,
    fontSize: 16,
    maxHeight: 100,
    minHeight: 40
  },
  sendButton: {
    backgroundColor: '#007AFF',
    borderRadius: 20,
    paddingHorizontal: 20,
    paddingVertical: 10,
    justifyContent: 'center'
  },
  sendButtonDisabled: {
    backgroundColor: '#B0B0B0'
  },
  sendButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold'
  },
  quickActionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
    padding: 15,
    backgroundColor: '#fff',
    marginVertical: 10,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3
  },
  quickActionButton: {
    backgroundColor: '#f8f9fa',
    padding: 15,
    borderRadius: 10,
    marginVertical: 8,
    width: '45%',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e9ecef',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2
  },
  quickActionIcon: {
    width: 32,
    height: 32,
    marginBottom: 8,
    tintColor: '#E32636'
  },
  quickActionText: {
    fontSize: 14,
    color: '#495057',
    fontWeight: '500',
    textAlign: 'center'
  },
});