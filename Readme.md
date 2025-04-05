# MicroGoal

A simple habit tracker that helps you achieve your long-term goals through daily micro-actions.

## About

MicroGoal (formerly Timeguard) helps you build positive habits and avoid negative ones by connecting your daily actions to your larger life goals. Unlike complex habit trackers, MicroGoal keeps it simple: define what you want to achieve, what you want to avoid, and track your daily progress with minimal friction.

## Features

### Goal Setting
- Define up to 3 Macro Goals (what you want to achieve)
- Define up to 3 Macro Anti-Goals (what you want to avoid)
- Create simple Micro Goals (daily habits) for each macro objective
- Set custom frequencies (daily, weekdays, weekends, or custom days)

### Daily Tracking
- Simple checklist of today's Micro Goals
- Quick toggle between complete/incomplete
- Streak tracking for consistent performance
- Optional daily reflection notes

### Progress Visualization
- XP system shows progress toward Macro Goals
- Weekly progress bars for at-a-glance feedback
- Streak counters for motivation
- Achievement celebrations for milestones

### Customization
- Goal templates for quick setup
- Color coding for different goal categories
- Personalized XP values for different activities

## Getting Started

### Prerequisites
- Node.js (version 14 or higher)
- Expo CLI (`npm install -g expo-cli`)
- Expo Go app on your mobile device
- Firebase account for data storage

### Installation

1. Clone this repository
```
git clone https://github.com/yourusername/microgoal.git
cd microgoal
```

2. Install dependencies
```
npm install
```

3. Start the development server
```
expo start
```

4. Scan the QR code with the Expo Go app on your device

## Usage

1. **Initial Setup**: Choose up to 3 Macro Goals and Anti-Goals that matter to you
2. **Define Micro Goals**: Create small, actionable daily tasks that lead to your bigger goals
3. **Daily Check-in**: Mark your completed Micro Goals each day
4. **Track Progress**: Watch your XP grow as you consistently complete your goals

## Project Structure

```
microgoal/
├── assets/             # Images and static resources
├── components/         # Reusable UI components
├── screens/            # Application screens
├── services/           # Business logic and data management
├── constants/          # App constants and configuration
├── App.js              # Application entry point
└── README.md           # This file
```

## Technology Stack

### Frontend
- React Native with Expo Go
- React Navigation for screen management
- React Native Reanimated for smooth animations

### Backend
- Firebase Authentication for user management
- Firebase Firestore for data storage
- Offline support for uninterrupted goal tracking

## Roadmap

- [ ] AI coaching integration
- [ ] Advanced analytics and insights
- [ ] Social sharing and accountability features
- [ ] Custom notification scheduling
- [ ] Data export options

## Current Status (as of March 2024)

Project Implementation Status:
- ✅ Project architecture redesign 
- ✅ Firebase integration setup
- ✅ TypeScript configuration
- 🟡 User Authentication (In Progress)
- 🟡 Goal Management Features (In Progress)
- ⭕ Progress Visualization (Pending)
- ⭕ Achievement System (Pending)

Current Focus:
- Implementing goal management structure
- Building daily tracking interface
- Setting up Firebase data structure

Next Steps:
1. Complete user authentication implementation
2. Implement goal creation/management
3. Create the daily tracking interface
4. Add progress visualization components

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Built with ❤️ for those trying to make positive changes through small, consistent actions
- Inspired by atomic habits and consistency over intensity