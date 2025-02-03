const connection = require('./db');

const bookingsOperation = {
  // Create a new booking
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
        (err, results) => {
          if (err) reject(err);
          else resolve(results);
        }
      );
    });
  },

  // Get all bookings for a customer
  getCustomerBookings: (customerId) => {
    return new Promise((resolve, reject) => {
      const query = `
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
        GROUP BY b.booking_id
        ORDER BY b.booking_date DESC, b.booking_time DESC
      `;
      
      connection.query(query, [customerId], (err, results) => {
        if (err) reject(err);
        else {
          // Convert comma-separated image URLs into arrays
          const processedResults = results.map(booking => ({
            ...booking,
            images: booking.images ? booking.images.split(',') : []
          }));
          resolve(processedResults);
        }
      });
    });
  },

  // // Get booking by ID
  // getBookingsByProviderId: (providerId) => {
  //   return new Promise((resolve, reject) => {
  //     const query = `
  //       SELECT 
  //         b.*,
  //         s.service_name,
  //         s.description,
  //         s.price,
  //         s.location,
  //         GROUP_CONCAT(si.image_url) as images
  //       FROM bookings b
  //       LEFT JOIN services s ON b.service_id = s.service_id
  //       LEFT JOIN serviceimages si ON s.service_id = si.service_id
  //       LEFT JOIN users u ON b.customer_id = u.user_id
  //       WHERE s.provider_id = ?
  //       GROUP BY b.booking_id;
  //     `;
  
  //     connection.query(query, [providerId], (err, results) => {
  //       if (err) reject(err);
  //       else resolve(results); // Return multiple bookings
  //     });
  //   });
  // },
  

// // Get bookings by provider ID with optional status filter
// getBookingsByProviderId: (providerId, status = null) => {
//   return new Promise((resolve, reject) => {
//     let query = `
//       SELECT 
//         b.*, 
//         s.service_name,
//         s.description,
//         s.price,
//         s.location,
//         GROUP_CONCAT(si.image_url) as images
//       FROM bookings b
//       LEFT JOIN services s ON b.service_id = s.service_id
//       LEFT JOIN serviceimages si ON s.service_id = si.service_id
//       LEFT JOIN users u ON b.customer_id = u.user_id
//       WHERE s.provider_id = ?
//     `;

//     // Add condition for status if it's provided
//     if (status) {
//       query += ` AND b.status = ?`;
//     }

//     query += ` GROUP BY b.booking_id;`;

//     // Execute the query with or without the status condition
//     connection.query(query, status ? [providerId, status] : [providerId], (err, results) => {
//       if (err) reject(err);
//       else resolve(results); // Return multiple bookings
//     });
//   });
// },

getBookingsBycustomerId: (customerId, status = null) => {
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
        s.created_at as booking_date,
        GROUP_CONCAT(si.image_url) AS images
      FROM bookings b
      LEFT JOIN services s ON b.service_id = s.service_id
      LEFT JOIN serviceimages si ON s.service_id = si.service_id
      LEFT JOIN users u ON b.customer_id = u.user_id
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
                     SET booking_date = ?, booking_time = ? reason =?,  description= ?
                     WHERE booking_id = ? AND customer_id = ? AND status = 'pending'`;
      
      connection.query(
        query,
        [
          bookingData.booking_date,
          bookingData.booking_time,
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
 

 
  // Delete booking
  updateBookingCancel: (bookingId, bookingData) => {
    return new Promise((resolve, reject) => {
      const query = `
        UPDATE bookings 
        SET reason = ?, description = ?, status = ? 
        WHERE booking_id = ?  AND status = 'pending'
      `;
  
      connection.query(
        query,
        [
          bookingData.reason,         // Reason for cancellation
          bookingData.description,    // Additional description
          'cancelled',                // Updating the status to 'cancelled'
          bookingId,                  // Booking ID to identify the record
          // bookingData.customer_id     // Ensure it belongs to the correct customer
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
  
}


module.exports = bookingsOperation;