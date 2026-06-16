const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    await mongoose.connect("mongodb+srv://hollysonders48_db_user:r5Ix3nRBdyk6fokL@maynor.hyna9tr.mongodb.net/investmentDB");
    console.log("MongoDB Connected 🚀");
  } catch (error) {
    console.log("MongoDB connection failed ❌", error.message);
  }
};

module.exports = connectDB;