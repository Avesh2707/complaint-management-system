// src/pages/ComplaintDetail.jsx
// Detailed view of a complaint with AI analysis results and status update

import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import API from "../api/axios";
import toast from "react-hot-toast";
import { useAuth } from "../context/AuthContext";

const STATUSES = ["Pending", "In Progress", "Resolved", "Rejected"];

const getStatusClass = (status) => {
  const map = {
    Pending: "badge-pending",
    "In Progress": "badge-progress",
    Resolved: "badge-resolved",
    Rejected: "badge-rejected",
  };
  return map[status] || "badge-pending";
};

const getPriorityClass = (p) =>
  p === "High" ? "badge-high" : p === "Medium" ? "badge-medium" : "badge-low";

const ComplaintDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [complaint, setComplaint] = useState(null);
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [newStatus, setNewStatus] = useState("");

  useEffect(() => {
    const fetch = async () => {
      try {
        const { data } = await API.get(`/complaints/${id}`);
        setComplaint(data);
        setNewStatus(data.status);
      } catch (err) {
        toast.error("Complaint not found");
        navigate("/complaints");
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [id]);

  const handleAiAnalyze = async () => {
    setAnalyzing(true);
    try {
      const { data } = await API.post("/ai/analyze", { complaintId: id });
      setComplaint((prev) => ({ ...prev, aiAnalysis: data.aiAnalysis }));
      toast.success("AI analysis complete! 🤖");
    } catch (err) {
      toast.error("AI analysis failed: " + (err.response?.data?.message || err.message));
    } finally {
      setAnalyzing(false);
    }
  };

  const handleStatusUpdate = async () => {
    if (!newStatus || newStatus === complaint.status) return;
    setUpdatingStatus(true);
    try {
      const { data } = await API.put(`/complaints/${id}`, { status: newStatus });
      setComplaint((prev) => ({ ...prev, status: data.complaint.status }));
      toast.success("Status updated successfully");
    } catch (err) {
      toast.error(err.response?.data?.message || "Status update failed");
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Delete this complaint permanently?")) return;
    try {
      await API.delete(`/complaints/${id}`);
      toast.success("Complaint deleted");
      navigate("/complaints");
    } catch (err) {
      toast.error(err.response?.data?.message || "Delete failed");
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="card animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-3/4 mb-4" />
          <div className="h-4 bg-gray-200 rounded w-1/2 mb-3" />
          <div className="h-4 bg-gray-200 rounded w-full mb-2" />
          <div className="h-4 bg-gray-200 rounded w-5/6" />
        </div>
      </div>
    );
  }

  if (!complaint) return null;

  const { title, name, email, category, location, description, status, createdAt, aiAnalysis } = complaint;
  const isAdmin = user?.role === "admin";

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Back Button */}
      <Link to="/complaints" className="text-blue-600 text-sm flex items-center gap-1 mb-4 hover:underline">
        ← Back to Complaints
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Details */}
        <div className="lg:col-span-2 space-y-4">
          {/* Complaint Info Card */}
          <div className="card">
            <div className="flex flex-wrap items-start justify-between gap-2 mb-4">
              <h1 className="text-xl font-bold text-gray-900 flex-1">{title}</h1>
              <span className={getStatusClass(status)}>{status}</span>
            </div>

            {/* Meta */}
            <div className="grid grid-cols-2 gap-y-3 text-sm mb-4">
              <div>
                <p className="text-gray-400 text-xs uppercase font-medium">Filed By</p>
                <p className="text-gray-700 font-medium">{name}</p>
              </div>
              <div>
                <p className="text-gray-400 text-xs uppercase font-medium">Email</p>
                <p className="text-gray-700">{email}</p>
              </div>
              <div>
                <p className="text-gray-400 text-xs uppercase font-medium">Category</p>
                <p className="text-gray-700">{category}</p>
              </div>
              <div>
                <p className="text-gray-400 text-xs uppercase font-medium">Location</p>
                <p className="text-gray-700">{location}</p>
              </div>
              <div>
                <p className="text-gray-400 text-xs uppercase font-medium">Filed On</p>
                <p className="text-gray-700">
                  {new Date(createdAt).toLocaleDateString("en-IN", {
                    year: "numeric", month: "long", day: "numeric",
                  })}
                </p>
              </div>
              <div>
                <p className="text-gray-400 text-xs uppercase font-medium">Complaint ID</p>
                <p className="text-gray-500 text-xs font-mono">{complaint._id}</p>
              </div>
            </div>

            {/* Description */}
            <div>
              <p className="text-gray-400 text-xs uppercase font-medium mb-1">Description</p>
              <p className="text-gray-700 text-sm leading-relaxed whitespace-pre-line bg-gray-50 p-3 rounded-lg">
                {description}
              </p>
            </div>
          </div>

          {/* AI Analysis Result Card */}
          <div className="card border border-purple-100">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-gray-800 flex items-center gap-2">
                🤖 AI Analysis Result
              </h2>
              <button
                onClick={handleAiAnalyze}
                disabled={analyzing}
                className="text-sm btn-primary py-1.5 px-3 bg-purple-600 hover:bg-purple-700"
              >
                {analyzing ? "Analyzing..." : aiAnalysis?.priority ? "Re-analyze" : "Run AI Analysis"}
              </button>
            </div>

            {aiAnalysis?.priority ? (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <p className="text-xs text-gray-500 font-medium uppercase mb-1">Priority Level</p>
                    <span className={`text-sm font-bold px-3 py-1 rounded-full ${getPriorityClass(aiAnalysis.priority)}`}>
                      {aiAnalysis.priority === "High" ? "🔴" : aiAnalysis.priority === "Medium" ? "🟡" : "🟢"} {aiAnalysis.priority}
                    </span>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <p className="text-xs text-gray-500 font-medium uppercase mb-1">Responsible Dept.</p>
                    <p className="text-sm font-medium text-gray-700">{aiAnalysis.department}</p>
                  </div>
                </div>
                <div className="bg-blue-50 p-3 rounded-lg border border-blue-100">
                  <p className="text-xs text-blue-500 font-medium uppercase mb-1">AI Summary</p>
                  <p className="text-sm text-gray-700 italic">"{aiAnalysis.summary}"</p>
                </div>
                <div className="bg-green-50 p-3 rounded-lg border border-green-100">
                  <p className="text-xs text-green-600 font-medium uppercase mb-1">Auto-Generated Response to Citizen</p>
                  <p className="text-sm text-gray-700">{aiAnalysis.autoResponse}</p>
                </div>
                {aiAnalysis.analyzedAt && (
                  <p className="text-xs text-gray-400">
                    Analyzed on: {new Date(aiAnalysis.analyzedAt).toLocaleString("en-IN")}
                  </p>
                )}
              </div>
            ) : (
              <div className="text-center py-6 bg-gray-50 rounded-lg">
                <p className="text-3xl mb-2">🤖</p>
                <p className="text-gray-500 text-sm mb-3">
                  No AI analysis yet. Click "Run AI Analysis" to get priority, department, and automated response.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar: Status Update & Actions */}
        <div className="space-y-4">
          {/* Status Update */}
          {isAdmin && (
            <div className="card border border-blue-100">
              <h3 className="font-semibold text-gray-800 mb-3">Update Status</h3>
              <select
                value={newStatus}
                onChange={(e) => setNewStatus(e.target.value)}
                className="input-field text-sm mb-3"
              >
                {STATUSES.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
              <button
                onClick={handleStatusUpdate}
                disabled={updatingStatus || newStatus === status}
                className="btn-primary w-full text-sm py-2 disabled:opacity-50"
              >
                {updatingStatus ? "Updating..." : "Update Status"}
              </button>
            </div>
          )}

          {/* Danger Zone */}
          <div className="card border border-red-100">
            <h3 className="font-semibold text-gray-800 mb-3">Actions</h3>
            <button
              onClick={handleDelete}
              className="btn-danger w-full text-sm py-2"
            >
              🗑 Delete Complaint
            </button>
          </div>

          {/* Info */}
          <div className="card bg-yellow-50 border border-yellow-100">
            <h3 className="font-medium text-yellow-800 mb-2 text-sm">Status Guide</h3>
            <div className="space-y-1 text-xs">
              <p><span className="badge-pending">Pending</span> — Under review</p>
              <p><span className="badge-progress">In Progress</span> — Being resolved</p>
              <p><span className="badge-resolved">Resolved</span> — Completed</p>
              <p><span className="badge-rejected">Rejected</span> — Not applicable</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ComplaintDetail;
