const connection = require('./db');
const JWT = require("jsonwebtoken");
const userOperations = {
  // Create a new user
  createUser: (userData) => {
    return new Promise((resolve, reject) => {
      const query = `INSERT INTO users (email, password) 
                     VALUES (?, ?)`;
      connection.query(
        query,
        [userData.email, userData.password],
   
        (err, results) => {
          if (err) reject(err);
          else resolve(results);
        }
      );
    });
  },

  createUser:(userData) => {
    return new Promise((resolve, reject) => {
        // Check if email already exists
        const checkEmailQuery = `SELECT * FROM users WHERE email = ?`;
        connection.query(checkEmailQuery, [userData.email], (err, results) => {
            if (err) return reject(err); // Handle any database error

            // If email already exists, reject the promise with an error message
            if (results.length > 0) {
                return reject(new Error('Email already exists'));
            }

            // If email doesn't exist, proceed to create the new user
            const query = `INSERT INTO users (email, password) 
            VALUES (?, ?)`;
connection.query(
query,
[userData.email, userData.password],

(err, results) => {
 if (err) reject(err);
 else resolve(results);
})
          
        });
    });
},

 checkIfEmailExists:(email) => {
  return new Promise((resolve, reject) => {
    const query = `SELECT * FROM users WHERE email = ?`;
    connection.query(query, [email], (err, results) => {
      if (err) return reject(err);  // If there's a database error
      resolve(results.length > 0);  // Return true if email exists
    });
  });
 },


  // Get user by ID
  getUserById: (userId) => {
    return new Promise((resolve, reject) => {
      const query = 'SELECT * FROM users WHERE user_id = ?';
      connection.query(query, [userId], (err, results) => {
        if (err) reject(err);
        else resolve(results[0]);
      });
    });
  },
  
  // Update user
  updateUser: (userId, userData) => {
    return new Promise((resolve, reject) => {
      const query = `UPDATE users 
                     SET name = ?, userType = ?,  skills = ?, 
                         address = ?, experience = ?,  phone = ?, profile_picture = ?
                     WHERE user_id = ?`;
      connection.query(
        query,
        [userData.name,userData.userType, userData.skills,userData.address,userData.experience, 
         userData.phone, userData.profile_picture, userId],
        (err, results) => {
          if (err) reject(err);
          else resolve(results);
        }
      );
    });
  },


  // update user profile

  updateuserProfile: (userId, userData) => {
    return new Promise((resolve, reject) => {
      const query = `UPDATE users 
                     SET name = ?,   skills = ?, 
                         address = ?, experience = ?,  phone = ?, profile_picture = ?
                     WHERE user_id = ?`;
      connection.query(
        query,
        [userData.name, userData.skills,userData.address,userData.experience, 
         userData.phone, userData.profile_picture, userId],
        (err, results) => {
          if (err) reject(err);
          else resolve(results);
        }
      );
    });
  },

  // Delete user
  deleteUser: (userId) => {
    return new Promise((resolve, reject) => {
      const query = 'DELETE FROM users WHERE user_id = ?';
      connection.query(query, [userId], (err, results) => {
        if (err) reject(err);
        else resolve(results);
      });
    });
  },

  // Add this new method
  getAllUsers: () => {
    return new Promise((resolve, reject) => {
      const query = 'SELECT * FROM Users';
      connection.query(query, (err, results) => {
        if (err) reject(err);
        else resolve(results);
      });
    });
  },
   // Login user
   loginUser: (credentials) => {
    return new Promise((resolve, reject) => {
      const query = 'SELECT user_id, email, name, experience, userType, phone, address, profile_picture, password FROM users WHERE email = ?';
      connection.query(
        query,
        [credentials.email],
        (err, results) => {
          if (err) {
            console.error('Database error:', err);
            reject(err);
          } else if (results.length === 0) {
            reject(new Error('Invalid credentials'));
          } else {
            const user = results[0];
            // Calculate profile completion status
            user.profile_completed = Boolean(
              user.name && 
              user.phone && 
              user.address && 
              user.profile_picture
            );
            resolve(user);
          }
        }
      );
    });
  }
};

module.exports = userOperations;