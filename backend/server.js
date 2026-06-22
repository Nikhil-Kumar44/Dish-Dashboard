const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const dishRoutes = require('./routes/dishRoutes');

// Load environment variables from .env file
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Create HTTP server to integrate with Socket.io
const server = http.createServer(app);

// Initialize Socket.io with CORS configuration
const io = socketIo(server, {
  cors: {
    origin: '*', // In production, replace with specific frontend URL for security
    methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE'],
    credentials: true
  }
});

// Middleware
app.use(cors());
app.use(express.json()); // Parse incoming JSON requests

// Middleware to attach Socket.io instance to the request object.
// This allows us to access 'io' in our route controllers and emit events.
app.use((req, res, next) => {
  req.io = io;
  next();
});

// Routes
app.use('/api/dishes', dishRoutes);

// Simple root check endpoint
app.get('/', (req, res) => {
  res.send('Dish Dashboard Backend Server is running...');
});

// Socket.io Connection Event Handler
io.on('connection', (socket) => {
  console.log(`New client connected: ${socket.id}`);

  socket.on('disconnect', () => {
    console.log(`Client disconnected: ${socket.id}`);
  });
});

// Connect to MongoDB using Mongoose
const mongoUri = process.env.MONGODB_URI;

if (!mongoUri) {
  console.error('CRITICAL ERROR: MONGODB_URI is not defined in the environment variables.');
  process.exit(1);
}

mongoose.connect(mongoUri)
  .then(() => {
    console.log('Successfully connected to MongoDB.');
    // Start the server only after a successful database connection
    server.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
      console.log(`Socket.io server is initialized and listening`);
    });
  })
  .catch((error) => {
    console.error('Database connection error:', error);
    process.exit(1);
  });
