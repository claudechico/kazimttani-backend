const connection = require('./db');
const servicesOperation = {
  // Create a new service with images
  createServices: (serviceData, images = []) => {
    return new Promise((resolve, reject) => {
      connection.beginTransaction(async (err) => {
        if (err) {
          return reject(err);
        }

        try {
          // First insert the service
          const serviceQuery = `INSERT INTO Services (provider_id, service_name, description, price, 
                               category_id, location ) 
                               VALUES (?, ?, ?, ?, ?, ?)`;
          
          const serviceResult = await new Promise((resolve, reject) => {
            connection.query(
              serviceQuery,
              [
                serviceData.provider_id,
                serviceData.service_name,
                serviceData.description,
                serviceData.price,
                serviceData.category_id,
                serviceData.location,
                serviceData.availability
              ],
              (err, results) => {
                if (err) reject(err);
                else resolve(results);
              }
            );
          });

          // If there are images, insert them
          if (images.length > 0) {
            const imageQuery = `INSERT INTO ServiceImages (service_id, image_url) VALUES ?`;
            const imageValues = images.map(image => [serviceResult.insertId, image]);
            
            await new Promise((resolve, reject) => {
              connection.query(imageQuery, [imageValues], (err, results) => {
                if (err) reject(err);
                else resolve(results);
              });
            });
          }

          await new Promise((resolve, reject) => {
            connection.commit((err) => {
              if (err) reject(err);
              else resolve();
            });
          });

          resolve(serviceResult);
        } catch (error) {
          await new Promise((resolve, reject) => {
            connection.rollback(() => {
              reject(error);
            });
          });
        }
      });
    });
  },

  getAllServices: () => {
    return new Promise((resolve, reject) => {
      const query = `
        SELECT 
            s.*,
            c.name AS category_name,
            u.name AS provider_name,
            u.experience As user_experience,
            u.profile_picture AS provider_profile_picture,
            u.address AS provider_address,
            GROUP_CONCAT(si.image_url) AS images,
            COUNT(r.review_id) AS review_count, -- Number of reviews
            IFNULL(AVG(r.rating), 0) AS average_rating -- Average rating, defaults to 0 if no reviews
        FROM Services s
        LEFT JOIN ServiceImages si ON s.service_id = si.service_id
        LEFT JOIN categories c ON s.category_id = c.category_id
        LEFT JOIN users u ON s.provider_id = u.user_id
        LEFT JOIN reviews r ON s.service_id = r.service_id -- Join with reviews table
        GROUP BY s.service_id
        ORDER BY s.service_id DESC;
      `;
      connection.query(query, (err, results) => {
        if (err) reject(err);
        else {
          results = results.map(service => ({
            ...service,
            images: service.images ? service.images.split(',') : [],
          }));
          resolve(results);
        }
      });
    });
  },
  
  // Read service by ID with images
  getServiceById: (serviceId) => {
    return new Promise((resolve, reject) => {
      const query = `
     SELECT 
    s.*, 
    c.name AS category_name, 
    u.name AS provider_name,
    u.profile_picture AS provider_profile_picture,
    u.address AS provider_address,
    si.image_url AS image,
    b.booking_id,
    b.booking_date,
    b.booking_time,
    b.status AS booking_status,
    b.reason AS booking_reason,
    b.description AS booking_description,
    b.created_at AS booking_created_at,
    b.updated_at AS booking_updated_at,
    cu.name AS customer_name,
    cu.phone AS customer_phone,
    cu.email AS customer_email,
    cu.address AS customer_address
FROM Services s
LEFT JOIN ServiceImages si ON s.service_id = si.service_id
LEFT JOIN categories c ON s.category_id = c.category_id
LEFT JOIN users u ON s.provider_id = u.user_id
LEFT JOIN bookings b ON s.service_id = b.service_id
LEFT JOIN users cu ON b.customer_id = cu.user_id  -- Join with users table for customer details
WHERE s.service_id = ?;
      `;
      connection.query(query, [serviceId], (err, results) => {
        if (err) reject(err);
        else {
          const service = results[0];
          if (service) {
            service.images = service.images ? service.images.split(',') : [];
          }
          resolve(service);
        }
      });
    });
  },

  // Read services by provider ID
  // getServicesByProviderId: (providerId) => {
  //   return new Promise((resolve, reject) => {
  //     const query = 'SELECT * FROM Services WHERE provider_id = ?';
  //     connection.query(query, [providerId], (err, results) => {
  //       if (err) reject(err);
  //       else resolve(results);
  //     });
  //   });
  // },

  // Update service with images
  updateService: (serviceId, serviceData, images = []) => {
    return new Promise((resolve, reject) => {
      connection.beginTransaction(async (err) => {
        if (err) {
          return reject(err);
        }

        try {
          // Update service details
          const serviceQuery = `UPDATE Services 
                               SET provider_id = ?, service_name = ?, description = ?, 
                                   price = ?, category_id = ?, location = ?, availability = ?
                               WHERE service_id = ?`;
          
          await new Promise((resolve, reject) => {
            connection.query(
              serviceQuery,
              [
                serviceData.provider_id,
                serviceData.service_name,
                serviceData.description,
                serviceData.price,
                serviceData.category_id,
                serviceData.location,
                serviceData.availability,
                serviceId
              ],
              (err, results) => {
                if (err) reject(err);
                else resolve(results);
              }
            );
          });

          // If new images are provided, delete old ones and insert new ones
          if (images.length > 0) {
            // Delete existing images
            await new Promise((resolve, reject) => {
              connection.query('DELETE FROM ServiceImages WHERE service_id = ?', [serviceId], (err, results) => {
                if (err) reject(err);
                else resolve(results);
              });
            });

            // Insert new images
            const imageQuery = `INSERT INTO ServiceImages (service_id, image_url) VALUES ?`;
            const imageValues = images.map(image => [serviceId, image]);
            
            await new Promise((resolve, reject) => {
              connection.query(imageQuery, [imageValues], (err, results) => {
                if (err) reject(err);
                else resolve(results);
              });
            });
          }

          await new Promise((resolve, reject) => {
            connection.commit((err) => {
              if (err) reject(err);
              else resolve();
            });
          });

          resolve({ success: true });
        } catch (error) {
          await new Promise((resolve, reject) => {
            connection.rollback(() => {
              reject(error);
            });
          });
        }
      });
    });
  },

  // Delete service
  deleteService: (serviceId) => {
    return new Promise((resolve, reject) => {
      connection.beginTransaction(async (err) => {
          if (err) return reject(err);
          try {
              await new Promise((resolve, reject) => {
                  connection.query('DELETE FROM ServiceImages WHERE service_id = ?', [serviceId], (err, results) => {
                      if (err) reject(err);
                      else resolve(results);
                  });
              });
              await new Promise((resolve, reject) => {
                  connection.query('DELETE FROM Services WHERE service_id = ?', [serviceId], (err, results) => {
                      if (err) reject(err);
                      else resolve(results);
                  });
              });
              connection.commit((err) => {
                  if (err) reject(err);
                  else resolve({ success: true });
              });
          } catch (error) {
              connection.rollback(() => reject(error));
          }
       
      });
    });
  },

  // Get services by provider ID with additional details
  servicesByProvider: (providerId) => {
    return new Promise((resolve, reject) => {
      const query = `
        SELECT s.*, 
               c.name as category_name, 
               u.name as provider_name,
               u.profile_picture as provider_profile_picture,
               u.address as provider_address,
               GROUP_CONCAT(si.image_url) as images
        FROM Services s
        LEFT JOIN ServiceImages si ON s.service_id = si.service_id
        LEFT JOIN categories c ON s.category_id = c.category_id
        LEFT JOIN users u ON s.provider_id = u.user_id
        WHERE s.provider_id = ?
        GROUP BY s.service_id
      `;
      console.log('Executing query with provider ID:', providerId);
      connection.query(query, [providerId], (err, results) => {
        if (err) {
          console.error('Database error:', err);
          reject(err);
        } else {
          console.log('Raw results:', results);
          results = results.map(service => ({
            ...service,
            images: service.images ? service.images.split(',') : []
          }));
          resolve(results);
        }
      });
    });
  },
};

module.exports = servicesOperation;