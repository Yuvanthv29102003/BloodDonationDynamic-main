import { BloodBank, bloodBanks } from '../mockData/bloodBanks';

export interface BloodBankSearchParams {
  bloodGroup?: string;
  location?: string;
  latitude?: number;
  longitude?: number;
  radius?: number; // in kilometers
}

export class BloodBankService {
  private static calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371; // Earth's radius in kilometers
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  }

  static getAllBloodBanks(): BloodBank[] {
    return bloodBanks;
  }

  static searchBloodBanks(params: BloodBankSearchParams): BloodBank[] {
    let filteredBanks = [...bloodBanks];

    if (params.bloodGroup) {
      filteredBanks = filteredBanks.filter(bank => 
        bank.inventory[params.bloodGroup as keyof typeof bank.inventory] > 0
      );
    }

    if (params.location) {
      filteredBanks = filteredBanks.filter(bank =>
        bank.location.toLowerCase().includes(params.location!.toLowerCase())
      );
    }

    if (params.latitude && params.longitude) {
      const maxDistance = params.radius || 10; // Default 10km radius
      filteredBanks = filteredBanks.filter(bank => {
        const distance = this.calculateDistance(
          params.latitude!,
          params.longitude!,
          bank.latitude,
          bank.longitude
        );
        return distance <= maxDistance;
      });

      // Sort by distance
      filteredBanks.sort((a, b) => {
        const distA = this.calculateDistance(
          params.latitude!,
          params.longitude!,
          a.latitude,
          a.longitude
        );
        const distB = this.calculateDistance(
          params.latitude!,
          params.longitude!,
          b.latitude,
          b.longitude
        );
        return distA - distB;
      });
    }

    return filteredBanks;
  }

  static getBloodBankById(id: string): BloodBank | undefined {
    return bloodBanks.find(bank => bank.id === id);
  }

  static checkBloodAvailability(bloodGroup: string, bankId?: string): {
    available: boolean;
    locations: Array<{ bankId: string; name: string; units: number }>
  } {
    const relevantBanks = bankId 
      ? bloodBanks.filter(bank => bank.id === bankId)
      : bloodBanks;

    const locations = relevantBanks
      .filter(bank => bank.inventory[bloodGroup as keyof typeof bank.inventory] > 0)
      .map(bank => ({
        bankId: bank.id,
        name: bank.name,
        units: bank.inventory[bloodGroup as keyof typeof bank.inventory]
      }));

    return {
      available: locations.length > 0,
      locations
    };
  }
}