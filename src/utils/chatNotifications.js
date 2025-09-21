import axios from 'axios';
import { ref, update, get } from '@react-native-firebase/database';
import database from '@react-native-firebase/database';

/**
 * Send push notification to driver when user sends a message
 * @param {string} messageText - The message content
 * @param {object} driverData - Driver information
 * @param {string} requestId - Ride request ID
 * @param {object} currentUser - Current user data
 */
export const sendNotificationToDriver = async (messageText, driverData, requestId, currentUser) => {
  try {
    // Increment driver's unread count
    if (driverData?.documentId) {
      const driverUnreadRef = ref(database(), `drivers/${driverData.documentId}/unreadCount`);
      const driverSnapshot = await get(driverUnreadRef);
      const currentCount = driverSnapshot.val() || 0;
      
      await update(ref(database(), `drivers/${driverData.documentId}`), {
        unreadCount: currentCount + 1
      });
    }

    // Send push notification
    const ONESIGNAL_DRIVER_APP_ID = process.env.ONESIGNAL_DRIVER_APP_ID;
    const ONESIGNAL_DRIVER_APP_API_KEY = process.env.ONESIGNAL_DRIVER_APP_API_KEY;

    if (ONESIGNAL_DRIVER_APP_ID && ONESIGNAL_DRIVER_APP_API_KEY && driverData?.id) {
      const notificationPayload = {
        app_id: ONESIGNAL_DRIVER_APP_ID,
        include_aliases: { external_id: [String(driverData.id)] },
        target_channel: "push",
        headings: { en: `Message from ${currentUser?.firstName || 'User'}` },
        contents: { en: messageText },
        data: { 
          type: "chat_message", 
          requestId, 
          senderId: currentUser?.id || currentUser?.documentId,
          senderName: currentUser?.firstName || 'User'
        }
      };

      await axios.post('https://onesignal.com/api/v1/notifications', notificationPayload, {
        headers: {
          'Authorization': `Basic ${ONESIGNAL_DRIVER_APP_API_KEY}`,
          'Content-Type': 'application/json'
        }
      });

      console.log('Push notification sent to driver successfully');
    } else {
      console.log('OneSignal configuration missing or incomplete');
    }
  } catch (error) {
    console.error('Error sending notification to driver:', error);
    // Silent fail for notifications - don't throw error to user
  }
};

/**
 * Send push notification to user when driver sends a message
 * @param {string} messageText - The message content
 * @param {object} userData - User information
 * @param {string} requestId - Ride request ID
 * @param {object} driverData - Driver data
 */
export const sendNotificationToUser = async (messageText, userData, requestId, driverData) => {
  try {
    // Increment user's unread count
    if (userData?.documentId) {
      const userUnreadRef = ref(database(), `users/${userData.documentId}/unreadCount`);
      const userSnapshot = await get(userUnreadRef);
      const currentCount = userSnapshot.val() || 0;
      
      await update(ref(database(), `users/${userData.documentId}`), {
        unreadCount: currentCount + 1
      });
    }

    // Send push notification
    const ONESIGNAL_USER_APP_ID = process.env.ONESIGNAL_USER_APP_ID;
    const ONESIGNAL_USER_APP_API_KEY = process.env.ONESIGNAL_USER_APP_API_KEY;

    if (ONESIGNAL_USER_APP_ID && ONESIGNAL_USER_APP_API_KEY && userData?.id) {
      const notificationPayload = {
        app_id: ONESIGNAL_USER_APP_ID,
        include_aliases: { external_id: [String(userData.id)] },
        target_channel: "push",
        headings: { en: `Message from ${driverData?.firstName || 'Driver'}` },
        contents: { en: messageText },
        data: { 
          type: "chat_message", 
          requestId, 
          senderId: driverData?.id || driverData?.documentId,
          senderName: driverData?.firstName || 'Driver'
        }
      };

      await axios.post('https://onesignal.com/api/v1/notifications', notificationPayload, {
        headers: {
          'Authorization': `Basic ${ONESIGNAL_USER_APP_API_KEY}`,
          'Content-Type': 'application/json'
        }
      });

      console.log('Push notification sent to user successfully');
    } else {
      console.log('OneSignal configuration missing or incomplete');
    }
  } catch (error) {
    console.error('Error sending notification to user:', error);
    // Silent fail for notifications - don't throw error to user
  }
};

/**
 * Reset unread count for a user or driver
 * @param {string} userType - 'user' or 'driver'
 * @param {string} documentId - User/Driver document ID
 */
export const resetUnreadCount = async (userType, documentId) => {
  try {
    if (!documentId) return;
    
    const path = userType === 'driver' ? `drivers/${documentId}` : `users/${documentId}`;
    await update(ref(database(), path), {
      unreadCount: 0
    });
    
    console.log(`Unread count reset for ${userType}:`, documentId);
  } catch (error) {
    console.error('Error resetting unread count:', error);
  }
};

/**
 * Get current unread count for a user or driver
 * @param {string} userType - 'user' or 'driver'
 * @param {string} documentId - User/Driver document ID
 * @returns {Promise<number>} Current unread count
 */
export const getUnreadCount = async (userType, documentId) => {
  try {
    if (!documentId) return 0;
    
    const path = userType === 'driver' ? `drivers/${documentId}/unreadCount` : `users/${documentId}/unreadCount`;
    const snapshot = await get(ref(database(), path));
    return snapshot.val() || 0;
  } catch (error) {
    console.error('Error getting unread count:', error);
    return 0;
  }
};

/**
 * Listen to unread count changes
 * @param {string} userType - 'user' or 'driver'
 * @param {string} documentId - User/Driver document ID
 * @param {function} callback - Callback function to handle count changes
 * @returns {function} Cleanup function to remove listener
 */
export const listenToUnreadCount = (userType, documentId, callback) => {
  if (!documentId) return () => {};
  
  const path = userType === 'driver' ? `drivers/${documentId}/unreadCount` : `users/${documentId}/unreadCount`;
  const unreadRef = ref(database(), path);
  
  const handleUnreadCount = (snapshot) => {
    const count = snapshot.val() || 0;
    callback(count);
  };

  onValue(unreadRef, handleUnreadCount);

  // Return cleanup function
  return () => {
    off(unreadRef, 'value', handleUnreadCount);
  };
};
