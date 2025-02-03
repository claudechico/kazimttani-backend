const Message = require('../Model/Message'); // Assuming you have a Message model

function setupChatHandlers(io) {
    io.on('connection', (socket) => {
        console.log('User connected:', socket.id);

        // Join a chat room
        socket.on('join_room', (roomId) => {
            socket.join(roomId);
            console.log(`User ${socket.id} joined room ${roomId}`);
        });

        // Handle new message
        socket.on('send_message', async (messageData) => {
            try {
                const { sender, receiver, content, roomId } = messageData;
                
                // Save message to database
                const newMessage = await Message.create({
                    sender,
                    receiver,
                    content,
                    roomId
                });

                // Broadcast message to room
                io.to(roomId).emit('receive_message', newMessage);
            } catch (error) {
                console.error('Error sending message:', error);
                socket.emit('message_error', { error: 'Failed to send message' });
            }
        });

        // Handle typing status
        socket.on('typing', (data) => {
            socket.to(data.roomId).emit('typing_status', {
                userId: data.userId,
                isTyping: data.isTyping
            });
        });

        socket.on('disconnect', () => {
            console.log('User disconnected:', socket.id);
        });
    });
}

module.exports = setupChatHandlers;
