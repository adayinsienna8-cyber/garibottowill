const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const app = express();
app.use(cors());
app.use(express.json());

// JWT SECRET
const JWT_SECRET = "mySecretKey123";

// CONNECT TO MONGODB
mongoose.connect("mongodb+srv://hollysonders48_db_user:r5Ix3nRBdyk6fokL@maynor.hyna9tr.mongodb.net/investmentDB")
  .then(() => console.log("MongoDB Connected 🚀"))
  .catch((err) => console.log("MongoDB Error ❌", err.message));

// USER MODEL
const userSchema = new mongoose.Schema({
  email: { type: String, unique: true },
  password: String,
  balance: { type: Number, default: 0 }
});

const User = mongoose.model("User", userSchema);

// TEST ROUTE
app.get("/", (req, res) => {
  res.json({ message: "Backend is working 🚀" });
});


// =======================
// REGISTER ROUTE
// =======================
app.post("/register", async (req, res) => {
  try {
    const { email, password } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      email,
      password: hashedPassword,
      balance: 0
    });

    await newUser.save();

    res.json({ message: "User registered successfully 🚀" });

  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});


// =======================
// LOGIN ROUTE (TOKEN GENERATED HERE)
// =======================
app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Wrong password" });
    }

    const token = jwt.sign(
      { userId: user._id, email: user.email },
      JWT_SECRET,
      { expiresIn: "1h" }
    );

    // 👇 THIS IS IMPORTANT (YOU WILL SEE TOKEN HERE)
    res.json({
      message: "Login successful 🚀",
      token: token
    });

  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});


// =======================
// TOKEN CHECK MIDDLEWARE
// =======================
const verifyToken = (req, res, next) => {
  const token = req.headers["authorization"];

  if (!token) {
    return res.status(401).json({ message: "No token provided" });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ message: "Invalid token" });
  }
};


// =======================
// DASHBOARD (PROTECTED)
// =======================
app.get("/dashboard", verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);

    res.json({
      email: user.email,
      balance: user.balance
    });

  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});


// =======================
// DEPOSIT ROUTE
// =======================
app.post("/deposit", verifyToken, async (req, res) => {
  try {
    const { amount } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({ message: "Invalid amount" });
    }

    const user = await User.findById(req.user.userId);

    user.balance += Number(amount);

    await user.save();

    res.json({
      message: "Deposit successful 🚀",
      newBalance: user.balance
    });

  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});


// =======================
// START SERVER
// =======================
app.listen(3001, () => {
  console.log("Server running on http://localhost:3001");
});