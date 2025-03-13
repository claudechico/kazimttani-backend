const cron = require('node-cron');
const bookingsOperation = require('../Model/Booking');

// Run every hour
cron.schedule('0 * * * *', async () => {
  try {
    await bookingsOperation.processNotifications();
    console.log('Notifications processed successfully');
  } catch (error) {
    console.error('Error processing notifications:', error);
  }
});
