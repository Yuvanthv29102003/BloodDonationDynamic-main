import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Platform, Dimensions, TouchableOpacity, Image, ScrollView, Linking, ActivityIndicator } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { router } from 'expo-router';
import { supabase } from '../../../lib/supabase';
import { useAuth } from '../../../context/AuthContext';

const { width, height } = Dimensions.get('window');

interface BloodOnCall {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  contact_numbers: string[];
}

interface BloodCamp {
  id: string;
  title: string;
  description: string;
  location: string;
  event_date: string;
  status: string;
}

interface CommunityPost {
  id: string;
  user_id: string;
  content: string;
  location: string;
  image_url: string;
  created_at: string;
  user_name?: string;
}

export default function CommunityScreen() {
  const [bloodOnCall, setBloodOnCall] = useState<BloodOnCall | null>(null);
  const [bloodCamp, setBloodCamp] = useState<BloodCamp | null>(null);
  const [communityPosts, setCommunityPosts] = useState<CommunityPost[]>([]);
  const [loading, setLoading] = useState(true);
  const { displayName } = useAuth();

  useEffect(() => {
    fetchCommunityData();
    const subscription = supabase
      .channel('community_posts')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'community_posts' }, payload => {
        const newPost = payload.new as CommunityPost;
        setCommunityPosts(prevPosts => [newPost, ...prevPosts]);
      })
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const fetchCommunityData = async () => {
    try {
      // Fetch blood on call data
      const { data: bloodOnCallData, error: bloodOnCallError } = await supabase
        .from('blood_on_call')
        .select('*')
        .eq('is_active', true)
        .single();

      if (bloodOnCallError) throw bloodOnCallError;

      // Fetch upcoming blood camp
      const { data: bloodCampData, error: bloodCampError } = await supabase
        .from('blood_camps')
        .select('*')
        .eq('status', 'upcoming')
        .order('event_date', { ascending: true })
        .limit(1)
        .single();

      if (bloodCampError) throw bloodCampError;

      // Fetch community posts
      const { data: postsData, error: postsError } = await supabase
        .from('community_posts')
        .select('*')
        .order('created_at', { ascending: false });

      if (postsError) throw postsError;

      setBloodOnCall(bloodOnCallData);
      setBloodCamp(bloodCampData);
      setCommunityPosts(postsData || []);
    } catch (error) {
      console.error('Error fetching community data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCall = (number: string) => {
    Linking.openURL(`tel:${number}`);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Community</Text>
        <TouchableOpacity style={styles.chatButton} onPress={() => router.push('/tabs/community/chat')}>
          <FontAwesome name="comments" size={24} color="#000" />
        </TouchableOpacity>
      </View>
      <ScrollView style={styles.content}>
        <View style={styles.section}>
          <View style={styles.bloodOnCallContainer}>
            <Image
              source={require('../../../assets/images/blood-bag.png')}
              style={styles.bloodBagBackground}
              resizeMode="cover"
            />
            <Image
              source={require('../../../assets/images/blood-bag.png')}
              style={styles.bloodOnCallImage}
              resizeMode="contain"
            />
            <Text style={styles.bloodOnCallTitle}>{bloodOnCall?.title || 'DONATE BLOOD, SAVE LIFE!'}</Text>
            <Text style={styles.bloodOnCallSubtitle}>{bloodOnCall?.subtitle || 'BLOOD ON CALL'}</Text>
            <Text style={styles.bloodOnCallText}>{bloodOnCall?.description || 'Loading...'}</Text>
            <TouchableOpacity 
              style={styles.donateButton}
              onPress={() => bloodOnCall?.contact_numbers[0] && handleCall(bloodOnCall.contact_numbers[0])}>
              <Text style={styles.donateButtonText}>DONATE NOW</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.upcomingCampContainer}>
            <Text style={styles.upcomingCampTitle}>UPCOMING BLOOD CAMP</Text>
            <TouchableOpacity style={styles.commentButton}>
              <Image
                source={require('../../../assets/images/comment.png')}
                style={styles.commentIcon}
                resizeMode="contain"
              />
            </TouchableOpacity>
          </View>
          <View style={styles.campCard}>
            <View style={styles.userInfo}>
              <Image
                source={require('../../../assets/images/user-avatar.png')}
                style={styles.userAvatar}
                resizeMode="cover"
              />
              <View style={styles.userDetails}>
                <Text style={styles.userName}>User_123</Text>
                <Text style={styles.postTime}>2 hours ago · College Campus</Text>
              </View>
              <TouchableOpacity style={styles.moreButton}>
                <Text style={styles.moreButtonText}>...</Text>
              </TouchableOpacity>
            </View>
            <Image
              source={require('../../../assets/images/blood-camp-poster.png')}
              style={styles.campPoster}
              resizeMode="cover"
            />
            <View style={styles.campInfo}>
              <Text style={styles.campTitle}>{bloodCamp?.title || 'Loading...'}</Text>
              <Text style={styles.campDescription}>{bloodCamp?.description || 'Blood Donation Camp'}</Text>
              <Text style={styles.campLocation}>📍 {bloodCamp?.location || 'Loading...'}</Text>
              <View style={styles.eventTags}>
                <TouchableOpacity style={styles.eventTag}>
                  <Text style={styles.eventTagText}>Event</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.donateBloodTag}>
                  <Text style={styles.donateBloodTagText}>DonateBlood</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Community Posts</Text>
          {communityPosts.map((post) => (
            <View key={post.id} style={styles.postCard}>
              <View style={styles.userInfo}>
                <Image
                  source={require('../../../assets/images/user-avatar.png')}
                  style={styles.userAvatar}
                  resizeMode="cover"
                />
                <View style={styles.userDetails}>
                  <Text style={styles.userName}>{displayName || 'Anonymous'}</Text>
                  <Text style={styles.postTime}>{new Date(post.created_at).toLocaleDateString()} · {post.location || 'Unknown location'}</Text>
                </View>
              </View>
              <Text style={styles.postContent}>{post.content}</Text>
              {post.image_url && (
                <Image
                  source={{ uri: post.image_url }}
                  style={styles.postImage}
                  resizeMode="cover"
                />
              )}
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
    marginBottom: 16,
    paddingHorizontal: 4,
  },
  postCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  postContent: {
    fontSize: 14,
    color: '#333',
    marginBottom: 12,
    lineHeight: 20,
  },
  postImage: {
    width: '100%',
    height: 200,
    borderRadius: 8,
  },
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: Platform.OS === 'ios' ? 40 : 10,
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
  chatButton: {
    padding: 8,
  },
  chatIcon: {
    width: 24,
    height: 24,
  },
  diagonalBackground: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: width * 2,
    height: height * 2,
    backgroundColor: '#C91C2A',
    transform: [{ rotate: '26deg' }],
    zIndex: 0,
  },
  content: {
    flex: 1,
    zIndex: 1,
    padding: width * 0.05,
  },
  section: {
    marginBottom: 24,
  },
  bloodOnCallContainer: {
    backgroundColor: 'white',
    borderRadius: 0,
    padding: 15,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    marginBottom: 15,
    marginHorizontal: -10,
    position: 'relative',
    overflow: 'hidden',
  },
  bloodBagBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    opacity: 0.1,
    width: '100%',
    height: '100%',
  },
  bloodOnCallImage: {
    width: 20,
    height: 20,
    marginBottom: 10,
  },
  bloodOnCallTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
    marginBottom: 6,
    textAlign: 'center',
  },
  bloodOnCallSubtitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#000',
    marginBottom: 8,
  },
  bloodOnCallText: {
    fontSize: 13,
    color: '#666',
    textAlign: 'center',
    marginBottom: 15,
    lineHeight: 18,
  },
  donateButton: {
    backgroundColor: '#E32636',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  donateButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  upcomingCampContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingHorizontal: 4,
  },
  upcomingCampTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
  },
  commentButton: {
    padding: 8,
  },
  commentIcon: {
    width: 24,
    height: 24,
  },
  campCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  userAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  userDetails: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    marginBottom: 4,
  },
  postTime: {
    fontSize: 14,
    color: '#666',
  },
  moreButton: {
    padding: 8,
  },
  moreButtonText: {
    fontSize: 20,
    color: '#666',
    marginTop: -10,
  },
  campPoster: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    marginBottom: 12,
  },
  campInfo: {
    padding: 4,
  },
  campTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    marginBottom: 8,
  },
  campDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 6,
  },
  campLocation: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
  },
  eventTags: {
    flexDirection: 'row',
    gap: 8,
  },
  eventTag: {
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  eventTagText: {
    fontSize: 12,
    color: '#666',
  },
  donateBloodTag: {
    backgroundColor: '#ffebee',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  donateBloodTagText: {
    fontSize: 12,
    color: '#E32636',
  },
});