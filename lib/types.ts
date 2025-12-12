import { Timestamp } from 'firebase/firestore';

export type UserRole = 'seller' | 'driver' | 'admin';

export interface User {
  uid: string;
  role: UserRole;
  name: string;
  email: string;
  phone: string;
  vehicleInfo?: string;
  rating?: number;
  online?: boolean;
  verified?: boolean;
  preferredZones?: string[];
  favoriteDrivers?: string[];
  createdAt: Timestamp;
}

export interface ItemDetails {
  name: string;
  size: string;
  weight: number;
  fragile: boolean;
}

export interface DeliveryStatus {
  status: 'pending' | 'assigned' | 'picked_up' | 'in_transit' | 'delivered';
  location?: { lat: number; lng: number };
  timestamp: Timestamp;
}

export interface Delivery {
  id: string;
  sellerId: string;
  driverId?: string;
  sellerName: string;
  driverName?: string;
  driverPhone?: string;
  pickupAddress: string;
  dropoffAddress: string;
  itemDetails: ItemDetails;
  paymentType: 'prepaid' | 'cod';
  fee: number;
  status: 'pending' | 'assigned' | 'picked_up' | 'in_transit' | 'delivered';
  currentLocation?: { lat: number; lng: number };
  createdAt: Timestamp;
  updatedAt: Timestamp;
  trackingHistory: DeliveryStatus[];
  feedback?: DeliveryFeedback;
  proofOfDelivery?: ProofOfDelivery;
}

export interface TrackingUpdate {
  id: string;
  deliveryId: string;
  status: string;
  location: { lat: number; lng: number };
  timestamp: Timestamp;
  notes?: string;
}

export interface Wallet {
  userId: string;
  balance: number;
  transactions: WalletTransaction[];
}

export interface WalletTransaction {
  id: string;
  type: 'deposit' | 'withdrawal' | 'cod_settlement' | 'earning';
  amount: number;
  description: string;
  timestamp: Timestamp;
  deliveryId?: string;
}

export interface DriverKYC {
  driverId: string;
  idCardUrl: string;
  licenseUrl: string;
  photoUrl: string;
  verified: boolean;
  submittedAt: Timestamp;
  verifiedAt?: Timestamp;
  verifiedBy?: string;
}

export interface DeliveryFeedback {
  rating: number;
  comment: string;
  givenBy: 'customer' | 'seller';
  timestamp: Timestamp;
}

export interface ProofOfDelivery {
  type: 'signature' | 'photo';
  url: string;
  timestamp: Timestamp;
  uploadedBy: string;
}

export interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  senderRole: UserRole;
  message: string;
  imageUrl?: string;
  timestamp: Timestamp;
}

export interface BulkDelivery {
  pickupAddress: string;
  dropoffAddress: string;
  itemName: string;
  itemSize: string;
  itemWeight: number;
  fragile: boolean;
  paymentType: 'prepaid' | 'cod';
}

export interface Analytics {
  totalDeliveries: number;
  totalSpent: number;
  codDeliveries: number;
  prepaidDeliveries: number;
  completedDeliveries: number;
  pendingDeliveries: number;
  averageRating: number;
}

export interface DriverEarnings {
  daily: number;
  weekly: number;
  monthly: number;
  codEarnings: number;
  prepaidEarnings: number;
  totalEarnings: number;
}