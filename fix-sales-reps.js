// This script fixes sales reps by setting them as active
const { initializeApp } = require('firebase/app');
const { 
  getFirestore, 
  collection, 
  query, 
  where, 
  getDocs, 
  updateDoc,
  doc
} = require('firebase/firestore');

// Your Firebase configuration - update with your actual Firebase config
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_AUTH_DOMAIN",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_STORAGE_BUCKET",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function fixSalesReps() {
  try {
    // Get all sales reps
    const salesRepsQuery = query(
      collection(db, 'users'),
      where('role', '==', 'sales_rep')
    );
    
    const salesRepsSnapshot = await getDocs(salesRepsQuery);
    
    if (salesRepsSnapshot.empty) {
      console.log('No sales reps found');
      return;
    }
    
    console.log(`Found ${salesRepsSnapshot.size} sales reps`);
    
    // Update each sales rep to make them active
    const updatePromises = salesRepsSnapshot.docs.map(async (salesRepDoc) => {
      const salesRepId = salesRepDoc.id;
      const salesRepData = salesRepDoc.data();
      
      console.log(`Updating sales rep: ${salesRepData.name || salesRepId}`);
      
      return updateDoc(doc(db, 'users', salesRepId), {
        active: true
      });
    });
    
    await Promise.all(updatePromises);
    console.log('All sales reps have been set to active');
    
  } catch (error) {
    console.error('Error fixing sales reps:', error);
  }
}

// Run the function
fixSalesReps().then(() => console.log('Done'));