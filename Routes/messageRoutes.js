const express = require('express');
const router = express.Router();

const messageOperation = require('../Model/Message');

// Create a new chat
router.post('/chats', async (req, res) => {
  try {
    console.log('mzigo wa chat ni', req.body)
    const { customer_id, provider_id } = req.body;
    
    if (!customer_id || !provider_id) {
      return res.status(400).json({
        success: false,
        message: 'Customer ID and Provider ID are required'
      });
    }

    const chatId = await messageOperation.createChat(customer_id, provider_id);
    res.status(201).json({
      success: true,
      chat_id: chatId,
      message: 'Chat created successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error creating chat',
      error: error.message
    });
  }
});

// Get chat by ID with messages
router.get('/chats/:chatId', async (req, res) => {
  try {
    const chatId = req.params.chatId;
    const chat = await messageOperation.getChatById(chatId);
    
    if (!chat) {
      return res.status(404).json({
        success: false,
        message: 'Chat not found'
      });
    }

    const messages = await messageOperation.getChatMessages(chatId);
    
    res.json({
      success: true,
      chat,
      messages
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching chat',
      error: error.message
    });
  }
});

// Get user's chats (both as customer and provider)
router.get('/user-chats/:userId', async (req, res) => {
  try {
    const userId = req.params.userId;
    const chats = await messageOperation.getUserChats(userId);
    
    res.json({
      success: true,
      chats
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching user chats',
      error: error.message
    });
  }
});

// Send a message
router.post('/messages', async (req, res) => {
  try {
    console.log('mzigo unaokuja kutoka front end ni',req.body)
    const { chat_id, sender_id, receiver_id, message_text } = req.body;

    if (!chat_id || !sender_id || !receiver_id || !message_text) {
      return res.status(400).json({
        success: false,
        message: 'Chat ID, sender ID, receiver ID, and message text are required'
      });
    }

    const message = await messageOperation.sendMessage(chat_id, sender_id, receiver_id, message_text);
    res.status(201).json({
      success: true,
      message: 'Message sent successfully',
      data: message
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error sending message',
      error: error.message
    });
  }
});

// Get chat messages
router.get('/messages/:chatId', async (req, res) => {
  try {
    const chatId = req.params.chatId;
    const messages = await messageOperation.getChatMessages(chatId);
    
    res.json({
      success: true,
      messages
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching messages',
      error: error.message
    });
  }
});

// Mark messages as read
router.put('/messages/read', async (req, res) => {
  try {
    const { chat_id, user_id } = req.body;
    
    if (!chat_id || !user_id) {
      return res.status(400).json({
        success: false,
        message: 'Chat ID and user ID are required'
      });
    }

    await messageOperation.markMessagesAsRead(chat_id, user_id);
    const unreadCount = await messageOperation.getUnreadCount(user_id);
    
    res.json({
      success: true,
      message: 'Messages marked as read',
      unread_count: unreadCount
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error marking messages as read',
      error: error.message
    });
  }
});



// Get unread message count
router.get('/messages/unread/:userId', async (req, res) => {
  try {
    const userId = req.params.userId;
    const unreadCount = await messageOperation.getUnreadCount(userId);
    
    res.json({
      success: true,
      unread_count: unreadCount
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching unread count',
      error: error.message
    });
  }
});

// Delete a message
router.delete('/messages/:messageId', async (req, res) => {
  try {
    const messageId = req.params.messageId;
    const userId = req.body.user_id; // The user trying to delete the message

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'User ID is required'
      });
    }

    await messageOperation.deleteMessage(messageId, userId);
    res.json({
      success: true,
      message: 'Message deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting message',
      error: error.message
    });
  }
});

module.exports = router;
