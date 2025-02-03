const express = require("express");
const morgan = require("morgan");
const dotenv = require("dotenv");
const cors = require('cors');
const path = require('path');
const { Server } = require('socket.io');
// const mongoose = require('mongoose');
const setupChatHandlers = require('./Helper/chatHandler');

dotenv.config();
const PORT = process.env.PORT || 8000;  

const app = express();
const server = require('http').createServer(app);

// Initialize Socket.IO
const io = new Server(server, {
    cors: {
        origin: "*", // Be more specific in production
        methods: ["GET", "POST"]
    }
});

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(morgan('dev'));

// Static file serving
app.use(express.static(path.join(__dirname, 'public')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use(express.static(path.join(__dirname, './kazimtaani/build')));
// Routes - Move before the catch-all route 
const userRoutes = require('./Routes/userRoutes');
const categorRoutes= require('./Routes/categorRoutes')
const servircesRoutes = require('./Routes/servicesRoutes')
const reviewsRoutes= require('./Routes/reviewsRoutes')
const bookingRoutes =require('./Routes/bookingRoutes')
const messageRoutes = require('./Routes/messageRoutes');
app.use('/api/users', userRoutes);
app.use('/api',categorRoutes);
app.use('/api',servircesRoutes)
app.use('/api',reviewsRoutes)
app.use('/api',bookingRoutes);
app.use('/api',messageRoutes);
// Catch-all route for React should be last
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, './kazimtaani/build', 'index.html'));
});

// Setup chat handlers
setupChatHandlers(io);

server.listen(PORT, () => {
    console.log('Server is running on port', PORT);
});
