# 🚚 KadaDispatch

**KadaDispatch** is a modern delivery management platform that seamlessly connects sellers with verified drivers for fast, secure, and affordable intra and inter-state deliveries.

[![Next.js](https://img.shields.io/badge/Next.js-14.2-black?style=flat&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.2-blue?style=flat&logo=typescript)](https://www.typescriptlang.org/)
[![Firebase](https://img.shields.io/badge/Firebase-12.3-orange?style=flat&logo=firebase)](https://firebase.google.com/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3.3-38B2AC?style=flat&logo=tailwind-css)](https://tailwindcss.com/)

---

## ✨ Features

### 👥 Multi-Role System
- **Sellers**: Create and manage delivery requests, track packages in real-time
- **Drivers**: Accept deliveries, update status, earn money with instant wallet credits
- **Admin**: Manage users, verify drivers, oversee platform operations

### 📦 Delivery Management
- **Real-time Tracking**: Live location updates during active deliveries
- **Dynamic Fee Calculation**: Based on distance, weight, and item fragility
- **Flexible Payment**: Support for prepaid and Cash-on-Delivery (COD)
- **Proof of Delivery**: Digital signatures and photo verification
- **Bulk Upload**: CSV import for multiple deliveries

### 💰 Financial Features
- **Driver Wallet System**: Automatic earnings credit upon delivery completion
- **Transaction History**: Detailed records of all wallet activities
- **COD Settlement**: Secure handling of cash-on-delivery payments

### 🔐 Security & Verification
- **Driver KYC**: ID card, license, and photo verification
- **Secure Authentication**: Firebase Authentication with role-based access
- **Firestore Security Rules**: Comprehensive data protection

### 📊 Analytics & Insights
- **Seller Dashboard**: Track spending, delivery statistics, and performance
- **Driver Earnings**: Daily, weekly, and monthly earnings breakdown
- **Rating System**: Feedback mechanism for quality assurance

### 💬 Communication
- **In-app Chat**: Real-time messaging between sellers and drivers
- **Delivery Notifications**: Status updates and alerts

---

## 🛠️ Tech Stack

### Frontend
- **Framework**: [Next.js 14](https://nextjs.org/) (App Router)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [TailwindCSS](https://tailwindcss.com/) + [shadcn/ui](https://ui.shadcn.com/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Forms**: [React Hook Form](https://react-hook-form.com/) + [Zod](https://zod.dev/)
- **State Management**: React Hooks + Firebase Hooks

### Backend & Database
- **Authentication**: [Firebase Auth](https://firebase.google.com/docs/auth)
- **Database**: [Cloud Firestore](https://firebase.google.com/docs/firestore)
- **Storage**: [Firebase Storage](https://firebase.google.com/docs/storage)
- **Real-time Updates**: Firestore Real-time Listeners

### Maps & Location
- **Maps**: Google Maps API
- **Geolocation**: Browser Geolocation API
- **Distance Calculation**: Custom implementation

### UI Components
- **Component Library**: [Radix UI](https://www.radix-ui.com/)
- **Charts**: [Recharts](https://recharts.org/)
- **Notifications**: [Sonner](https://sonner.emilkowal.ski/)
- **Date Handling**: [date-fns](https://date-fns.org/)

---

## 🚀 Getting Started

### Prerequisites
- **Node.js** 18.x or higher
- **npm** or **yarn**
- **Firebase Project** with Firestore, Auth, and Storage enabled
- **Google Maps API Key**

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/kadav2.git
   cd kadav2
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   
   Create a `.env.local` file in the root directory:
   ```env
   NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
   NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_google_maps_key
   ```

4. **Set up Firebase**
   
   - Create a Firebase project at [Firebase Console](https://console.firebase.google.com/)
   - Enable Authentication (Email/Password)
   - Create a Firestore database
   - Enable Firebase Storage
   - Deploy Firestore security rules:
     ```bash
     firebase deploy --only firestore:rules
     ```
   - Deploy Firestore indexes:
     ```bash
     firebase deploy --only firestore:indexes
     ```

5. **Run the development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**
   
   Navigate to [http://localhost:3000](http://localhost:3000)

---

## 📁 Project Structure

```
kadav2/
├── app/                      # Next.js App Router pages
│   ├── admin/               # Admin dashboard
│   ├── auth/                # Authentication pages
│   ├── driver/              # Driver dashboard
│   ├── seller/              # Seller dashboard
│   ├── track/               # Public tracking page
│   ├── layout.tsx           # Root layout
│   └── page.tsx             # Landing page
├── components/              # React components
│   ├── auth/               # Authentication components
│   ├── driver/             # Driver-specific components
│   ├── seller/             # Seller-specific components
│   ├── tracking/           # Tracking components
│   └── ui/                 # Reusable UI components (shadcn)
├── hooks/                   # Custom React hooks
│   ├── useAuth.ts          # Authentication hook
│   ├── useGeolocation.ts   # Geolocation hook
│   └── useDriverOnlineStatus.ts
├── lib/                     # Utility libraries
│   ├── firebase.ts         # Firebase configuration
│   ├── firestore.ts        # Firestore helper functions
│   ├── types.ts            # TypeScript type definitions
│   ├── utils.ts            # Utility functions
│   └── wallet.ts           # Wallet management
├── firestore.rules          # Firestore security rules
├── firestore.indexes.json   # Firestore indexes
├── storage.rules            # Storage security rules
└── package.json
```

---

## 🎯 Usage

### For Sellers

1. **Sign Up** as a seller
2. **Create a Delivery Request**
   - Enter pickup and drop-off addresses
   - Specify item details (name, size, weight, fragility)
   - Choose payment type (Prepaid or COD)
3. **Wait for Driver Assignment**
4. **Track Delivery** in real-time
5. **Confirm Delivery** and provide feedback

### For Drivers

1. **Sign Up** as a driver
2. **Complete KYC Verification**
   - Upload ID card
   - Upload driver's license
   - Upload profile photo
3. **Go Online** to receive delivery requests
4. **Accept Deliveries** that match your schedule
5. **Update Delivery Status** (Picked Up → In Transit → Delivered)
6. **Collect Proof of Delivery** (signature or photo)
7. **Earn Money** - automatically credited to your wallet

### For Admins

1. **Access Admin Dashboard**
2. **Verify Driver KYC** submissions
3. **Monitor Platform Activity**
4. **Manage Users** and resolve issues

---

## 🔧 Available Scripts

```bash
# Development
npm run dev          # Start development server

# Production
npm run build        # Build for production
npm start            # Start production server

# Code Quality
npm run lint         # Run ESLint
npm run typecheck    # TypeScript type checking
```

---

## 🔐 Security

- **Firestore Security Rules**: Implemented to protect user data
- **Role-based Access Control**: Ensures users only access authorized resources
- **Environment Variables**: Sensitive keys stored securely
- **Driver Verification**: KYC process for driver authentication
- **Secure File Upload**: Validated and restricted file types

---

## 📊 Key Features Breakdown

### Dynamic Delivery Fee Calculation
```typescript
Base Fee: ₦1000
+ Distance-based charge
+ Weight multiplier
+ Fragility premium (if applicable)
```

### Real-time Location Tracking
- Tracks driver location only during active deliveries
- Updates every 30 seconds
- Displays route on Google Maps

### Wallet System
- Automatic credit on delivery completion
- Transaction history with filtering
- Support for deposits, withdrawals, and COD settlements

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 👨‍💻 Author

**Your Name**
- GitHub: [@yourusername](https://github.com/yourusername)
- Email: your.email@example.com

---

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/) - The React Framework
- [Firebase](https://firebase.google.com/) - Backend infrastructure
- [shadcn/ui](https://ui.shadcn.com/) - Beautiful UI components
- [Radix UI](https://www.radix-ui.com/) - Accessible component primitives
- [Lucide](https://lucide.dev/) - Icon library

---

## 📞 Support

For support, email support@kadadispatch.com or join our Slack channel.

---

<div align="center">
  <strong>Built with ❤️ for efficient delivery management</strong>
</div>
