// Add this new function to show notifications
const fetch = require('node-fetch'); // Ensure you have node-fetch installed
async function showNotification(title, body) {
    try {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: title || 'New Notification',
          body: body || 'You have a new message',
          sound: true,
          priority: Notifications.AndroidNotificationPriority.HIGH,
          badge: 1,
        },
        trigger: null, // null means the notification is shown immediately
      });
    } catch (error) {
      console.error('Error showing notification:', error);
    }
  }
  
  // Function to send push notifications
  async function sendPushNotification(expoPushToken, title, body) {
    const message = {
      to: expoPushToken,
      sound: 'default',
      title: title,
      body: body,
      data: { someData: 'goes here' }, // Optional: Add any additional data you want to send
      priority: 'high',
    };
  
    try {
      const response = await fetch('https://exp.host/--/api/v2/push/send', {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Accept-encoding': 'gzip, deflate',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(message),
      });
  
      const data = await response.json();
      if (response.status !== 200) {
        console.error('Error sending push notification:', data);
      }
    } catch (error) {
      console.error('Error sending push notification:', error);
    }
  }
  module.exports = showNotification,sendPushNotification;