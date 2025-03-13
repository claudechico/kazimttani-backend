const connection = require('./db');

const sendPushNotification = async (expoPushToken, title, body) => {
  try {
    const message = {
      to: expoPushToken,
      sound: 'default',
      title: title,
      body: body,
      data: { someData: 'goes here' },
    };
    const response = await fetch('https://exp.host/--/api/v2/push/send', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Accept-encoding': 'gzip, deflate',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(message),
    });
    return response;
  } catch (error) {
    console.error('Error sending push notification:', error);
    throw error;
  }
};

const bookingsOperation = {
  // Create a new booking
  // createBooking: (bookingData) => {
  //   return new Promise((resolve, reject) => {
  //     const query = `INSERT INTO bookings (customer_id, service_id, booking_date, booking_time) 
  //                    VALUES (?, ?, ?, ?)`;
      
  //     connection.query(
  //       query,
  //       [
  //         bookingData.customer_id,
  //         bookingData.service_id,
  //         bookingData.booking_date,
  //         bookingData.booking_time
  //       ],
  //       async (err, results) => {
  //         if (err) {
  //           reject(err);
  //           return;
  //         }

  //         try {
  //           // Get provider's expo push token
  //           const providerQuery = `
  //             SELECT u.expo_push_token 
  //             FROM users u 
  //             JOIN services s ON u.user_id = s.provider_id 
  //             WHERE s.service_id = ?`;
            
  //           connection.query(providerQuery, [bookingData.service_id], async (err, providerResult) => {
  //             if (err) {
  //               console.error('Error fetching provider token:', err);
  //               // Still resolve with booking results even if notification fails
  //               resolve(results);
  //               return;
  //             }

  //             if (providerResult && providerResult.length > 0 && providerResult[0].expo_push_token) {
  //               try {
  //                 // Send immediate notification to provider
  //                 await sendPushNotification(
  //                   providerResult[0].expo_push_token,
  //                   "New Booking Request",
  //                   "You have received a new booking request"
  //                 );
  //               } catch (notificationError) {
  //                 console.error('Error sending notification:', notificationError);
  //               }
  //             }

  //             // Schedule reminder notification
  //             try {
  //               const bookingDate = new Date(bookingData.booking_date);
  //               const reminderDate = new Date(bookingDate);
  //               reminderDate.setDate(reminderDate.getDate() - 1);

  //               await bookingsOperation.scheduleReminderNotification(
  //                 results.insertId,
  //                 bookingData.customer_id,
  //                 bookingData.service_id,
  //                 reminderDate
  //               );
  //             } catch (scheduleError) {
  //               console.error('Error scheduling reminder:', scheduleError);
  //             }

  //             resolve(results);
  //           });
  //         } catch (error) {
  //           console.error('Error in notification process:', error);
  //           resolve(results); // Still resolve with booking results even if notification fails
  //         }
  //       }
  //     );
  //   });
  // },
// ... existing code ...


  createBooking: (bookingData) => {
    return new Promise((resolve, reject) => {
      const query = `INSERT INTO bookings (customer_id, service_id, booking_date, booking_time) 
                     VALUES (?, ?, ?, ?)`;
      
      connection.query(
        query,
        [
          bookingData.customer_id,
          bookingData.service_id,
          bookingData.booking_date,
          bookingData.booking_time
        ],
        async (err, results) => {
          if (err) {
            reject(err);
            return;
          }

          try {
            // Get both provider's and customer's tokens in a single query
            const tokensQuery = `
              SELECT 
                c.expo_push_token as customer_token,
                p.expo_push_token as provider_token,
                s.service_name,
                s.provider_id
              FROM users c
              CROSS JOIN services s
              JOIN users p ON s.provider_id = p.user_id
              WHERE c.user_id = ? AND s.service_id = ?`;
            
            connection.query(tokensQuery, [bookingData.customer_id, bookingData.service_id], async (err, tokenResults) => {
              if (err) {
                console.error('Error fetching tokens:', err);
                resolve(results);
                return;
              }

              if (tokenResults && tokenResults.length > 0) {
                const { customer_token, provider_token, service_name } = tokenResults[0];

                // Send notification to provider if token exists
                if (provider_token) {
                  try {
                    await sendPushNotification(
                      provider_token,
                      "New Booking Request",
                      `You have received a new booking request for ${service_name}`
                    );
                  } catch (notificationError) {
                    console.error('Error sending provider notification:', notificationError);
                  }
                }

                // Send notification to customer if token exists
                if (customer_token) {
                  try {
                    await sendPushNotification(
                      customer_token,
                      "Booking Confirmation",
                      `Your booking request for ${service_name} has been submitted successfully`
                    );
                  } catch (notificationError) {
                    console.error('Error sending customer notification:', notificationError);
                  }
                }
              }

              // Schedule reminder notification
              try {
                const bookingDate = new Date(bookingData.booking_date);
                const reminderDate = new Date(bookingDate);
                reminderDate.setDate(reminderDate.getDate() - 1);

                await bookingsOperation.scheduleReminderNotification(
                  results.insertId,
                  bookingData.customer_id,
                  bookingData.service_id,
                  reminderDate
                );
              } catch (scheduleError) {
                console.error('Error scheduling reminder:', scheduleError);
              }

              resolve(results);
            });
          } catch (error) {
            console.error('Error in notification process:', error);
            resolve(results); // Still resolve with booking results even if notification fails
          }
        }
      );
    });
  },
  // ... rest of the code remains the same ...
  // Add new function for scheduling reminders
  scheduleReminderNotification: (bookingId, customerId, serviceId, reminderDate) => {
    return new Promise((resolve, reject) => {
      const query = `
        INSERT INTO notification_schedule 
        (booking_id, scheduled_date, notification_type, status) 
        VALUES (?, ?, 'reminder', 'pending')`;

      connection.query(query, [bookingId, reminderDate], (err, results) => {
        if (err) {
          reject(err);
          return;
        }
        resolve(results);
      });
    });
  },

  // Get all bookings for a customer
  getCustomerBookings: (customerId, status = null) => {
    return new Promise((resolve, reject) => {
      let query = `
        SELECT 
          b.*,
          s.service_name,
          s.description,
          s.price,
          s.location,
          GROUP_CONCAT(si.image_url) as images
        FROM bookings b
        LEFT JOIN services s ON b.service_id = s.service_id
        LEFT JOIN serviceimages si ON s.service_id = si.service_id
        WHERE b.customer_id = ?
      `;

      // Initialize countQuery and dataQuery
      let countQuery = `SELECT COUNT(*) AS totalBookings FROM bookings WHERE customer_id = ?`;
      let dataQuery = query; // Use the base query for dataQuery

      if (status) {
        countQuery += ` AND status = ?`;
        dataQuery += ` AND b.status = ?`;
      }

      dataQuery += ` GROUP BY b.booking_id ORDER BY b.booking_date DESC, b.booking_time DESC;`;

      // Execute the count query first
      connection.query(countQuery, status ? [customerId, status] : [customerId], (err, countResult) => {
        if (err) return reject(err);

        const totalBookings = countResult[0]?.totalBookings || 0;

        // Execute the data query
        connection.query(dataQuery, status ? [customerId, status] : [customerId], (err, results) => {
          if (err) reject(err);
          else {
            // Convert comma-separated image URLs into arrays
            const processedResults = results.map(booking => ({
              ...booking,
              images: booking.images ? booking.images.split(',') : []
            }));
            resolve({ totalBookings, bookings: processedResults }); // Return count + bookings
          }
        });
      });
    });
  },

  // Get bookings by provider ID with optional status filter
  getBookingsByProviderId: (providerId, status = null) => {
    return new Promise((resolve, reject) => {
      let countQuery = `
        SELECT COUNT(*) AS totalBookings 
        FROM bookings b 
        LEFT JOIN services s ON b.service_id = s.service_id 
        WHERE s.provider_id = ?
      `;

      let dataQuery = `
        SELECT 
          b.*, 
          s.service_name,
          s.description,
          s.price,
          s.location,
    GROUP_CONCAT(DISTINCT si.image_url) AS images
        FROM bookings b
        LEFT JOIN services s ON b.service_id = s.service_id
        LEFT JOIN serviceimages si ON s.service_id = si.service_id
        WHERE s.provider_id = ?
      `;
      // Add condition for status if it's provided
      if (status) {
        countQuery += ` AND b.status = ?`;
        dataQuery += ` AND b.status = ?`;
      }

      dataQuery += ` GROUP BY b.booking_id;`;

      // Execute the count query first
      connection.query(countQuery, status ? [providerId, status] : [providerId], (err, countResult) => {
        if (err) return reject(err);

        const totalBookings = countResult[0]?.totalBookings || 0;

        // Execute the data query
        connection.query(dataQuery, status ? [providerId, status] : [providerId], (err, bookings) => {
          if (err) return reject(err);

          resolve({ totalBookings, bookings: bookings || [] }); // Return count + bookings
        });
      });
    });
  },

  // Get bookings by customer ID with optional status filter
  getBookingsByCustomerId: (customerId, status = null) => {
    return new Promise((resolve, reject) => {
      let countQuery = `
        SELECT COUNT(*) AS totalBookings 
        FROM bookings b 
        WHERE b.customer_id = ?
      `;

      let dataQuery = `
        SELECT 
          b.booking_id,
          b.booking_date,
          b.booking_time,
          b.status,
          b.reason,
          b.description,
          b.created_at,
          b.updated_at,
          s.service_name,
          s.description AS service_description,
          s.price,
          s.location,
          GROUP_CONCAT(DISTINCT si.image_url) AS images
        FROM bookings b
        LEFT JOIN services s ON b.service_id = s.service_id
        LEFT JOIN serviceimages si ON s.service_id = si.service_id
        WHERE b.customer_id = ?
      `;

      // Add condition for status if it's provided
      if (status) {
        countQuery += ` AND b.status = ?`;
        dataQuery += ` AND b.status = ?`;
      }

      dataQuery += ` GROUP BY b.booking_id;`;
      
      // Execute the count query first
      connection.query(countQuery, status ? [customerId, status] : [customerId], (err, countResult) => {
        if (err) return reject(err);

        const totalBookings = countResult[0]?.totalBookings || 0;

        // Execute the data query
        connection.query(dataQuery, status ? [customerId, status] : [customerId], (err, bookings) => {
          if (err) return reject(err);

          // Ensure images are returned as an array
          bookings = bookings.map(booking => ({
            ...booking,
            images: booking.images ? booking.images.split(",") : []
          }));

          resolve({ totalBookings, bookings }); // Return count + bookings
        });
      });
    });
  },

  // Update booking status
  updateBookingStatus: (bookingId, status, customerId) => {
    return new Promise((resolve, reject) => {
      const query = `UPDATE bookings 
                     SET status = ?
                     WHERE booking_id = ? AND customer_id = ?`;
      
      connection.query(
        query,
        [status, bookingId, customerId],
        (err, results) => {
          if (err) reject(err);
          else resolve(results);
        }
      );
    });
  },

  // Update booking details
  updateBooking: (bookingId, bookingData) => {
    return new Promise((resolve, reject) => {
      const query = `UPDATE bookings 
                     SET booking_date = ?, booking_time = ?, reason = ?, description = ?
                     WHERE booking_id = ? AND customer_id = ? AND status = 'pending'`;
      
      connection.query(
        query,
        [
          bookingData.booking_date,
          bookingData.booking_time,
          bookingData.reason,
          bookingData.description,
          bookingId,
          bookingData.customer_id
        ],
        (err, results) => {
          if (err) reject(err);
          else resolve(results);
        }
      );
    });
  },

  // Cancel booking
  updateBookingAccepted: (bookingId) => {
    return new Promise((resolve, reject) => {
      const query = `
        UPDATE bookings 
        SET  status = ? 
        WHERE booking_id = ? AND status = 'pending'
      `;
      connection.query(
        query,
        [
              // Additional description
          'accepted',                // Updating the status to 'cancelled'
          bookingId                   // Booking ID to identify the record
        ],
        (err, results) => {
          if (err) {
            reject(err);  // Handle any database errors
          } else {
            resolve(results);  // Return the result from the query
          }
        }
      );
    });
  },

  // Cancel booking
  updateBookingCancel: (bookingId, bookingData) => {
    return new Promise((resolve, reject) => {
      const query = `
        UPDATE bookings 
        SET reason = ?, description = ?, status = ? 
        WHERE booking_id = ? AND status = 'pending'
      `;
  
      connection.query(
        query,
        [
          bookingData.reason,         // Reason for cancellation
          bookingData.description,    // Additional description
          'cancelled',                // Updating the status to 'cancelled'
          bookingId                   // Booking ID to identify the record
        ],
        (err, results) => {
          if (err) {
            reject(err);  // Handle any database errors
          } else {
            resolve(results);  // Return the result from the query
          }
        }
      );
    });
  },
  
  // Delete booking
  deleteBooking: (bookingId, customerId) => {
    return new Promise((resolve, reject) => {
      const query = 'DELETE FROM bookings WHERE booking_id = ? AND customer_id = ? AND status = "pending"';
      connection.query(query, [bookingId, customerId], (err, results) => {
        if (err) reject(err);
        else resolve(results);
      });
    });
  },

  // Get service bookings for a specific date
  getServiceBookings: (serviceId, date) => {
    return new Promise((resolve, reject) => {
      const query = `
        SELECT booking_time
        FROM bookings
        WHERE service_id = ? AND booking_date = ? AND status != 'cancelled'
      `;
      
      connection.query(query, [serviceId, date], (err, results) => {
        if (err) reject(err);
        else resolve(results);
      });
    });
  },

  // Get booking by ID
  getBookingById: (bookingId) => {
    return new Promise((resolve, reject) => {
      const query = `
        SELECT * FROM bookings 
        WHERE booking_id = ?;
      `;
  
      connection.query(query, [bookingId], (err, results) => {
        if (err) {
          console.error('Error fetching booking:', err);
          return reject(err);
        }
        resolve(results[0]);  // Return single booking record
      });
    });
  },

  // Add this new function to process notifications
  processNotifications: () => {
    return new Promise((resolve, reject) => {
      const query = `
        SELECT 
          ns.*,
          b.customer_id,
          b.service_id,
          u1.expo_push_token as customer_token,
          u2.expo_push_token as provider_token
        FROM notification_schedule ns
        JOIN bookings b ON ns.booking_id = b.booking_id
        JOIN users u1 ON b.customer_id = u1.user_id
        JOIN services s ON b.service_id = s.service_id
        JOIN users u2 ON s.provider_id = u2.user_id
        WHERE ns.status = 'pending' 
        AND ns.scheduled_date <= NOW()
      `;

      connection.query(query, [], async (err, notifications) => {
        if (err) {
          console.error('Error fetching notifications:', err);
          reject(err);
          return;
        }

        try {
          for (const notification of notifications) {
            // Send to customer
            if (notification.customer_token) {
              await sendPushNotification(
                notification.customer_token,
                "Booking Reminder",
                "You have a booking scheduled for tomorrow"
              );
            }

            // Send to provider
            if (notification.provider_token) {
              await sendPushNotification(
                notification.provider_token,
                "Booking Reminder",
                "You have a booking scheduled for tomorrow"
              );
            }

            // Update notification status
            await connection.query(
              'UPDATE notification_schedule SET status = "sent" WHERE id = ?',
              [notification.id]
            );
          }
          resolve({ success: true, processed: notifications.length });
        } catch (error) {
          console.error('Error processing notifications:', error);
          reject(error);
        }
      });
    });
  },
}

// Add this route to your backend

module.exports = bookingsOperation;