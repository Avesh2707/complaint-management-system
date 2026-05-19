// src/pages/ComplaintForm.jsx
// Complaint Registration Form with live AI quick-analysis preview

import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api/axios";
import toast from "react-hot-toast";

const CATEGORIES = [
  "Water Supply",
  "Electricity",
  "Roads",
  "Sanitation",
  "Health",
  "Education",
  "Public Safety",
  "Other",
];

const ComplaintForm = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: "",
    email: "",
    title: "",
    description: "",
    category: "",
    location: "",
  });
  const [loading, setLoading] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiPreview, setAiPreview] = useState(null);

  const handleChange = (e) =>
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  // Quick AI preview before submission
  const handleAiPreview = async () => {
    if (!form.title || !form.description) {
      return toast.error("Enter title and description for AI preview");
    }
    setAiLoading(true);
    setAiPreview(null);
    try {
      const { data } = await API.post("/ai/quick-analyze", {
        title: form.title,
        description: form.description,
        category: form.category,
        location: form.location,
      });
      setAiPreview(data.aiAnalysis);
      toast.success("AI analysis preview ready!");
    } catch (err) {
      toast.error("AI preview failed. Check API key.");
    } finally {
      setAiLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await API.post("/complaints", form);
      toast.success("Complaint registered successfully! 🎉");
      // Auto-trigger AI analysis on the saved complaint
      try {
        await API.post("/ai/analyze", { complaintId: data.complaint._id });
        toast.success("AI analysis complete! 🤖");
      } catch {
        // AI analysis is optional; complaint is already saved
      }
      navigate(`/complaints/${data.complaint._id}`);
    } catch (err) {
      const msg =
        err.response?.data?.errors?.[0]?.msg ||
        err.response?.data?.message ||
        "Failed to register complaint";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Register a Complaint</h1>
        <p className="text-gray-500 mt-1">
          Fill in the details below. Our AI will automatically analyze and route your complaint.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Form */}
        <div className="lg:col-span-2">
          <div className="card">
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Name & Email */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    className="input-field"
                    placeholder="Rahul Kumar"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email Address <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    className="input-field"
                    placeholder="rahul@gmail.com"
                    required
                  />
                </div>
              </div>

              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Complaint Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="title"
                  value={form.title}
                  onChange={handleChange}
                  className="input-field"
                  placeholder="e.g., Water Leakage Issue in Market Area"
                  required
                />
              </div>

              {/* Category & Location */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Category <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="category"
                    value={form.category}
                    onChange={handleChange}
                    className="input-field"
                    required
                  >
                    <option value="">Select category</option>
                    {CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Location <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="location"
                    value={form.location}
                    onChange={handleChange}
                    className="input-field"
                    placeholder="e.g., Ghaziabad, Sector 5"
                    required
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Complaint Description <span className="text-red-500">*</span>
                </label>
                <textarea
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  className="input-field"
                  rows={5}
                  placeholder="Describe the issue in detail. Include time, location specifics, and any relevant context..."
                  required
                />
              </div>

              {/* AI Preview Button */}
              <button
                type="button"
                onClick={handleAiPreview}
                disabled={aiLoading}
                className="w-full py-2 border-2 border-dashed border-purple-300 text-purple-600 rounded-lg font-medium text-sm hover:bg-purple-50 transition-colors disabled:opacity-50"
              >
                {aiLoading ? "🤖 Analyzing..." : "🤖 Preview AI Analysis (Optional)"}
              </button>

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full py-3"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Submitting...
                  </span>
                ) : "Submit Complaint"}
              </button>
            </form>
          </div>
        </div>

        {/* AI Preview Panel */}
        <div className="space-y-4">
          {/* AI Info */}
          <div className="card bg-gradient-to-br from-purple-50 to-indigo-50 border border-purple-100">
            <h3 className="font-semibold text-purple-800 mb-2 flex items-center gap-2">
              🤖 AI Features
            </h3>
            <ul className="text-sm text-purple-700 space-y-1">
              <li>✓ Priority Detection</li>
              <li>✓ Department Routing</li>
              <li>✓ Complaint Summary</li>
              <li>✓ Auto Response Generation</li>
            </ul>
          </div>

          {/* AI Preview Result */}
          {aiPreview && (
            <div className="card border border-purple-200">
              <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                🤖 AI Preview
              </h3>
              <div className="space-y-3">
                <div>
                  <p className="text-xs text-gray-500 font-medium uppercase">Priority</p>
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                    aiPreview.priority === "High"
                      ? "bg-red-100 text-red-700"
                      : aiPreview.priority === "Medium"
                      ? "bg-yellow-100 text-yellow-700"
                      : "bg-green-100 text-green-700"
                  }`}>
                    {aiPreview.priority}
                  </span>
                </div>
                <div>
                  <p className="text-xs text-gray-500 font-medium uppercase">Department</p>
                  <p className="text-sm text-gray-700">{aiPreview.department}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 font-medium uppercase">Summary</p>
                  <p className="text-sm text-gray-700 italic">"{aiPreview.summary}"</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 font-medium uppercase">Auto Response</p>
                  <p className="text-sm text-gray-700 bg-gray-50 p-2 rounded">
                    {aiPreview.autoResponse}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ComplaintForm;
