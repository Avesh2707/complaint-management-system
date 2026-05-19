// models/Complaint.js
// Mongoose schema for Complaint registration

const mongoose = require("mongoose");

const ComplaintSchema = new mongoose.Schema(
  {
    // User who filed the complaint
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      match: [/^\S+@\S+\.\S+$/, "Please enter a valid email"],
    },
    title: {
      type: String,
      required: [true, "Complaint title is required"],
      trim: true,
      minlength: [5, "Title must be at least 5 characters"],
    },
    description: {
      type: String,
      required: [true, "Description is required"],
      minlength: [10, "Description must be at least 10 characters"],
    },
    category: {
      type: String,
      required: [true, "Category is required"],
      enum: [
        "Water Supply",
        "Electricity",
        "Roads",
        "Sanitation",
        "Health",
        "Education",
        "Public Safety",
        "Other",
      ],
    },
    location: {
      type: String,
      required: [true, "Location is required"],
      trim: true,
    },
    status: {
      type: String,
      enum: ["Pending", "In Progress", "Resolved", "Rejected"],
      default: "Pending",
    },
    // AI Analysis Results stored in DB
    aiAnalysis: {
      priority: { type: String, default: "" },         // High / Medium / Low
      department: { type: String, default: "" },        // Suggested dept
      summary: { type: String, default: "" },           // AI Summary
      autoResponse: { type: String, default: "" },      // Auto-generated reply
      analyzedAt: { type: Date },
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Complaint", ComplaintSchema);
