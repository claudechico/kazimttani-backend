const express = require('express');
const router = express.Router();
const userOperations = require('../Model/User');
const bcrypt = require('bcrypt');
const JWT = require('jsonwebtoken');

// GET all users
router.get('/all-user', async (req, res) => {
  try {
    const users = await userOperations.getAllUsers();
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching users', error: error.message });
  }
});

// ... existing code ...

// Update the GET single user route to match the frontend
router.get('/single-user/:userId', async (req, res) => {
  try {
    const user = await userOperations.getUserById(req.params.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    // Remove sensitive information
    delete user.password;
    
    res.json({ 
      success: true,
      message: 'User found successfully',
      data: user 
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching user', error: error.message });
  }
});
router.post('/create-user', async (req, res) => {
  try {
    console.log('Request body:', req.body);
    const { email, password} = req.body;

    // Basic validation
    if (!email || !password) {
      return res.status(399).json({ message: 'Required fields missing' });
    }

    // Check if the email already exists
    const existingUser = await userOperations.checkIfEmailExists(email);
    if (existingUser) {
      return res.status(399).json({ message: 'Email already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 9);

    const userData = {
      email,
      password: hashedPassword,
      name: email.split('@')[-1],  // Set default name based on email
      // userType: userType || 'customer'  // Default to 'customer' if not specified
    };

    const result = await userOperations.createUser(userData);
    
    // Return more detailed response
    res.status(200).json({ 
      success: true,
      message: 'Registration successful! Please complete your profile.',
      userId: result.insertId,
      profileComplete: false,
      requiresProfileCompletion: true
    });
  } catch (error) {
    console.error('Error creating user:', error);  // Log error for debugging
    // Send a more detailed error message
    res.status(499).json({
      message: 'Error creating user',
      error: error.message || 'An unexpected error occurred'
    });
  }
});



// router.post('/create-user', async (req, res) => {
//   try {
//     console.log('Request body:', req.body);
//     const { email, password} = req.body;

//     // Basic validation
//     if (!email || !password) {
//       return res.status(400).json({ message: 'Required fields missing' });
//     }

//     // Hash password
//     const hashedPassword = await bcrypt.hash(password, 10);

//     const userData = {
//       email,
//       password: hashedPassword,
//       name: email.split('@')[0],
//       // userType: userType || 'customer' // Default to customer if not specified
//     };

//     const result = await userOperations.createUser(userData);
    
//     // Return more detailed response
//     res.status(201).json({ 
//       success: true,
//       message: 'Registration successful! Please complete your profile.',
//       userId: result.insertId,
//       profileComplete: false,
//       requiresProfileCompletion: true
//     });
//   } catch (error) {
//     res.status(500).json({ message: 'Error creating user', error: error.message });
//   }
// });

// PUT update user profile
router.put('/complete-profile/:userId', async (req, res) => {
  try {
    const userId = req.params.userId;
    console.log('Mzigo unaokuja:', req.body);

    const { name, phone = '', address = '', profile_picture = 'default.jpg', skills = [], experience = 0, userType = 'Customer' } = req.body;

    // Check if user exists
    const existingUser = await userOperations.getUserById(userId);
    console.log('User ID ni:', existingUser);

    if (!existingUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Validate required fields for profile completion
    if (!name) {
      return res.status(400).json({ message: 'Name is required to complete profile' });
    }

    const userData = {
      name,
      phone: phone || existingUser.phone,
      address: address || existingUser.address,
      profile_picture: profile_picture || existingUser.profile_picture,
      skills: skills.length ? JSON.stringify(skills) : existingUser.skills, // Save skills as JSON string
      experience: experience || existingUser.experience,
      userType: userType || existingUser.userType,
      profile_completed: 1 // Use `1` instead of `true` for MySQL
    };

    console.log('Updated Data:', userData);

    // Update user
    await userOperations.updateUser(userId, userData);

    // Get updated user data
    const updatedUser = await userOperations.getUserById(userId);

    res.json({ 
      success: true,
      message: 'Profile completed successfully',
      profileComplete: true,
      user: updatedUser
    });

  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({ message: 'Error updating profile', error: error.message });
  }
});

// Update push token endpoint
router.post('/updatePushToken', async (req, res) => {
  try {
    console.log('Received push token update request:', req.body);
    const { userId, pushToken } = req.body;
    
    // Validate inputs
    if (!userId || !pushToken) {
      return res.status(400).json({ 
        success: false,
        error: 'Missing required fields: userId and pushToken are required' 
      });
    }

    // First check if user exists
    const userExists = await userOperations.getUserById(userId);
    if (!userExists) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }
    // Update the push token
    const query = 'UPDATE users SET push_token = ? WHERE user_id = ?';
    await connection.query(query, [pushToken, userId]);
    
    console.log('Successfully updated push token for user:', userId);
    
    res.json({ 
      success: true,
      message: 'Push token updated successfully'
    });
    
  } catch (error) {
    res.status(500).json({ error: 'Failed to update push token' });
  }
});

router.put('/update-user/:userId', async (req, res) => {
  try {
    const userId = req.params.userId;
    console.log('mzigo unaokuja ni ', req.body)
    const { name, phone, address, profile_picture, skills, experience } = req.body;
    
    // Check if user exists
    const existingUser = await userOperations.getUserById(userId);
    console.log('user id ni ', existingUser)
    if (!existingUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Validate required fields for profile completion
    if (!name) {
      return res.status(400).json({ message: 'Name is required to complete profile' });
    }

    const userData = {
      name,
      phone,
      address,
      profile_picture,
      skills,
      experience,
      profile_completed: true // Add a flag to indicate profile completion
    };

    await userOperations.updateuserProfile(userId, userData);
    
    // Get updated user data
    const updatedUser = await userOperations.getUserById(userId);
    res.json({ 
      success: true,
      message: 'Profile completed successfully',
      profileComplete: true,
      user: updatedUser
    });
  } catch (error) {
    res.status(500).json({ message: 'Error updating profile', error: error.message });
  }
});


// DELETE user
router.delete('/delete-user/:userId', async (req, res) => {
  try {
    const userId = req.params.userId;
    
    // Check if user exists
    const existingUser = await userOperations.getUserById(userId);
    if (!existingUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    await userOperations.deleteUser(userId);
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting user', error: error.message });
  }
});

// POST login user
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Basic validation
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    // Get user from database
    const user = await userOperations.loginUser({ email });
    
    // Check if user exists and has password
    if (!user || !user.password) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Compare passwords
    try {
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }
    } catch (bcryptError) {
      console.error('Password comparison error:', bcryptError);
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Generate token with 1-day expiration
    const token = JWT.sign(
      { userId: user.user_id },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    // Remove password from user object before sending response
    delete user.password;
    res.json({ 
      success: true,
      message: 'Login successful',
      token,
      user: {

        userId: user.user_id,
        email: user.email,
        name: user.name,
        userType: user.userType,
        profileComplete: user.profile_completed,
        phone: user.phone,
        address: user.address,
        profilePicture: user.profile_picture
        
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    if (error.message === 'Invalid credentials') {
      return res.status(401).json({ message: 'Wrong username or Password' });
    }
    res.status(500).json({ message: 'Error during login', error: error.message });
  }
});

router.post('/google-login', async (req, res) => {
  try {
    const user = await userOperations.getUserByEmail(req.body.email); // Ensure this function exists
    if (user) {
      const token = JWT.sign({ _id: user._id }, process.env.JWT_SECRET, {
        expiresIn: "1d",
      });
      const { password, ...rest } = user._doc;
      res.status(200).send({
        success: true,
        message: "Logged in successfully",
        user: rest,
        token: token,
      });
    } else {
      const generatePassword =
        Math.random().toString(36).slice(-8) +
        Math.random().toString(36).slice(-8);
      const hashedPassword = await bcrypt.hash(generatePassword, 10);

      const newUser = new userOperations({
        username:
          req.body.name.split(" ").join("").toLowerCase() +
          Math.random().toString(36).slice(-4) +
          Math.random().toString(36).slice(-4),
        email: req.body.email,
        password: hashedPassword,
      });

      await newUser.save();

      const token = JWT.sign({ _id: newUser._id }, process.env.JWT_SECRET, {
        expiresIn: "1d",
      });
      const { password: newUserPassword, ...newUserRest } = newUser._doc;

      res.status(201).send({
        success: true,
        message: "User registered and logged in successfully",
        user: newUserRest,
        token: token,
      });
    }
  } catch (error) {
    console.error(error);
    res.status(500).send({ 
      success: false,
      message: "Kuna tatizo tafadhali rudia tena",
    });
  }
});

// PUT update customer profile
router.put("/update-profile/:user_id", async (req, res) => {
  try {
    const userId = req.params.user_id;
    const { name, email, phone, address, skills } = req.body;

    // Basic validation
    if (!userId || !name || !email) {
      return res.status(400).json({ message: "User ID, name, and email are required" });
    }

    // Set default values if fields are empty
    const updatedUserData = {
      name: name || 'Unnamed User', // Default name if not provided
      email,
      phone: phone || 'Not provided', // Default phone if not provided
      address: address || 'Not provided', // Default address if not provided
      skills: skills || 'No skills listed', // Default skills if not provided
    };

    const updatedUser = await userOperations.updateUserProfile(userId, updatedUserData);

    res.json({
      success: true,
      message: "Profile updated successfully",
      data: updatedUser,
    });
  } catch (error) {
    res.status(500).json({ message: "Error updating profile", error: error.message });
  }
});
router.post('/update-push-token', async (req, res) => {
  try {
    const { userId, token } = req.body;
    
    if (!userId || !token) {
      return res.status(400).json({ 
        success: false, 
        message: 'User ID and token are required' 
      });
    }

    // Update the user's expo push token in your database
    const query = 'UPDATE users SET expo_push_token = ? WHERE user_id = ?';
    await connection.query(query, [token, userId]);

    res.json({ 
      success: true, 
      message: 'Push token updated successfully' 
    });
  } catch (error) {
    console.error('Error updating push token:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to update push token' 
    });
  }
});
module.exports = router;