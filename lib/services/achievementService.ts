import { supabase } from '../supabase';

export interface AchievementStats {
  totalDonated: number;
  lastDonationDate: string | null;
  nextDonationDate: string | null;
  points: number;

  rating: number;
  lives_saved: number;
}

export const getAchievementStats = async (userId: string): Promise<AchievementStats> => {
  try {
    const { data: stats, error: statsError } = await supabase
      .from('donor_statistics')
      .select('donation_count, last_donation_date, next_donation_date, points, rating, lives_saved')
      .eq('donor_id', userId)
      .single();

    if (statsError) throw statsError;

    return {
      totalDonated: stats?.donation_count || 0,
      lastDonationDate: stats?.last_donation_date || null,
      nextDonationDate: stats?.next_donation_date || null,
      points: stats?.points || 0,
      rating: stats?.rating || 0,
      lives_saved: stats?.lives_saved || 0
    };
  } catch (error) {
    console.error('Error fetching achievement stats:', error);
    return {
      totalDonated: 0,
      lastDonationDate: null,
      nextDonationDate: null,
      points: 0,
      rating: 0,
      lives_saved: 0,
      totalDonated: 0,
      lastDonationDate: null,
      nextDonationDate: null,
      points: 0
    };
  }
};