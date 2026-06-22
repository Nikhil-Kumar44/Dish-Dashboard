const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const dishRoutes = require('./routes/dishRoutes');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const server = http.createServer(app);

const io = socketIo(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE'],
    credentials: true
  }
});

app.use(cors());
app.use(express.json());

// Attach socket instance to requests for use in route controllers
app.use((req, res, next) => {
  req.io = io;
  next();
});

app.use('/api/dishes', dishRoutes);

app.get('/', (req, res) => {
  res.send('Dish Dashboard Backend Server is running...');
});

io.on('connection', (socket) => {
  console.log(`New client connected: ${socket.id}`);
  socket.on('disconnect', () => {
    console.log(`Client disconnected: ${socket.id}`);
  });
});

const mongoUri = process.env.MONGODB_URI;
if (!mongoUri) {
  console.error('CRITICAL ERROR: MONGODB_URI is not defined in the environment variables.');
  process.exit(1);
}

mongoose.connect(mongoUri)
  .then(() => {
    console.log('Successfully connected to MongoDB.');
    server.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.error('Database connection error:', error);
    process.exit(1);
  });
