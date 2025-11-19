# LastBite 🍽️

**Save Food, Share Love**

LastBite is a mobile app that connects food givers with food seekers to reduce food waste in Munich. Swipe through available food items nearby, request what you need, and help build a more sustainable community.

![LastBite App Icon](./assets/icon.png)

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
- 📍 **Munich-Based** - Focused on the Munich area with district tagging
- 💬 **In-App Messaging** - Real-time chat for coordination
- 🔔 **Notification Badges** - Stay updated on pending requests
- ⚙️ **Settings** - Control notifications, location, and privacy
- 🏆 **Achievements** - Coming soon - track your impact

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
   git clone https://github.com/jayepraveen999/lastbite.git
   cd lastbite
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

## 📱 Tech Stack

- **Framework**: React Native with Expo
- **Navigation**: React Navigation
- **Backend**: Firebase (Authentication, Firestore, Storage)
- **UI Components**: Custom components with Lucide React Native icons
- **Gestures**: React Native Gesture Handler & Reanimated
- **Location**: Expo Location
- **Image Picker**: Expo Image Picker

## 🗂️ Project Structure

```
lastbite/
├── src/
│   ├── components/          # Reusable UI components
│   │   ├── FoodCard.js     # Swipeable food card
│   │   └── SwipeDeck.js    # Swipe deck container
│   ├── constants/          # Theme and constants
│   │   └── theme.js        # Colors, spacing, fonts
│   ├── navigation/         # Navigation configuration
│   │   └── AppNavigator.js # Main navigation setup
│   ├── screens/            # App screens
│   │   ├── LoginScreen.js
│   │   ├── SignupScreen.js
│   │   ├── HomeScreen.js
│   │   ├── AddFoodScreen.js
│   │   ├── MyListingsScreen.js
│   │   ├── MyPickupsScreen.js
│   │   ├── ChatListScreen.js
│   │   ├── RequestChatScreen.js
│   │   ├── ProfileScreen.js
│   │   ├── SettingsScreen.js
│   │   └── AchievementsScreen.js
│   ├── utils/              # Utility functions
│   │   ├── locationService.js
│   │   └── usernameGenerator.js
│   └── config/             # Configuration files
│       └── firebaseConfig.js
├── assets/                 # Images and icons
├── app.json               # Expo configuration
└── package.json           # Dependencies
```

## 🔥 Firebase Setup

### Firestore Collections

**users**
```javascript
{
  uid: string,
  email: string,
  username: string,        // Anonymous username
  realName: string,        // Private
  createdAt: timestamp
}
```

**foods**
```javascript
{
  title: string,
  description: string,
  imageUrl: string,
  expiry: string,
  status: 'available' | 'reserved' | 'completed',
  location: {
    lat: number,
    lng: number,
    district: string,
    city: string
  },
  createdBy: string,       // User UID
  creatorName: string,     // Username
  createdAt: timestamp
}
```

**matches**
```javascript
{
  foodId: string,
  foodTitle: string,
  foodImage: string,
  giverId: string,
  giverUsername: string,
  seekerId: string,
  seekerUsername: string,
  status: 'interested' | 'approved' | 'rejected' | 'completed',
  createdAt: timestamp
}
```

**messages** (subcollection of matches)
```javascript
{
  senderId: string,
  text: string,
  createdAt: timestamp
}
```

### Security Rules

Update your Firestore security rules:
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read: if request.auth != null;
      allow write: if request.auth.uid == userId;
    }
    
    match /foods/{foodId} {
      allow read: if request.auth != null;
      allow create: if request.auth != null;
      allow update, delete: if request.auth.uid == resource.data.createdBy;
    }
    
    match /matches/{matchId} {
      allow read: if request.auth != null && 
        (request.auth.uid == resource.data.giverId || 
         request.auth.uid == resource.data.seekerId);
      allow create: if request.auth != null;
      allow update: if request.auth != null && 
        (request.auth.uid == resource.data.giverId || 
         request.auth.uid == resource.data.seekerId);
         
      match /messages/{messageId} {
        allow read, create: if request.auth != null;
      }
    }
  }
}
```

## 🎨 Design Philosophy

- **Privacy First**: Anonymous usernames protect user identity
- **Local Focus**: Munich-based to build strong community connections
- **Trust Building**: Pre-approval chat enables coordination and trust
- **Sustainable**: Reduce food waste while helping others

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
- [x] Achievements placeholder

### Phase 2B: Coming Soon
- [ ] Map view for food discovery
- [ ] Advanced filtering
- [ ] Push notifications
- [ ] User ratings and reviews
- [ ] Achievement system

### Phase 3: Future
- [ ] Social features
- [ ] Community impact dashboard
- [ ] Multi-city expansion
- [ ] Food waste analytics

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the MIT License.

## 📞 Support

For support, email jayepraveen999@gmail.com or open an issue in the GitHub repository.

---

**LastBite** - *Rescue food, one bite at a time* 🍽️💚
