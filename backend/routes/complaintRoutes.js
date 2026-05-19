// routes/complaintRoutes.js
// All complaint-related API endpoints

const express = require("express");
const router = express.Router();
const { body } = require("express-validator");
const {
  addComplaint,
  getAllComplaints,
  getComplaintById,
  updateComplaintStatus,
  deleteComplaint,
  searchByLocation,
} = require("../controllers/complaintController");
const { protect } = require("../middleware/authMiddleware");

// Validation for adding a complaint
const complaintValidation = [
  body("name").notEmpty().withMessage("Name is required"),
  body("email").isEmail().withMessage("Valid email is required"),
  body("title")
    .isLength({ min: 5 })
    .withMessage("Title must be at least 5 characters"),
  body("description")
    .isLength({ min: 10 })
    .withMessage("Description must be at least 10 characters"),
  body("category").notEmpty().withMessage("Category is required"),
  body("location").notEmpty().withMessage("Location is required"),
];

// @route  GET  /api/complaints/search?location=...
router.get("/search", protect, searchByLocation);

// @route  POST /api/complaints
router.post("/", protect, complaintValidation, addComplaint);

// @route  GET  /api/complaints
router.get("/", protect, getAllComplaints);

// @route  GET  /api/complaints/:id
router.get("/:id", protect, getComplaintById);

// @route  PUT  /api/complaints/:id
router.put("/:id", protect, updateComplaintStatus);

// @route  DELETE /api/complaints/:id
router.delete("/:id", protect, deleteComplaint);

module.exports = router;
