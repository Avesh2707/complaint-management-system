// routes/authRoutes.js
// Authentication routes: Register, Login, Profile

const express = require("express");
const router = express.Router();
const { body } = require("express-validator");
const { registerUser, loginUser, getUserProfile } = require("../controllers/authController");
const { protect } = require("../middleware/authMiddleware");

// Validation rules for registration
const registerValidation = [
  body("name").notEmpty().withMessage("Name is required").trim(),
  body("email").isEmail().withMessage("Enter a valid email"),
  body("password")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters"),
];

// Validation rules for login
const loginValidation = [
  body("email").isEmail().withMessage("Enter a valid email"),
  body("password").notEmpty().withMessage("Password is required"),
];

// @route  POST /api/auth/register
router.post("/register", registerValidation, registerUser);

// @route  POST /api/auth/login
router.post("/login", loginValidation, loginUser);

// @route  GET /api/auth/profile
router.get("/profile", protect, getUserProfile);

module.exports = router;
