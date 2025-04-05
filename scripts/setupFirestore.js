/**
 * This script sets up the Firestore database structure for the MicroGoal app
 * It creates collections, sample documents, and necessary indexes
 * 
 * To run:
 * 1. Install dependencies: npm install firebase-admin dotenv
 * 2. Make sure your .env file is set up with Firebase Admin SDK credentials
 * 3. Run: node scripts/setupFirestore.js
 */

// Load environment variables
require('dotenv').config();

// Import Firebase Admin SDK
const admin = require('firebase-admin');

// Create a service account from environment variables
const serviceAccount = {
  type: process.env.FIREBASE_ADMIN_TYPE,
  project_id: process.env.FIREBASE_ADMIN_PROJECT_ID,
  private_key_id: process.env.FIREBASE_ADMIN_PRIVATE_KEY_ID,
  private_key: process.env.FIREBASE_ADMIN_PRIVATE_KEY,
  client_email: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
  client_id: process.env.FIREBASE_ADMIN_CLIENT_ID,
  auth_uri: process.env.FIREBASE_ADMIN_AUTH_URI,
  token_uri: process.env.FIREBASE_ADMIN_TOKEN_URI,
  auth_provider_x509_cert_url: process.env.FIREBASE_ADMIN_AUTH_PROVIDER_CERT_URL,
  client_x509_cert_url: process.env.FIREBASE_ADMIN_CLIENT_CERT_URL
};

// Initialize Firebase Admin with service account credentials
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

// Get Firestore database reference
const db = admin.firestore();

/**
 * Create sample data structures for the collections
 */
async function setupFirestore() {
  try {
    console.log('Starting Firestore setup...');
    
    // Sample user ID - replace with actual user ID when testing with real authentication
    // For testing purposes only
    const sampleUserId = 'sample_user_1';
    
    // 1. Create a sample user
    await db.collection('users').doc(sampleUserId).set({
      uid: sampleUserId,
      email: 'sample@example.com',
      displayName: 'Sample User',
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      settings: {
        theme: 'light'
      }
    });
    console.log('Created sample user');
    
    // 2. Create sample macro goals
    const macroGoalId1 = 'sample_macro_1';
    await db.collection('macroGoals').doc(macroGoalId1).set({
      userId: sampleUserId,
      title: 'Get Fit',
      description: 'Improve overall fitness and health',
      isAntiGoal: false,
      color: '#4CAF50', // Green
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      totalXP: 0,
      targetXP: 1000
    });
    
    const macroGoalId2 = 'sample_macro_2';
    await db.collection('macroGoals').doc(macroGoalId2).set({
      userId: sampleUserId,
      title: 'Learn Programming',
      description: 'Become proficient in JavaScript and React Native',
      isAntiGoal: false,
      color: '#2196F3', // Blue
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      totalXP: 0,
      targetXP: 1500
    });
    
    const macroGoalId3 = 'sample_macro_3';
    await db.collection('macroGoals').doc(macroGoalId3).set({
      userId: sampleUserId,
      title: 'Stop Procrastinating',
      description: 'Reduce time wasted on distractions',
      isAntiGoal: true,
      color: '#F44336', // Red
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      totalXP: 0,
      targetXP: 800
    });
    console.log('Created sample macro goals');
    
    // 3. Create sample micro goals
    await db.collection('microGoals').doc('sample_micro_1').set({
      userId: sampleUserId,
      macroGoalId: macroGoalId1,
      title: 'Exercise for 30 minutes',
      frequency: 'daily',
      customDays: null,
      xpValue: 10,
      streak: 3,
      lastCompleted: new Date(),
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      isArchived: false,
      completed: true
    });
    
    await db.collection('microGoals').doc('sample_micro_2').set({
      userId: sampleUserId,
      macroGoalId: macroGoalId1,
      title: 'Drink 8 glasses of water',
      frequency: 'daily',
      customDays: null,
      xpValue: 5,
      streak: 5,
      lastCompleted: new Date(),
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      isArchived: false,
      completed: true
    });
    
    await db.collection('microGoals').doc('sample_micro_3').set({
      userId: sampleUserId,
      macroGoalId: macroGoalId2,
      title: 'Code for 1 hour',
      frequency: 'weekdays',
      customDays: null,
      xpValue: 15,
      streak: 2,
      lastCompleted: new Date(),
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      isArchived: false,
      completed: false
    });
    
    await db.collection('microGoals').doc('sample_micro_4').set({
      userId: sampleUserId,
      macroGoalId: macroGoalId3,
      title: 'No social media after 9pm',
      frequency: 'custom',
      customDays: ['monday', 'wednesday', 'friday'],
      xpValue: 20,
      streak: 0,
      lastCompleted: null,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      isArchived: false,
      completed: false
    });
    console.log('Created sample micro goals');
    
    // 4. Create a sample daily progress entry
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    await db.collection('dailyProgress').doc('sample_progress_1').set({
      userId: sampleUserId,
      date: today,
      reflectionNote: 'Had a productive day, managed to complete most of my goals!',
      completedMicroGoalIds: ['sample_micro_1', 'sample_micro_2'],
      dailyXP: 15
    });
    console.log('Created sample daily progress');
    
    console.log('Firestore setup complete!');
    console.log('\nNOTE: You still need to set up the following manually in the Firebase console:');
    console.log('1. Indexes (see below)');
    console.log('2. Security rules');
    
    console.log('\nRequired Indexes:');
    console.log('- Collection: macroGoals, Fields: userId ASC, createdAt DESC');
    console.log('- Collection: macroGoals, Fields: userId ASC, isAntiGoal ASC');
    console.log('- Collection: microGoals, Fields: userId ASC, createdAt DESC');
    console.log('- Collection: microGoals, Fields: macroGoalId ASC, createdAt DESC');
    console.log('- Collection: microGoals, Fields: userId ASC, frequency ASC, createdAt DESC');
    console.log('- Collection: dailyProgress, Fields: userId ASC, date DESC');
    
  } catch (error) {
    console.error('Error setting up Firestore:', error);
  }
}

// Run the setup
setupFirestore();
