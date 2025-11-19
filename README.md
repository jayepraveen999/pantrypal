# PantryPal 🥘

**Share Your Pantry, Build Community**

PantryPal is a mobile app that connects food givers with food seekers to reduce food waste and build stronger communities. Swipe through available food items nearby, request what you need, and help create a more sustainable future together.

![PantryPal App Icon](./assets/icon.png)

## 🌟 Features

### For Food Seekers
- **Swipe to Discover** - Browse available food items in your area with Tinder-style swiping
- **Request Food** - Send interest requests to food givers
- **Real-Time Chat** - Discuss pickup details before approval
- **Track Pickups** - View all your pending and approved food requests
- **Location-Based** - See distance to each food item

### For Food Givers
- **Easy Posting** - Share leftover food with photos and details
- **Manage Requests** - Review and approve requests from seekers
- **Chat with Seekers** - Coordinate pickup times and answer questions
- **Track Listings** - Monitor all your active, reserved, and completed listings

### Core Features
- 🔐 **Anonymous Usernames** - Privacy-first with Reddit-style usernames
- 📍 **Location-Based** - Find food items in your local area
- 💬 **In-App Messaging** - Real-time chat for coordination
- 🔔 **Notification Badges** - Stay updated on pending requests
- ⚙️ **Settings** - Control notifications, location, and privacy
- 💰 **Freemium Model** - 7-day free trial, then 10% platform fee on paid items

## 🚀 Getting Started

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn
- Expo CLI (`npm install -g expo-cli`)
- iOS Simulator (Mac) or Android Emulator
- Firebase account

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/jayepraveen999/pantrypal.git
   cd pantrypal
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up Firebase**
   - Create a Firebase project at [firebase.google.com](https://firebase.google.com)
   - Enable Authentication (Email/Password)
   - Enable Firestore Database
   - Enable Storage
   - Update `src/config/firebaseConfig.js` with your Firebase credentials

4. **Start the development server**
   ```bash
   npx expo start
   ```

5. **Run on your device**
   - Scan the QR code with Expo Go app (iOS/Android)
   - Or press `i` for iOS Simulator
   - Or press `a` for Android Emulator

## 🛣️ Roadmap

### Phase 1: MVP Core ✅
- [x] User authentication
- [x] Food posting with images
- [x] Swipe-based discovery
- [x] Basic profile

### Phase 2A: Enhanced Features ✅
- [x] Request-based matching
- [x] Real-time chat
- [x] My Listings management
- [x] My Pickups tracking
- [x] Notification badges
- [x] Settings screen
- [x] Freemium model with 7-day trial
- [x] Platform fee system (10% on paid items)

### Phase 2B: Coming Soon
- [ ] Payment integration (Stripe/PayPal)
- [ ] Map view for food discovery
- [ ] Advanced filtering
- [ ] Push notifications
- [ ] User ratings and reviews
- [ ] Achievement system

### Phase 3: Future
- [ ] Social features
- [ ] Community impact dashboard
- [ ] Multi-region expansion
- [ ] Food waste analytics
- [ ] Subscription tiers

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the MIT License.

## 📞 Support

For support, email jayepraveen999@gmail.com or open an issue in the GitHub repository.

---

**PantryPal** - *Share your pantry, build your community* 🥘💚
