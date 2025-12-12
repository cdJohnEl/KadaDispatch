import {
  collection,
  doc,
  addDoc,
  updateDoc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  serverTimestamp,
  onSnapshot,
  Timestamp,
  QueryConstraint,
  writeBatch,
  limit,
  startAfter,
  endBefore
} from 'firebase/firestore';
import { db } from './firebase';
import { User, Delivery, DeliveryStatus, Wallet, WalletTransaction, DriverKYC, DeliveryFeedback, ProofOfDelivery, ChatMessage, BulkDelivery, Analytics, DriverEarnings } from './types';

export const createUser = async (userData: Omit<User, 'createdAt'>) => {
  await updateDoc(doc(db, 'users', userData.uid), {
    ...userData,
    createdAt: serverTimestamp()
  });
};

export const createDelivery = async (deliveryData: Omit<Delivery, 'id' | 'createdAt' | 'updatedAt' | 'trackingHistory'>) => {
  try {
    console.log('Creating delivery with data:', deliveryData);

    // Validate required fields
    if (!deliveryData.sellerId || !deliveryData.sellerName) {
      throw new Error('Seller information is missing');
    }
    if (!deliveryData.pickupAddress || !deliveryData.dropoffAddress) {
      throw new Error('Pickup or dropoff address is missing');
    }
    if (!deliveryData.itemDetails || !deliveryData.itemDetails.name) {
      throw new Error('Item details are missing');
    }

    const docRef = await addDoc(collection(db, 'deliveries'), {
      ...deliveryData,
      trackingHistory: [{
        status: 'pending',
        timestamp: Timestamp.now()
      }],
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });

    console.log('Delivery created successfully with ID:', docRef.id);
    return docRef.id;
  } catch (error) {
    console.error('Error in createDelivery function:', error);

    // Check if it's a Firebase permission error
    if (error instanceof Error && error.message.includes('permission')) {
      throw new Error('Database permission denied. Please check your Firebase security rules.');
    }

    // Check if it's a network error
    if (error instanceof Error && error.message.includes('network')) {
      throw new Error('Network error. Please check your internet connection.');
    }

    throw new Error(`Failed to create delivery: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

export const updateDeliveryStatus = async (
  deliveryId: string,
  status: Delivery['status'],
  location?: { lat: number; lng: number }
) => {
  const deliveryRef = doc(db, 'deliveries', deliveryId);
  const delivery = await getDoc(deliveryRef);

  if (delivery.exists()) {
    const data = delivery.data() as Delivery;
    const newTrackingEntry: DeliveryStatus = {
      status,
      timestamp: Timestamp.now(),
      ...(location && { location })
    };

    await updateDoc(deliveryRef, {
      status,
      ...(location && { currentLocation: location }),
      trackingHistory: [...(data.trackingHistory || []), newTrackingEntry],
      updatedAt: serverTimestamp()
    });
  }
};

export const assignDelivery = async (deliveryId: string, driverId: string, driverName: string, driverPhone: string) => {
  try {
    console.log('Assigning delivery:', { deliveryId, driverId, driverName, driverPhone });

    await updateDoc(doc(db, 'deliveries', deliveryId), {
      driverId,
      driverName,
      driverPhone,
      status: 'assigned',
      updatedAt: serverTimestamp()
    });

    await updateDeliveryStatus(deliveryId, 'assigned');

    console.log('Delivery assigned successfully');
  } catch (error) {
    console.error('Error in assignDelivery:', error);

    // Provide more specific error messages
    if (error instanceof Error) {
      if (error.message.includes('permission')) {
        throw new Error('Permission denied. Please check Firestore security rules.');
      } else if (error.message.includes('not found')) {
        throw new Error('Delivery not found.');
      } else {
        throw new Error(`Failed to assign delivery: ${error.message}`);
      }
    }
    throw error;
  }
};

export const getUserDeliveries = (userId: string, role: 'seller' | 'driver', callback: (deliveries: Delivery[]) => void) => {
  const field = role === 'seller' ? 'sellerId' : 'driverId';
  const q = query(
    collection(db, 'deliveries'),
    where(field, '==', userId),
    orderBy('createdAt', 'desc')
  );

  return onSnapshot(q,
    (snapshot) => {
      const deliveries = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Delivery[];
      callback(deliveries);
    },
    (error) => {
      console.error('Error listening to deliveries:', error);
      // Return empty array on error instead of crashing
      callback([]);
    }
  );
};

export const getAvailableDeliveries = (callback: (deliveries: Delivery[]) => void) => {
  const q = query(
    collection(db, 'deliveries'),
    where('status', '==', 'pending'),
    orderBy('createdAt', 'desc')
  );

  return onSnapshot(q,
    (snapshot) => {
      const deliveries = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Delivery[];
      callback(deliveries);
    },
    (error) => {
      console.error('Error listening to available deliveries:', error);
      // Return empty array on error instead of crashing
      callback([]);
    }
  );
};

export const getDeliveryById = async (id: string): Promise<Delivery | null> => {
  const docSnapshot = await getDoc(doc(db, 'deliveries', id));
  if (docSnapshot.exists()) {
    return { id: docSnapshot.id, ...docSnapshot.data() } as Delivery;
  }
  return null;
};

export const listenToDelivery = (deliveryId: string, callback: (delivery: Delivery | null) => void) => {
  return onSnapshot(doc(db, 'deliveries', deliveryId), (doc) => {
    if (doc.exists()) {
      callback({ id: doc.id, ...doc.data() } as Delivery);
    } else {
      callback(null);
    }
  });
};

export const updateDriverLocation = async (driverId: string, location: { lat: number; lng: number }) => {
  // Update all active deliveries for this driver with new location
  const q = query(
    collection(db, 'deliveries'),
    where('driverId', '==', driverId),
    where('status', 'in', ['assigned', 'picked_up', 'in_transit'])
  );

  const snapshot = await getDocs(q);
  const updates = snapshot.docs.map(doc =>
    updateDoc(doc.ref, {
      currentLocation: location,
      updatedAt: serverTimestamp()
    })
  );

  await Promise.all(updates);
};

export const createBulkDeliveries = async (sellerId: string, sellerName: string, deliveries: BulkDelivery[]) => {
  const batch = writeBatch(db);
  const deliveryIds: string[] = [];

  for (const deliveryData of deliveries) {
    const docRef = doc(collection(db, 'deliveries'));
    deliveryIds.push(docRef.id);

    batch.set(docRef, {
      sellerId,
      sellerName,
      pickupAddress: deliveryData.pickupAddress,
      dropoffAddress: deliveryData.dropoffAddress,
      itemDetails: {
        name: deliveryData.itemName,
        size: deliveryData.itemSize,
        weight: deliveryData.itemWeight,
        fragile: deliveryData.fragile
      },
      paymentType: deliveryData.paymentType,
      fee: calculateDeliveryFee(5), // Mock distance
      status: 'pending',
      trackingHistory: [{
        status: 'pending',
        timestamp: Timestamp.now()
      }],
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
  }

  await batch.commit();
  return deliveryIds;
};

export const getSellerAnalytics = async (sellerId: string): Promise<Analytics> => {
  const q = query(
    collection(db, 'deliveries'),
    where('sellerId', '==', sellerId)
  );

  const snapshot = await getDocs(q);
  const deliveries = snapshot.docs.map(doc => doc.data() as Delivery);

  const totalDeliveries = deliveries.length;
  const totalSpent = deliveries.reduce((sum, d) => sum + d.fee, 0);
  const codDeliveries = deliveries.filter(d => d.paymentType === 'cod').length;
  const prepaidDeliveries = deliveries.filter(d => d.paymentType === 'prepaid').length;
  const completedDeliveries = deliveries.filter(d => d.status === 'delivered').length;
  const pendingDeliveries = deliveries.filter(d => d.status !== 'delivered').length;

  // Calculate average rating from feedback
  const ratingsQuery = query(
    collection(db, 'deliveries'),
    where('sellerId', '==', sellerId),
    where('feedback', '!=', null)
  );
  const ratingsSnapshot = await getDocs(ratingsQuery);
  const ratings = ratingsSnapshot.docs
    .map(doc => doc.data().feedback?.rating)
    .filter(rating => rating !== undefined) as number[];

  const averageRating = ratings.length > 0
    ? ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length
    : 0;

  return {
    totalDeliveries,
    totalSpent,
    codDeliveries,
    prepaidDeliveries,
    completedDeliveries,
    pendingDeliveries,
    averageRating
  };
};

export const getDriverEarnings = async (driverId: string): Promise<DriverEarnings> => {
  const now = new Date();
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startOfWeek = new Date(startOfDay);
  startOfWeek.setDate(startOfDay.getDate() - startOfDay.getDay());
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const q = query(
    collection(db, 'deliveries'),
    where('driverId', '==', driverId),
    where('status', '==', 'delivered')
  );

  const snapshot = await getDocs(q);
  const deliveries = snapshot.docs.map(doc => ({
    ...doc.data(),
    createdAt: doc.data().createdAt.toDate()
  })) as (Delivery & { createdAt: Date })[];

  const daily = deliveries
    .filter(d => d.createdAt >= startOfDay)
    .reduce((sum, d) => sum + d.fee, 0);

  const weekly = deliveries
    .filter(d => d.createdAt >= startOfWeek)
    .reduce((sum, d) => sum + d.fee, 0);

  const monthly = deliveries
    .filter(d => d.createdAt >= startOfMonth)
    .reduce((sum, d) => sum + d.fee, 0);

  const codEarnings = deliveries
    .filter(d => d.paymentType === 'cod')
    .reduce((sum, d) => sum + d.fee, 0);

  const prepaidEarnings = deliveries
    .filter(d => d.paymentType === 'prepaid')
    .reduce((sum, d) => sum + d.fee, 0);

  const totalEarnings = deliveries.reduce((sum, d) => sum + d.fee, 0);

  return {
    daily,
    weekly,
    monthly,
    codEarnings,
    prepaidEarnings,
    totalEarnings
  };
};

export const createWallet = async (userId: string) => {
  await updateDoc(doc(db, 'wallets', userId), {
    userId,
    balance: 0,
    transactions: [],
    createdAt: serverTimestamp()
  });
};

export const addWalletTransaction = async (userId: string, transaction: Omit<WalletTransaction, 'id'>) => {
  const walletRef = doc(db, 'wallets', userId);
  const walletDoc = await getDoc(walletRef);

  if (walletDoc.exists()) {
    const wallet = walletDoc.data() as Wallet;
    const newTransaction = {
      ...transaction,
      id: doc(collection(db, 'temp')).id
    };

    const newBalance = transaction.type === 'withdrawal'
      ? wallet.balance - transaction.amount
      : wallet.balance + transaction.amount;

    await updateDoc(walletRef, {
      balance: newBalance,
      transactions: [...(wallet.transactions || []), newTransaction]
    });
  }
};

export const getWallet = async (userId: string): Promise<Wallet | null> => {
  const walletDoc = await getDoc(doc(db, 'wallets', userId));
  if (walletDoc.exists()) {
    return walletDoc.data() as Wallet;
  }
  return null;
};

// NOTE: This function requires Firebase Storage (paid plan)
// Commented out since user is on free Spark plan
// If you need driver KYC verification, you can either:
// 1. Upgrade to Blaze plan and enable Storage
// 2. Modify this to store base64 encoded images in Firestore (like proof of delivery)
/*
export const submitDriverKYC = async (driverId: string, files: { idCard: File; license: File; photo: File }) => {
  const idCardRef = ref(storage, `kyc/${driverId}/id-card`);
  const licenseRef = ref(storage, `kyc/${driverId}/license`);
  const photoRef = ref(storage, `kyc/${driverId}/photo`);

  const [idCardSnapshot, licenseSnapshot, photoSnapshot] = await Promise.all([
    uploadBytes(idCardRef, files.idCard),
    uploadBytes(licenseRef, files.license),
    uploadBytes(photoRef, files.photo)
  ]);

  const [idCardUrl, licenseUrl, photoUrl] = await Promise.all([
    getDownloadURL(idCardSnapshot.ref),
    getDownloadURL(licenseSnapshot.ref),
    getDownloadURL(photoSnapshot.ref)
  ]);

  await updateDoc(doc(db, 'driverKYC', driverId), {
    driverId,
    idCardUrl,
    licenseUrl,
    photoUrl,
    verified: false,
    submittedAt: serverTimestamp()
  });
};
*/

export const uploadProofOfDelivery = async (deliveryId: string, driverId: string, dataUrl: string, type: 'signature' | 'photo') => {
  // Store proof of delivery as base64 data URL directly in Firestore (no Storage needed)
  const proofOfDelivery: ProofOfDelivery = {
    type,
    url: dataUrl, // This is now a base64 data URL instead of Storage URL
    timestamp: Timestamp.now(),
    uploadedBy: driverId
  };

  await updateDoc(doc(db, 'deliveries', deliveryId), {
    proofOfDelivery,
    updatedAt: serverTimestamp()
  });

  return dataUrl;
};

export const addDeliveryFeedback = async (deliveryId: string, feedback: Omit<DeliveryFeedback, 'timestamp'>) => {
  await updateDoc(doc(db, 'deliveries', deliveryId), {
    feedback: {
      ...feedback,
      timestamp: serverTimestamp()
    },
    updatedAt: serverTimestamp()
  });
};

export const sendChatMessage = async (deliveryId: string, message: Omit<ChatMessage, 'id' | 'timestamp'>) => {
  await addDoc(collection(db, 'deliveries', deliveryId, 'chat'), {
    ...message,
    timestamp: serverTimestamp()
  });
};

export const listenToChatMessages = (deliveryId: string, callback: (messages: ChatMessage[]) => void) => {
  const q = query(
    collection(db, 'deliveries', deliveryId, 'chat'),
    orderBy('timestamp', 'asc')
  );

  return onSnapshot(q, (snapshot) => {
    const messages = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as ChatMessage[];
    callback(messages);
  });
};

export const addFavoriteDriver = async (sellerId: string, driverId: string) => {
  const userRef = doc(db, 'users', sellerId);
  const userDoc = await getDoc(userRef);

  if (userDoc.exists()) {
    const userData = userDoc.data() as User;
    const favoriteDrivers = userData.favoriteDrivers || [];

    if (!favoriteDrivers.includes(driverId)) {
      await updateDoc(userRef, {
        favoriteDrivers: [...favoriteDrivers, driverId]
      });
    }
  }
};

export const removeFavoriteDriver = async (sellerId: string, driverId: string) => {
  const userRef = doc(db, 'users', sellerId);
  const userDoc = await getDoc(userRef);

  if (userDoc.exists()) {
    const userData = userDoc.data() as User;
    const favoriteDrivers = userData.favoriteDrivers || [];

    await updateDoc(userRef, {
      favoriteDrivers: favoriteDrivers.filter(id => id !== driverId)
    });
  }
};

export const calculateDeliveryFee = (distance: number): number => {
  // Updated pricing formula
  // Base fee: ₦1000
  // Distance: ₦50 per km
  // Note: Weight and fragility are added in the wallet.ts version
  // This simplified version is kept for backward compatibility
  const BASE_RATE = 1000; // Base rate in Naira
  const perKmRate = 50; // Rate per kilometer
  return Math.round(BASE_RATE + (distance * perKmRate));
};