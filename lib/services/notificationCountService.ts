import { supabase } from '../supabase';

export interface NotificationCount {
  total: number;
  unread: number;
  yourRequests: number;
  otherRequests: number;
}

export async function getNotificationCount(userId: string): Promise<NotificationCount> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('No user found');

    // Get user's blood group
    const { data: profile } = await supabase
      .from('profiles')
      .select('blood_group')
      .eq('user_id', user.id)
      .single();

    const userBloodGroup = profile?.blood_group;

    // Get notifications
    const { data: notifications, error } = await supabase
      .from('notifications')
      .select('id, is_read, blood_group, status')
      .neq('status', 'accepted');

    if (error) throw error;

    const total = notifications?.length || 0;
    const unread = notifications?.filter(n => !n.is_read).length || 0;
    const yourRequests = notifications?.filter(n => n.blood_group === userBloodGroup).length || 0;
    const otherRequests = notifications?.filter(n => n.blood_group !== userBloodGroup).length || 0;

    return { total, unread, yourRequests, otherRequests };
  } catch (error) {
    console.error('Error fetching notification count:', error);
    return { total: 0, unread: 0, yourRequests: 0, otherRequests: 0 };
  }
}

export async function markNotificationAsRead(notificationId: string): Promise<void> {
  try {
    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('id', notificationId);

    if (error) throw error;
  } catch (error) {
    console.error('Error marking notification as read:', error);
  }
}

export async function subscribeToNotifications(userId: string, onUpdate: (count: NotificationCount) => void): Promise<() => void> {
  try {
    const subscription = supabase
      .channel('notifications')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'notifications' },
        async () => {
          const count = await getNotificationCount(userId);
          onUpdate(count);
        }
      )
      .subscribe();

    // Initial count
    const initialCount = await getNotificationCount(userId);
    onUpdate(initialCount);

    return () => {
      subscription.unsubscribe();
    };
  } catch (error) {
    console.error('Error subscribing to notifications:', error);
    return () => {}; // Return empty cleanup function in case of error
  }
}