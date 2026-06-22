const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Dish = require('./models/Dish');

// Load environment variables from .env
dotenv.config();

// Sample dish data
const sampleDishes = [
  {
    dishId: "D101",
    dishName: "Margherita Pizza",
    imageUrl: "https://images.unsplash.com/photo-1604382355076-af4b0eb60143?w=500&auto=format&fit=crop&q=80",
    isPublished: true
  },
  {
    dishId: "D102",
    dishName: "Spaghetti Carbonara",
    imageUrl: "https://images.unsplash.com/photo-1612874742237-6526221588e3?w=500&auto=format&fit=crop&q=80",
    isPublished: true
  },
  {
    dishId: "D103",
    dishName: "Caesar Salad",
    imageUrl: "https://images.unsplash.com/photo-1550304943-4f24f54ddde9?w=500&auto=format&fit=crop&q=80",
    isPublished: false
  },
  {
    dishId: "D104",
    dishName: "Chicken Biryani",
    imageUrl: "https://images.unsplash.com/photo-1633945274405-b6c8069047b0?w=500&auto=format&fit=crop&q=80",
    isPublished: true
  },
  {
    dishId: "D105",
    dishName: "Chocolate Lava Cake",
    imageUrl: "https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=500&auto=format&fit=crop&q=80",
    isPublished: false
  }
];

const seedDatabase = async () => {
  const mongoUri = process.env.MONGODB_URI;

  if (!mongoUri) {
    console.error('Error: MONGODB_URI is not defined in the environment variables.');
    process.exit(1);
  }

  try {
    console.log('Connecting to MongoDB for seeding...');
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB.');

    // Delete existing dishes to avoid duplicate keys during seeding
    console.log('Clearing existing dishes from database...');
    await Dish.deleteMany({});
    console.log('Database cleared.');

    // Insert new sample dishes
    console.log('Inserting sample dishes...');
    const insertedDishes = await Dish.insertMany(sampleDishes);
    console.log(`Successfully seeded ${insertedDishes.length} dishes into the database!`);

    // Close the connection
    await mongoose.connection.close();
    console.log('MongoDB connection closed.');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding the database:', error);
    await mongoose.connection.close();
    process.exit(1);
  }
};

// Execute seeding
seedDatabase();
