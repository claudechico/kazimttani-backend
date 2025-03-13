const connection = require('./db');

const reviewsOperation = {
  // Create a new review
  createReview: (reviewData) => {
    return new Promise((resolve, reject) => {
      const query = `INSERT INTO reviews (customer_id, service_id, rating, review_text) 
                     VALUES (?, ?, ?, ?)`;
      
      connection.query(
        query,
        [
          reviewData.customer_id,
          reviewData.service_id,
          reviewData.rating,
          reviewData.review_text
        ],
        (err, results) => {
          if (err) reject(err);
          else resolve(results);
        }
      );
    });
  },

  // Get all reviews for a service
  getServiceReviews: (serviceId) => {
    return new Promise((resolve, reject) => {
      const query = `
        SELECT r.*, u.name as customer_name, u.profile_picture as customer_profile_picture
        FROM reviews r
        LEFT JOIN users u ON r.customer_id = u.user_id
        WHERE r.service_id = ?
        ORDER BY r.created_at DESC
      `;
      
      connection.query(query, [serviceId], (err, results) => {
        if (err) reject(err);
        else resolve(results);
      });
    });
  },

  // Get review by ID
  getReviewById: (reviewId) => {
    return new Promise((resolve, reject) => {
      const query = `
        SELECT r.*, u.name as customer_name
        FROM reviews r
        LEFT JOIN users u ON r.customer_id = u.user_id
        WHERE r.review_id = ?
      `;
      
      connection.query(query, [reviewId], (err, results) => {
        if (err) reject(err);
        else resolve(results[0]);
      });
    });
  },

  // Update review
  updateReview: (reviewId, reviewData) => {
    return new Promise((resolve, reject) => {
      const query = `UPDATE reviews 
                     SET rating = ?, review_text = ?
                     WHERE review_id = ? AND customer_id = ?`;
      
      connection.query(
        query,
        [
          reviewData.rating,
          reviewData.review_text,
          reviewId,
          reviewData.customer_id // Ensure user can only update their own review
        ],
        (err, results) => {
          if (err) reject(err);
          else resolve(results);
        }
      );
    });
  },

  // Delete review
  deleteReview: (reviewId, customerId) => {
    return new Promise((resolve, reject) => {
      const query = 'DELETE FROM reviews WHERE review_id = ? AND customer_id = ?';
      connection.query(query, [reviewId, customerId], (err, results) => {
        if (err) reject(err);
        else resolve(results);
      });
    });
  },

  // Get average rating for a service
  getServiceRating: (serviceId) => {
    return new Promise((resolve, reject) => {
      const query = `
        SELECT 
          COUNT(*) as review_count,
          AVG(rating) as average_rating
        FROM reviews
        WHERE service_id = ?
      `;
      
      connection.query(query, [serviceId], (err, results) => {
        if (err) reject(err);
        else resolve(results[0]);
      });
    });
  }
};

module.exports = reviewsOperation;