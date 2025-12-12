import { doc, updateDoc, getDoc, setDoc, serverTimestamp, Timestamp } from 'firebase/firestore';
import { db } from './firebase';
import { Wallet, WalletTransaction } from './types';

/**
 * Initialize a wallet for a new driver
 */
export const initializeWallet = async (userId: string) => {
    const walletRef = doc(db, 'wallets', userId);

    await setDoc(walletRef, {
        userId,
        balance: 0,
        transactions: [],
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
    });
};

/**
 * Add earnings to driver wallet
 */
export const addEarnings = async (
    userId: string,
    amount: number,
    deliveryId: string,
    type: 'earning' | 'cod_settlement'
) => {
    const walletRef = doc(db, 'wallets', userId);
    const walletDoc = await getDoc(walletRef);

    if (!walletDoc.exists()) {
        // Create wallet if it doesn't exist
        await initializeWallet(userId);
    }

    const wallet = walletDoc.exists() ? walletDoc.data() as Wallet : { balance: 0, transactions: [] };

    const newTransaction: WalletTransaction = {
        id: `txn_${Date.now()}`,
        type,
        amount,
        description: type === 'cod_settlement'
            ? `COD Collection - Delivery #${deliveryId.slice(0, 8)}`
            : `Delivery Fee - Delivery #${deliveryId.slice(0, 8)}`,
        timestamp: Timestamp.now(),
        deliveryId
    };

    const newBalance = wallet.balance + amount;
    const updatedTransactions = [...(wallet.transactions || []), newTransaction];

    await updateDoc(walletRef, {
        balance: newBalance,
        transactions: updatedTransactions,
        updatedAt: serverTimestamp()
    });

    return newBalance;
};

/**
 * Get wallet balance
 */
export const getWalletBalance = async (userId: string): Promise<number> => {
    const walletDoc = await getDoc(doc(db, 'wallets', userId));

    if (!walletDoc.exists()) {
        return 0;
    }

    const wallet = walletDoc.data() as Wallet;
    return wallet.balance || 0;
};

/**
 * Get transaction history
 */
export const getTransactionHistory = async (userId: string): Promise<WalletTransaction[]> => {
    const walletDoc = await getDoc(doc(db, 'wallets', userId));

    if (!walletDoc.exists()) {
        return [];
    }

    const wallet = walletDoc.data() as Wallet;
    return wallet.transactions || [];
};

/**
 * Calculate delivery fee based on distance, weight, and fragility
 * Using updated pricing: ₦1000 base + surcharges
 */
export const calculateDeliveryFee = (
    distance: number,    // in kilometers
    weight: number,      // in kilograms
    fragile: boolean,
    paymentType: 'prepaid' | 'cod'
): number => {
    const BASE_FEE = 1000;              // ₦1000 base (updated from ₦500)
    const PER_KM_RATE = 50;             // ₦50 per km
    const PER_KG_RATE = 30;             // ₦30 per kg
    const FRAGILE_SURCHARGE = 300;      // ₦300 for fragile items
    const COD_FEE_PERCENT = 0.02;       // 2% for COD

    let fee = BASE_FEE;

    // Add distance charge
    fee += distance * PER_KM_RATE;

    // Add weight charge
    fee += weight * PER_KG_RATE;

    // Add fragile surcharge
    if (fragile) {
        fee += FRAGILE_SURCHARGE;
    }

    // Add COD fee (percentage of total)
    if (paymentType === 'cod') {
        fee += fee * COD_FEE_PERCENT;
    }

    return Math.round(fee);
};

/**
 * Calculate distance between two coordinates using Haversine formula
 * Returns distance in kilometers
 */
export const calculateDistance = (
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
): number => {
    const R = 6371; // Earth's radius in kilometers

    const dLat = toRadians(lat2 - lat1);
    const dLon = toRadians(lon2 - lon1);

    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;

    return Math.round(distance * 10) / 10; // Round to 1 decimal place
};

/**
 * Convert degrees to radians
 */
const toRadians = (degrees: number): number => {
    return degrees * (Math.PI / 180);
};

/**
 * Get coordinates from address using browser Geolocation API
 * Note: This is a simplified version. For production, you'd want to use
 * a geocoding service or have users select from a map
 */
export const geocodeAddress = async (address: string): Promise<{ lat: number; lng: number } | null> => {
    // This is a placeholder. In a real app, you would:
    // 1. Use a geocoding API (Google, Mapbox, etc.)
    // 2. Or have users select location on a map
    // 3. Or use predefined zones/areas

    // For now, return null to indicate manual coordinate entry needed
    console.warn('Geocoding not implemented. Please use coordinates or implement a geocoding service.');
    return null;
};
