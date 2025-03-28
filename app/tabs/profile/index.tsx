import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform, Dimensions, Image } from 'react-native';
import { useAuth } from '../../../context/AuthContext';
import { supabase } from '../../../lib/supabase';
import { useTranslation } from 'react-i18next'
import { router } from 'expo-router';
import { Share } from 'react-native';
import i18next from '@/lib/i18n/i18n.config';

const { width, height } = Dimensions.get('window');

const languages = [
  { name: 'english', code: 'en' },
  { name: 'hindi', code: 'hi' },
  { name: 'french', code: 'fr' },
  { name: 'mandarin', code: 'zh' },
]

export default function Profile() {
  const { signOut, displayName } = useAuth();
  const [userImage, setUserImage] = useState<string | null>(null);

  const { t, i18n } = useTranslation();

  const changeLanguage = (lang: string) => {
    i18next.changeLanguage(lang)
  }

  useEffect(() => {
    fetchUserProfile();
  }, []);

  const fetchUserProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user?.id) {
        const { data, error } = await supabase
          .from('profiles')
          .select('avatar_url')
          .eq('id', user.id)
          .single();

        if (data?.avatar_url) {
          setUserImage(data.avatar_url);
        }
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      // The navigation and state cleanup is handled by the AuthContext's signOut function
    } catch (error) {
      console.error('Error signing out:', error);
      alert('Failed to sign out. Please try again.');
    }
  };

  const handleInviteFriends = async () => {
    try {
      const result = await Share.share({
        message: "Join Zomraty E-Blood Bank - Connect with blood donors and save lives! Download the app now.",
        title: "Invite friends to Zomraty E-Blood Bank"
      });
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.profileSection}>
        <Image
          source={userImage ? { uri: userImage } : require('../../../assets/images/user-avatar.png')}
          style={styles.profileImage}
        />
        <Text style={styles.profileName}>{displayName || 'Guest'}</Text>
        <TouchableOpacity onPress={() => router.push('/update-profile')}>
          <Text style={styles.updateProfile}>Update your profile</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.menuSection}>
        <TouchableOpacity style={styles.menuItem} >
          <Image
            source={require('../../../assets/images/location.png')}
            style={styles.menuIcon}
          />
          <Text style={styles.menuText}>Add your location</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem} onPress={() => {
          const nextLangIndex = languages.findIndex(lang => lang.code === i18n.language);
          const nextLang = languages[(nextLangIndex + 1) % languages.length];
          changeLanguage(nextLang.code);
        }}>
          <Text style={[styles.menuIcon, styles.languageIcon]}>🌐</Text>
          <Text style={styles.menuText}>Change language ({(i18n.language || 'en').toUpperCase()})</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem} onPress={() => router.push('/notifications')}>
          <Text style={[styles.menuIcon, styles.notificationIcon]}>🔔</Text>
          <Text style={styles.menuText}>notifications</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem} onPress={handleInviteFriends}>
          <Text style={[styles.menuIcon, styles.inviteIcon]}>👥</Text>
          <Text style={styles.menuText}>Invite friends</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem} onPress={() => router.push('/support-chat')}>
          <Text style={[styles.menuIcon, styles.supportIcon]}>💬</Text>
          <Text style={styles.menuText}>Support</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem} onPress={() => router.push('/about')}>
          <Text style={[styles.menuIcon, styles.aboutIcon]}>ℹ️</Text>
          <Text style={styles.menuText}>About us</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem} onPress={() => router.push('/help')}>
          <Text style={[styles.menuIcon, styles.helpIcon]}>🆘</Text>
          <Text style={styles.menuText}>Help / Report</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.signOutButton} onPress={handleSignOut}>
        <Text style={styles.signOutText}>Sign Out</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: width * 0.04,
  },
  profileSection: {
    alignItems: 'center',
    marginTop: Platform.OS === 'ios' ? height * 0.06 : height * 0.03,
    marginBottom: height * 0.04,
  },
  profileImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginBottom: 12,
  },
  profileName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
    marginBottom: 4,
  },
  updateProfile: {
    fontSize: 14,
    color: '#666',
  },
  menuSection: {
    marginTop: height * 0.02,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  menuIcon: {
    width: 24,
    height: 24,
    marginRight: 12,
    fontSize: 20,
  },
  menuText: {
    fontSize: 16,
    color: '#333',
  },
  languageIcon: {
    marginRight: 12,
  },
  notificationIcon: {
    marginRight: 12,
  },
  inviteIcon: {
    marginRight: 12,
  },
  supportIcon: {
    marginRight: 12,
  },
  aboutIcon: {
    marginRight: 12,
  },
  helpIcon: {
    marginRight: 12,
  },
  signOutButton: {
    backgroundColor: '#E32636',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginTop: 'auto',
    marginBottom: height * 0.02,
  },
  signOutText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});