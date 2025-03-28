import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ScrollView, ActivityIndicator } from 'react-native';
import { router } from 'expo-router';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';

interface Notification {
  id: string;
  name: string;
  blood_group: string;
  units: number;
  location: string;
  distance: string;
  address: string;
  created_at: string;
  status?: string;
}

export default function Notification() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedTab, setSelectedTab] = useState<'your' | 'other'>('your');
  const [userBloodGroup, setUserBloodGroup] = useState<string | null>(null);
  const [userName, setUserName] = useState<string | null>(null);
  const [yourRequestCount, setYourRequestCount] = useState<number>(0);
  const [otherRequestCount, setOtherRequestCount] = useState<number>(0);

  useEffect(() => {
    fetchUserBloodGroup();
    fetchNotifications();
    // Subscribe to real-time notifications
    const subscription = supabase
      .channel('notifications')
      .on('postgres_changes', 
        { event: 'INSERT', schema: 'public', table: 'notifications' },
        payload => {
          const newNotification = payload.new as Notification;
          if (newNotification.status !== 'accepted') {
            setNotifications(current => {
              const updatedNotifications = newNotification.blood_group === userBloodGroup
                ? [newNotification, ...current]
                : current;
              
              // Update counts
              if (newNotification.blood_group === userBloodGroup) {
                setYourRequestCount(prev => prev + 1);
              } else {
                setOtherRequestCount(prev => prev + 1);
              }
              
              return updatedNotifications;
            });
          }
        }
      )
      .on('postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'notifications' },
        payload => {
          const updatedNotification = payload.new as Notification;
          if (updatedNotification.status === 'accepted') {
            setNotifications(current => {
              const filteredNotifications = current.filter(notification => 
                notification.id !== updatedNotification.id
              );
              
              // Update counts
              if (updatedNotification.blood_group === userBloodGroup) {
                setYourRequestCount(prev => Math.max(0, prev - 1));
              } else {
                setOtherRequestCount(prev => Math.max(0, prev - 1));
              }
              
              return filteredNotifications;
            });
          }
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [selectedTab, userBloodGroup]);

  const fetchUserBloodGroup = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user?.id) {
        // First try to get existing profile
        let { data, error } = await supabase
          .from('profiles')
          .select('blood_group, display_name')
          .eq('user_id', user.id)
          .limit(1)
          .single();

        // If no profile exists, create one with default values
        if (error && error.code === 'PGRST116') {
          const { data: newProfile, error: createError } = await supabase
            .from('profiles')
            .insert([
              {
                user_id: user.id,
                blood_group: 'O+', // Default blood group
                display_name: user.user_metadata?.display_name || 'Yuvanth'
              }
            ])
            .select()
            .single();

          if (createError) throw createError;
          data = newProfile;
        } else if (error) {
          throw error;
        }

        setUserBloodGroup(data?.blood_group || null);
        setUserName(data?.display_name || null);
      
      }
    } catch (err) {
      console.error('Error fetching user blood group:', err);
      setError('Failed to load user profile');
    }
  };

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const { data, error: fetchError } = await supabase
        .from('notifications')
        .select('*')
        .neq('status', 'accepted')
        .order('created_at', { ascending: false });

      if (fetchError) throw fetchError;
      
      const yourRequests = data?.filter(notification => notification.blood_group === userBloodGroup) || [];
      const otherRequests = data?.filter(notification => notification.blood_group !== userBloodGroup) || [];
      
      setYourRequestCount(yourRequests.length);
      setOtherRequestCount(otherRequests.length);
      
      const filteredData = selectedTab === 'your' ? yourRequests : otherRequests;
      setNotifications(filteredData);
    } catch (err) {
      console.error('Error fetching notifications:', err);
      setError('Failed to load notifications');
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = async (notificationId: string) => {
    try {
      const { error: updateError } = await supabase
        .from('notifications')
        .update({ status: 'accepted' })
        .eq('id', notificationId);

      if (updateError) throw updateError;

      // Update local state
      setNotifications(current =>
        current.filter(notification => notification.id !== notificationId)
      );
    } catch (err) {
      console.error('Error accepting notification:', err);
      alert('Failed to accept notification');
    }
  };

  const handleViewDetails = (notification: Notification) => {
    router.push({
      pathname: '/notification-details',
      params: {
        id: notification.id,
        name: notification.name,
        blood_group: notification.blood_group,
        units: notification.units.toString(),
        location: notification.location,
        distance: notification.distance,
        address: notification.address || 'Address not available'
      }
    });
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <ActivityIndicator size="large" color="#E32636" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Notification</Text>
        <View style={styles.placeholder} />
      </View>

      <View style={styles.tabContainer}>
        <TouchableOpacity 
          style={[styles.tabButton, selectedTab === 'your' && styles.activeTab]}
          onPress={() => setSelectedTab('your')}
        >
          <Text style={[styles.tabText, selectedTab === 'your' && styles.activeTabText]}>Your Blood Group</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.tabButton, selectedTab === 'other' && styles.activeTab]}
          onPress={() => setSelectedTab('other')}
        >
          <Text style={[styles.tabText, selectedTab === 'other' && styles.activeTabText]}>Other Blood Group</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.notificationList}>
        {notifications.length === 0 ? (
          <Text style={styles.noDataText}>No notifications available</Text>
        ) : (
          notifications.map((notification) => (
            <View key={notification.id} style={styles.notificationCard}>
              <View style={styles.userInfo}>
                <Image
                  source={require('../assets/images/donor-guide.png')}
                  style={styles.userAvatar}
                />
                <View style={styles.userDetails}>
                  <View style={styles.nameAndButtonContainer}>
                    <View>
                      <Text style={styles.userName}>{notification.name || 'Anonymous'}</Text>
                      <Text style={styles.userLocation}>{notification.distance} km away</Text>
                    </View>
                    <TouchableOpacity 
                      style={styles.viewButton}
                      onPress={() => handleViewDetails(notification)}
                    >
                      <Text style={styles.viewButtonText}>View details</Text>
                    </TouchableOpacity>
                  </View>
                  <Text style={styles.bloodInfo}>
                    Blood Group: {notification.blood_group}
                    <Text style={styles.unitText}> Units: {notification.units}</Text>
                  </Text>
                  <Text style={styles.hospitalName}>{notification.location}</Text>
                  <Text style={styles.address}>{notification.address || 'Address not available'}</Text>
                  <View style={styles.dateAndButtonsContainer}>
                    <Text style={styles.dateText}>
                      {new Date(notification.created_at).toLocaleDateString('en-US', { 
                        weekday: 'long', 
                        month: 'short', 
                        day: 'numeric' 
                      })}
                    </Text>
                    <View style={styles.buttonContainer}>
                      <TouchableOpacity 
                        style={styles.acceptButton}
                        onPress={() => handleAccept(notification.id)}
                      >
                        <Text style={styles.acceptButtonText}>Accept</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              </View>
            </View>
          ))
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 55,
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
  tabContainer: {
    flexDirection: 'row',
    // backgroundColor: '#fff',
    padding: 66,
    paddingBottom: 20,
    gap: 10
  },
  tabButton: {
    width: 95,
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E32636',
    alignItems: 'center',
  },
  activeTab: {
    backgroundColor: '#E32636',
  },
  tabText: {
    color: '#E32636',
    fontSize: 12,
    fontWeight: '500',
  },
  activeTabText: {
    color: '#fff',
  },
  notificationList: {
    flex: 1,
    padding: 16,
  },
  notificationCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    paddingBottom: 0,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  userInfo: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  userAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
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
  userLocation: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  bloodInfo: {
    fontSize: 14,
    color: '#E32636',
    fontWeight: '500',
    marginBottom: 8,
  },
  unitText: {
    marginLeft: 16,
  },
  hospitalName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#000',
    marginBottom: 4,
  },
  address: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
  },
  buttonContainer: {
    flexDirection: 'column',
    gap: 8,
    marginLeft: 12,
  },
  dateAndButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8
  },
  nameAndButtonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8
  },
  buttonContainerRow: {
    flexDirection: 'row',
    gap: 8
  },
  viewButton: {
    backgroundColor: '#fff',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E32636'
  },
  viewButtonText: {
    color: '#E32636',
    fontSize: 14,
    fontWeight: '500'
  },
  acceptButton: {
    backgroundColor: '#E32636',
    paddingVertical: 8,
    paddingHorizontal: 26,
    borderRadius: 8,
    alignItems: 'center'
  },
  acceptButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500'
  },
  dateText: {
    fontSize: 16,
    color: '#000',
    fontWeight: 500,
  },
  errorText: {
    color: '#E32636',
    fontSize: 16,
    textAlign: 'center',
    padding: 20,
    lineHeight: 24,
    fontWeight: '500',
    backgroundColor: '#FFF5F5',
    borderRadius: 12,
    margin: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  noDataText: {
    color: '#666',
    fontSize: 16,
    textAlign: 'center',
    padding: 20
  }
});