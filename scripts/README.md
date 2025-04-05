# Firebase Setup Instructions

This folder contains scripts and configuration files to set up the Firebase Firestore database for the MicroGoal app.

## Setup Steps

### 1. Initial Firebase Project Setup

If you haven't already created a Firebase project:

1. Go to the [Firebase Console](https://console.firebase.google.com/)
2. Click "Add project" and follow the setup wizard
3. Once the project is created, add a web app by clicking the web icon (</>) 
4. Register the app and copy the Firebase configuration

### 2. Install Required Tools

Install the Firebase CLI:

```bash
npm install -g firebase-tools
```

Login to Firebase:

```bash
firebase login
```

Initialize Firebase in your project (if not already done):

```bash
firebase init
```

Select Firestore and other services you need.

### 3. Database Structure Setup

There are two ways to set up the database structure:

#### Option 1: Use the Script (Programmatic Setup)

This creates sample collections and documents programmatically:

1. Install dependencies:

```bash
npm install firebase-admin dotenv
```

2. Set up environment variables:

You can either:
   - Create a `.env` file in the project root with all the Firebase Admin SDK variables
   - Or use the service account file method described earlier

For the `.env` approach, make sure your `.env` file contains the following variables:

```
FIREBASE_ADMIN_TYPE=service_account
FIREBASE_ADMIN_PROJECT_ID=your_project_id
FIREBASE_ADMIN_PRIVATE_KEY_ID=your_private_key_id
FIREBASE_ADMIN_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYour Private Key Here\n-----END PRIVATE KEY-----"
FIREBASE_ADMIN_CLIENT_EMAIL=your_client_email
FIREBASE_ADMIN_CLIENT_ID=your_client_id
FIREBASE_ADMIN_AUTH_URI=https://accounts.google.com/o/oauth2/auth
FIREBASE_ADMIN_TOKEN_URI=https://oauth2.googleapis.com/token
FIREBASE_ADMIN_AUTH_PROVIDER_CERT_URL=https://www.googleapis.com/oauth2/v1/certs
FIREBASE_ADMIN_CLIENT_CERT_URL=your_client_cert_url
```

3. Run the setup script:

```bash
node scripts/setupFirestore.js
```

This script will:
- Create sample users, macro goals, micro goals, and daily progress documents
- Output the required indexes that need to be created

#### Option 2: Manual Setup

If you prefer to manually set up the collections:

1. Go to the Firebase Console > Firestore Database
2. Create the following collections:
   - `users`
   - `macroGoals`
   - `microGoals`
   - `dailyProgress`

### 4. Deploy Security Rules

Deploy the Firestore security rules:

```bash
firebase deploy --only firestore:rules
```

Or manually copy the contents of `firestore.rules` to the Rules section in the Firebase Console.

### 5. Create Indexes

Deploy the indexes:

```bash
firebase deploy --only firestore:indexes
```

Or manually create the indexes in the Firebase Console > Firestore Database > Indexes tab.

Required indexes:
- Collection: macroGoals, Fields: userId ASC, createdAt DESC
- Collection: macroGoals, Fields: userId ASC, isAntiGoal ASC
- Collection: microGoals, Fields: userId ASC, createdAt DESC
- Collection: microGoals, Fields: macroGoalId ASC, createdAt DESC
- Collection: microGoals, Fields: userId ASC, frequency ASC, createdAt DESC
- Collection: dailyProgress, Fields: userId ASC, date DESC

## Database Schema

### Users Collection
- Document ID: `userId` (Firebase Auth UID)
- Fields:
  - `uid`: String
  - `email`: String
  - `displayName`: String
  - `createdAt`: Timestamp
  - `settings`: Map (Object)

### Macro Goals Collection
- Document ID: Auto-generated
- Fields:
  - `userId`: String
  - `title`: String
  - `description`: String (optional)
  - `isAntiGoal`: Boolean
  - `color`: String (optional)
  - `createdAt`: Timestamp
  - `updatedAt`: Timestamp
  - `totalXP`: Number
  - `targetXP`: Number (optional)

### Micro Goals Collection
- Document ID: Auto-generated
- Fields:
  - `userId`: String
  - `macroGoalId`: String
  - `title`: String
  - `frequency`: String ('daily', 'weekdays', 'weekends', 'custom')
  - `customDays`: Array<String> (only for 'custom' frequency)
  - `xpValue`: Number
  - `streak`: Number
  - `lastCompleted`: Timestamp (null initially)
  - `createdAt`: Timestamp
  - `updatedAt`: Timestamp
  - `isArchived`: Boolean
  - `completed`: Boolean

### Daily Progress Collection
- Document ID: Auto-generated
- Fields:
  - `userId`: String
  - `date`: Timestamp
  - `reflectionNote`: String (optional)
  - `completedMicroGoalIds`: Array<String>
  - `dailyXP`: Number
