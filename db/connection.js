const mongoose = require("mongoose");

async function connectDB() {
  try {
    const connection = await mongoose.connect(process.env.MONGO_URL);
    if (connection) console.log("Connected to MongoDB");
  } catch (error) {
    throw new Error(error);
  }
}

module.exports = connectDB;
