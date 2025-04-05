/**
 * Utility script to add a new Firestore index to firestore.indexes.json
 * 
 * To run: node scripts/add-firestore-index.js <collectionName> <field1:order> <field2:order> ...
 * Example: node scripts/add-firestore-index.js macroGoals userId:ASC createdAt:DESC
 */

const fs = require('fs');
const path = require('path');

// Path to the indexes file
const indexesFilePath = path.join(__dirname, 'firestore.indexes.json');

// Check if indexes file exists
if (!fs.existsSync(indexesFilePath)) {
  console.error(`Error: Indexes file not found at ${indexesFilePath}`);
  process.exit(1);
}

// Read command line arguments
const args = process.argv.slice(2);
if (args.length < 3) {
  console.error('Error: Insufficient arguments');
  console.error('Usage: node add-firestore-index.js <collectionName> <field1:order> <field2:order> ...');
  console.error('Example: node add-firestore-index.js macroGoals userId:ASC createdAt:DESC');
  process.exit(1);
}

const collectionName = args[0];
const fields = args.slice(1).map(fieldArg => {
  const [fieldPath, orderStr] = fieldArg.split(':');
  const order = orderStr.toUpperCase() === 'DESC' ? 'DESCENDING' : 'ASCENDING';
  return { fieldPath, order };
});

// Read existing indexes
let indexesData;
try {
  const indexesContent = fs.readFileSync(indexesFilePath, 'utf8');
  indexesData = JSON.parse(indexesContent);
} catch (error) {
  console.error(`Error reading indexes file: ${error.message}`);
  process.exit(1);
}

// Create new index
const newIndex = {
  collectionGroup: collectionName,
  queryScope: "COLLECTION",
  fields: fields
};

// Check for duplicates
const isDuplicate = indexesData.indexes.some(index => {
  if (index.collectionGroup !== newIndex.collectionGroup) return false;
  if (index.fields.length !== newIndex.fields.length) return false;
  
  // Check if all fields match
  return index.fields.every((field, i) => 
    field.fieldPath === newIndex.fields[i].fieldPath && 
    field.order === newIndex.fields[i].order
  );
});

if (isDuplicate) {
  console.log('This index already exists in the file. No changes made.');
  process.exit(0);
}

// Add new index
indexesData.indexes.push(newIndex);

// Write updated indexes back to file
try {
  fs.writeFileSync(indexesFilePath, JSON.stringify(indexesData, null, 2));
  console.log(`Successfully added index for ${collectionName} with fields:`);
  fields.forEach(field => {
    console.log(`  - ${field.fieldPath} (${field.order})`);
  });
  console.log('\nTo deploy this index, run: node scripts/deploy-firestore-indexes.js');
} catch (error) {
  console.error(`Error writing to indexes file: ${error.message}`);
  process.exit(1);
} 