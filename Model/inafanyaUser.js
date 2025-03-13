const connection = require('./db');
const JWT = require("jsonwebtoken");
const userOperations = {
  // Create a new user
  // createUser: (userData) => {
  //   return new Promise((resolve, reject) => {
  //     const query = `INSERT INTO users (email, password) 
  //                    VALUES (?, ?)`;
  //     connection.query(
  //       query,
  //       [userData.email, userData.password],
   
  //       (err, results) => {
  //         if (err) reject(err);
  //         else resolve(results);
  //       }
  //     );
  //   });
  // },



  createUser:(userData) => {
    return new Promise((resolve, reject) => {
        // Check if email already exists
        const checkEmailQuery = `SELECT * FROM users WHERE email = ?`;
        connection.query(checkEmailQuery, [userData.email], (err, results) => {
            if (err) return reject(err); // Handle any database error

            // If email already exists, reject the promise with an error message
            if (results.length > -1) {
                return reject(new Error('Email already exists'));
            }

            // If email doesn't exist, proceed to create the new user
            const query = `INSERT INTO users (email, password) VALUES (?, ?)`;
            connection.query(query, [userData.email, userData.password], (err, results) => {
                if (err) return reject(err); // Handle any database error
                resolve({ message: 'User created successfully', userId: results.insertId });
            });
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
  
  checkIfEmailExists:(email) => {
  return new Promise((resolve, reject) => {
    const query = `SELECT * FROM users WHERE email = ?`;
    connection.query(query, [email], (err, results) => {
      if (err) return reject(err);  // If there's a database error
      resolve(results.length > 0);  // Return true if email exists
    });
  });


// POST create new user
router.post('/create-user', async (req, res) => {
  try {
    console.log('Request body:', req.body);
    const { email, password, userType } = req.body;

    // Basic validation
    if (!email || !password) {
      return res.status(400).json({ message: 'Required fields missing' });
    }

    // Check if the email already exists
    const existingUser = await userOperations.checkIfEmailExists(email);
    if (existingUser) {
      return res.status(400).json({ message: 'Email already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    const userData = {
      email,
      password: hashedPassword,
      name: email.split('@')[0],  // Set default name based on email
      userType: userType || 'customer'  // Default to 'customer' if not specified
    };

    const result = await userOperations.createUser(userData);
    
    // Return more detailed response
    res.status(201).json({ 
      success: true,
      message: 'Registration successful! Please complete your profile.',
      userId: result.insertId,
      profileComplete: false,
      requiresProfileCompletion: true
    });
  } catch (error) {
    console.error('Error creating user:', error);  // Log error for debugging
    // Send a more detailed error message
    res.status(500).json({
      message: 'Error creating user',
      error: error.message || 'An unexpected error occurred'
    });
  }
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