import { initializeApp } from 'firebase/app';
import { getDatabase, ref, onValue, off } from 'firebase/database';

// Firebase configuration - replace with your Firebase project config
const firebaseConfig = {
  apiKey: "AIzaSyCHjDVuqHfKCHkKCpXD57NMfkdhFQlX30I",
  authDomain: "esp32-fb-de877.firebaseapp.com",
  databaseURL: "https://esp32-fb-de877-default-rtdb.firebaseio.com",
  projectId: "esp32-fb-de877",
  storageBucket: "esp32-fb-de877.appspot.com",
  messagingSenderId: "498548992077",
  appId: "1:498548992077:web:56be01a24b0b8a103a8fc3"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

// Track RFID in real-time with all journey entries
export const trackRFIDInRealtime = (rfidCode, callback) => {
  console.log("Tracking RFID:", rfidCode);
  // Use a specific path structure based on the Firebase screenshot
  const rfidRef = ref(database, `rfid/logs/${rfidCode}`);
  
  // Set up real-time listener
  onValue(rfidRef, (snapshot) => {
    console.log("RFID snapshot raw:", snapshot.val());
    
    if (!snapshot.exists()) {
      console.log(`No data found for RFID ${rfidCode}`);
      callback(null);
      return;
    }
    
    // Process all entries for this RFID - based on the Firebase structure shown
    const entriesData = snapshot.val();
    const journeyEntries = [];
    
    // Iterate through all child objects of the RFID entry
    Object.keys(entriesData).forEach(entryKey => {
      // Skip non-object entries or keys that start with uppercase (likely not entry keys)
      if (typeof entriesData[entryKey] !== 'object' || !entryKey.startsWith('-')) {
        return;
      }
      
      const entry = entriesData[entryKey];
      
      // Check if entry has location and timestamp fields
      if (entry && entry.location !== undefined && entry.timestamp) {
        journeyEntries.push({
          id: entryKey,
          location: entry.location,
          timestamp: entry.timestamp,
          date: new Date(entry.timestamp)
        });
      }
    });
    
    console.log("Extracted RFID journey entries:", journeyEntries);
    
    // If no entries with the above format were found, try a direct approach
    if (journeyEntries.length === 0) {
      console.log("No standard entries found, trying direct field access");
      
      // Directly check for entries as seen in the Firebase screenshot
      for (const key in entriesData) {
        // Look for objects with timestamps and locations
        if (typeof entriesData[key] === 'object' && key.startsWith('-')) {
          const entryObj = entriesData[key];
          
          // Check for location and timestamp fields in different formats
          const location = entryObj.Location || entryObj.location;
          const timestamp = entryObj.timestamp || entryObj.Timestamp;
          
          if (location !== undefined && timestamp) {
            journeyEntries.push({
              id: key,
              location: location,
              timestamp: timestamp,
              date: new Date(timestamp)
            });
          }
        }
      }
    }
    
    // Sort entries by timestamp (newest first)
    journeyEntries.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    
    console.log("Final processed entries:", journeyEntries);
    
    callback({
      rfidCode: rfidCode,
      lastSeen: journeyEntries.length > 0 ? journeyEntries[0].timestamp : null,
      entries: journeyEntries
    });
  });

  // Return function to unsubscribe
  return () => off(rfidRef);
};

export default database; 