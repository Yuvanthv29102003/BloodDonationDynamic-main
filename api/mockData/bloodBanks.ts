export interface BloodBank {
  id: string;
  name: string;
  location: string;
  latitude: number;
  longitude: number;
  contact: string;
  email: string;
  inventory: {
    'O+': number;
    'O-': number;
    'A+': number;
    'A-': number;
    'B+': number;
    'B-': number;
    'AB+': number;
    'AB-': number;
  };
  operatingHours: string;
  isOpen: boolean;
}

export const bloodBanks: BloodBank[] = [
  {
    id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    name: 'City Blood Bank',
    location: 'Bangalore',
    latitude: 12.9716,
    longitude: 77.5946,
    contact: '+91 9876543210',
    email: 'contact@citybloodbank.com',
    inventory: {
      'O+': 50,
      'O-': 20,
      'A+': 45,
      'A-': 15,
      'B+': 40,
      'B-': 18,
      'AB+': 25,
      'AB-': 12
    },
    operatingHours: '24/7',
    isOpen: true
  },
  {
    id: 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12',
    name: 'Central Blood Center',
    location: 'Bangalore',
    latitude: 12.9782,
    longitude: 77.6408,
    contact: '+91 9876543211',
    email: 'info@centralblood.com',
    inventory: {
      'O+': 35,
      'O-': 15,
      'A+': 30,
      'A-': 12,
      'B+': 28,
      'B-': 14,
      'AB+': 20,
      'AB-': 10
    },
    operatingHours: '8:00 AM - 8:00 PM',
    isOpen: true
  },
  {
    id: 'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13',
    name: 'Life Care Blood Bank',
    location: 'Bangalore',
    latitude: 12.9342,
    longitude: 77.6092,
    contact: '+91 9876543212',
    email: 'support@lifecareblood.com',
    inventory: {
      'O+': 42,
      'O-': 18,
      'A+': 38,
      'A-': 16,
      'B+': 35,
      'B-': 15,
      'AB+': 22,
      'AB-': 11
    },
    operatingHours: '24/7',
    isOpen: true
  }
];