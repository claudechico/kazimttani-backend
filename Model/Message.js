const connection = require('./db');

const messageOperation = {
  // Create a new chat
  createChat: (customerId, providerId) => {
    // First check if chat already exists
    const checkQuery = 'SELECT chat_id FROM chats WHERE (customer_id = ? AND provider_id = ?) OR (customer_id = ? AND provider_id = ?)';
    return new Promise((resolve, reject) => {
      connection.query(checkQuery, [customerId, providerId, providerId, customerId], (err, results) => {
        if (err) return reject(err);
        
        if (results.length > 0) {
          // Chat already exists, return existing chat_id
          resolve(results[0].chat_id);
        } else {
          // Create new chat
          const insertQuery = 'INSERT INTO chats (customer_id, provider_id, created_at) VALUES (?, ?, NOW())';
          connection.query(insertQuery, [customerId, providerId], (err, results) => {
            if (err) return reject(err);
            resolve(results.insertId);
          });
        }
      });
    });
  },

  // Get chat by ID
  getChatById: (chatId) => {
    return new Promise((resolve, reject) => {
      const query = `
        SELECT c.*, 
               u1.name AS customer_name,
               u1.profile_picture AS customer_profile_picture,
               u2.name AS provider_name,
               u2.profile_picture AS provider_profile_picture
        FROM chats c
        LEFT JOIN users u1 ON c.customer_id = u1.user_id
        LEFT JOIN users u2 ON c.provider_id = u2.user_id
        WHERE c.chat_id = ?
      `;
      connection.query(query, [chatId], (err, results) => {
        if (err) return reject(err);
        resolve(results[0]);
      });
    });
  },

  // Get user's chats
  getUserChats: (userId) => {
    return new Promise((resolve, reject) => {
      const query = `
        SELECT 
          c.*,
          u1.name as customer_name,
          u2.name as provider_name,
          m.message_text as last_message,
          m.sent_at as last_message_time,
          (
            SELECT COUNT(*) 
            FROM messages 
            WHERE chat_id = c.chat_id 
            AND receiver_id = ? 
            AND is_read = 0
          ) as unread_count,
          (
            SELECT message_text
            FROM messages
            WHERE chat_id = c.chat_id
            ORDER BY sent_at DESC
            LIMIT 1
          ) as latest_message
        FROM chats c
        LEFT JOIN users u1 ON c.customer_id = u1.user_id
        LEFT JOIN users u2 ON c.provider_id = u2.user_id
        LEFT JOIN messages m ON c.chat_id = m.chat_id
        WHERE c.customer_id = ? OR c.provider_id = ?
        GROUP BY c.chat_id
        ORDER BY m.sent_at DESC`;
      
      connection.query(query, [userId, userId, userId], (err, results) => {
        if (err) return reject(err);
        // Format the results
        const formattedResults = results.map(chat => ({
          ...chat,
          unread_count: parseInt(chat.unread_count) || 0,
          last_message: chat.latest_message || 'No messages yet'
        }));
        resolve(formattedResults);
      });
    });
  },
  
  // Send a message
  sendMessage: (chatId, senderId, receiverId, messageText) => {
    const query = 'INSERT INTO messages (chat_id, sender_id, receiver_id, message_text, sent_at, is_read) VALUES (?, ?, ?, ?, NOW(), 0)';
    return new Promise((resolve, reject) => {
      connection.query(query, [chatId, senderId, receiverId, messageText], (err, results) => {
        if (err) return reject(err);
        
        // Get the inserted message with sender details
        const messageQuery = `
          SELECT m.*, 
                 u.name AS sender_name, 
                 u.profile_picture AS sender_profile_picture
          FROM messages m
          LEFT JOIN users u ON m.sender_id = u.user_id
          WHERE m.message_id = ?
        `;
        connection.query(messageQuery, [results.insertId], (err, messageResults) => {
          if (err) return reject(err);
          resolve(messageResults[0]);
        });
      });
    });
  },

  // Get chat messages
  getChatMessages: (chatId) => {
    return new Promise((resolve, reject) => {
      const query = `
        SELECT 
          m.*, 
          u.name AS sender_name,
          u.profile_picture AS sender_profile_picture,
          CASE 
            WHEN m.is_read = 0 THEN 'unread'
            ELSE 'read'
          END as status
        FROM messages m
        LEFT JOIN users u ON m.sender_id = u.user_id
        WHERE m.chat_id = ?
        ORDER BY m.sent_at ASC
      `;
      connection.query(query, [chatId], (err, results) => {
        if (err) return reject(err);
        resolve(results);
      });
    });
  },

  // Mark messages as read
  markMessagesAsRead: (chatId, userId) => {
    return new Promise((resolve, reject) => {
      const query = `
        UPDATE messages 
        SET is_read = 1 
        WHERE chat_id = ? AND receiver_id = ? AND is_read = 0
      `;
      connection.query(query, [chatId, userId], (err, results) => {
        if (err) return reject(err);
        resolve(results);
      });
    });
  },

  // Get unread message count
  getUnreadCount: (userId) => {
    return new Promise((resolve, reject) => {
      const query = `
        SELECT COUNT(*) as total_unread
        FROM messages
        WHERE receiver_id = ? AND is_read = 0
      `;
      connection.query(query, [userId], (err, results) => {
        if (err) return reject(err);
        resolve(parseInt(results[0].total_unread) || 0);
      });
    });
  },

  // Delete a message (soft delete)
  deleteMessage: (messageId, userId) => {
    return new Promise((resolve, reject) => {
      const query = 'UPDATE messages SET is_deleted = 1 WHERE message_id = ? AND sender_id = ?';
      connection.query(query, [messageId, userId], (err, results) => {
        if (err) return reject(err);
        resolve(results);
      });
    });
  },

  // Mark single message as read
  markMessageAsRead: (messageId, userId) => {
    return new Promise((resolve, reject) => {
      const query = `
        UPDATE messages 
        SET is_read = 1 
        WHERE message_id = ? AND receiver_id = ?
      `;
      connection.query(query, [messageId, userId], (err, results) => {
        if (err) return reject(err);
        resolve(results);
      });
    });
  },

  // Get message by ID
  getMessageById: (messageId) => {
    return new Promise((resolve, reject) => {
      const query = `
        SELECT 
          m.*, 
          u.name AS sender_name,
          u.profile_picture AS sender_profile_picture
        FROM messages m
        LEFT JOIN users u ON m.sender_id = u.user_id
        WHERE m.message_id = ?
      `;
      connection.query(query, [messageId], (err, results) => {
        if (err) return reject(err);
        resolve(results[0] || null);
      });
    });
  },
};

module.exports = messageOperation;
