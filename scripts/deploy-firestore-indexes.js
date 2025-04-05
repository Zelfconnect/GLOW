/**
 * Script to deploy Firestore indexes using the Firebase CLI
 * 
 * This script will:
 * 1. Ensure Firebase CLI is installed
 * 2. Check for firestore.indexes.json file
 * 3. Deploy the indexes to your Firebase project using firebase.json
 * 
 * To run: node scripts/deploy-firestore-indexes.js
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Path to the indexes file
const indexesFilePath = path.join(__dirname, 'firestore.indexes.json');
const firebaseConfigPath = path.join(__dirname, '..', 'firebase.json');

// Check if the indexes file exists
if (!fs.existsSync(indexesFilePath)) {
  console.error('Error: firestore.indexes.json file not found!');
  console.error(`Expected at: ${indexesFilePath}`);
  process.exit(1);
}

// Check if firebase.json exists
if (!fs.existsSync(firebaseConfigPath)) {
  console.error('Error: firebase.json file not found!');
  console.error(`Expected at: ${firebaseConfigPath}`);
  process.exit(1);
}

// Function to check if Firebase CLI is installed
function checkFirebaseCLI() {
  try {
    const output = execSync('firebase --version', { encoding: 'utf8' });
    console.log(`Firebase CLI is installed: ${output.trim()}`);
    return true;
  } catch (error) {
    console.error('Firebase CLI is not installed.');
    console.error('Please install it by running: npm install -g firebase-tools');
    return false;
  }
}

// Function to deploy the indexes
function deployIndexes() {
  try {
    console.log('Deploying Firestore indexes...');
    console.log(`Using indexes from: ${indexesFilePath}`);
    
    // Check if user is logged in to Firebase
    try {
      execSync('firebase projects:list', { encoding: 'utf8' });
    } catch (error) {
      console.log('You need to login to Firebase first.');
      execSync('firebase login', { stdio: 'inherit' });
    }
    
    // Deploy only the Firestore indexes
    console.log('Running deployment command...');
    execSync('firebase deploy --only firestore:indexes', { 
      encoding: 'utf8',
      stdio: 'inherit'
    });
    
    console.log('Deployment complete!');
    return true;
  } catch (error) {
    console.error('Error deploying indexes:', error.message);
    return false;
  }
}

// Main execution
console.log('===== Firestore Indexes Deployment =====');

if (checkFirebaseCLI()) {
  deployIndexes();
} else {
  process.exit(1);
} 