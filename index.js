const fetch = require('node-fetch'); // Ensure you have node-fetch installed
const express = require("express");
const http = require("http");
const morgan = require("morgan");
const dotenv = require("dotenv");
const cors = require("cors");
const path = require("path");
const { Server } = require("socket.io");
const setupChatHandlers = require("./Helper/chatHandler");
require('./Helper/notificationCron');

dotenv.config();
const PORT = process.env.PORT || 8000;

const app = express();
const server = http.createServer(app);

// Initialize Socket.IO
const io = new Server(server, {
  cors: {
    origin: "*", 
    methods: ["GET", "POST"],
    allowedHeaders: ["Authorization"],
    credentials: true,
  },
  transports: ["websocket", "polling"],
});

// Socket.io connection handling
io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  socket.on("newUser", (userId) => {
    if (!userId) {
      console.error("User ID is required for authentication");
      return;
    }
    console.log(`User ${userId} registered with socket ${socket.id}`);
    socket.data.userId = userId;
  });

  socket.on("join_chat", (chatId) => {
    if (!chatId) {
      console.error("Chat ID is required");
      return;
    }
    socket.join(chatId);
    console.log(`User ${socket.id} joined chat: ${chatId}`);
  });

  socket.on("sendMessage", (message) => {
    if (!message.chatId || !message.text) {
      console.error("Invalid message data:", message);
      return;
    }
    console.log(`New message in chat ${message.chatId}`);
    io.to(message.chatId).emit("newMessage", message);
  });

  socket.on("disconnect", () => {
    console.log(`User ${socket.id} disconnected`);
  });

  socket.on("error", (error) => {
    console.error("Socket error:", error);
  });
});

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(morgan("dev"));

// Serve static files
app.use(express.static(path.join(__dirname, "public")));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use(express.static(path.join(__dirname, "./kazimtaani/build")));

// Routes
const userRoutes = require("./Routes/userRoutes");
const categoryRoutes = require("./Routes/categorRoutes");
const servicesRoutes = require("./Routes/servicesRoutes");
const reviewsRoutes = require("./Routes/reviewsRoutes");
const bookingRoutes = require("./Routes/bookingRoutes");
const messageRoutes = require("./Routes/messageRoutes");

app.use("/api/users", userRoutes);
app.use("/api", categoryRoutes);
app.use("/api", servicesRoutes);
app.use("/api", reviewsRoutes);
app.use("/api", bookingRoutes);
app.use("/api", messageRoutes);

// Catch-all route for React should be last
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "./kazimtaani/build", "index.html"));
});

// Setup chat handlers
setupChatHandlers(io);

server.listen(PORT, () => {
  console.log("Server is running on port", PORT);
});

// Notification Functions
async function showNotification(title, body) {
  try {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: title || "New Notification",
        body: body || "You have a new message",
        sound: true,
        priority: Notifications.AndroidNotificationPriority.HIGH,
        badge: 1,
      },
      trigger: null,
    });
  } catch (error) {
    console.error("Error showing notification:", error);
  }
}

async function sendPushNotification(expoPushToken, title, body) {
  const message = {
    to: expoPushToken,
    sound: "default",
    title: title,
    body: body,
    data: { someData: "goes here" },
    priority: "high",
  };

  try {
    const response = await fetch("https://exp.host/--/api/v2/push/send", {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Accept-encoding": "gzip, deflate",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(message),
    });

    const data = await response.json();
    if (response.status !== 200) {
      console.error("Error sending push notification:", data);
    }
  } catch (error) {
    console.error("Error sending push notification:", error);
  }
}

module.exports = { showNotification, sendPushNotification };
