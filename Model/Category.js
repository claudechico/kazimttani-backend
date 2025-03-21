const connection = require('./db');

const categoryOperations = {
  // Create a new category
  createCategory: (categoryData) => {
    return new Promise((resolve, reject) => {
      const query = `INSERT INTO categories (name, description) 
                     VALUES (?, ?)`;
      connection.query(
        query,
        [categoryData.name, categoryData.description],
        (err, results) => {
          if (err) reject(err);
          else resolve(results);
        }
      );
    });
  },

  // Read all categories
  getAllCategories: () => {
    return new Promise((resolve, reject) => {
      const query = 'SELECT * FROM categories';
      connection.query(query, (err, results) => {
        if (err) reject(err);
        else resolve(results);
      });
    });
  },

  // Read single category by ID
  getCategoryById: (categoryId) => {
    return new Promise((resolve, reject) => {
      const query = 'SELECT * FROM categories WHERE category_id = ?';
      connection.query(query, [categoryId], (err, results) => {
        if (err) reject(err);
        else resolve(results[0]);
      });
    });
  },

  // Update a category
  updateCategory: (categoryId, categoryData) => {
    return new Promise((resolve, reject) => {
      const query = `UPDATE categories 
                     SET name = ?, description = ? 
                     WHERE category_id = ?`;
      connection.query(
        query,
        [categoryData.name, categoryData.description, categoryId],
        (err, results) => {
          if (err) reject(err);
          else resolve(results);
        }
      );
    });
  },

  // Delete a category
  deleteCategory: (categoryId) => {
    return new Promise((resolve, reject) => {
      const query = 'DELETE FROM categories WHERE category_id = ?';
      connection.query(query, [categoryId], (err, results) => {
        if (err) reject(err);
        else resolve(results);
      });
    });
  },



  
  // Read all services by category ID
  // Read all services by category ID
getServicesByCategoryId: (categoryId) => {
  return new Promise((resolve, reject) => {
    const query = `
      SELECT 
        s.*, 
        c.name AS category_name, 
        GROUP_CONCAT(si.image_url) AS images, 
        COUNT(r.review_id) AS review_count,  -- Number of reviews
        IFNULL(AVG(r.rating), 0) AS average_rating  -- Average rating, defaults to 0 if no reviews
      FROM services s
      LEFT JOIN serviceimages si ON s.service_id = si.service_id
      LEFT JOIN categories c ON s.category_id = c.category_id
      LEFT JOIN users u ON s.provider_id = u.user_id
      LEFT JOIN reviews r ON s.service_id = r.service_id  -- Join with reviews table
      WHERE s.category_id = ?
      GROUP BY s.service_id, c.name
    `;
    connection.query(query, [categoryId], (err, results) => {
      if (err) reject(err);
      else {
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

module.exports = categoryOperations;