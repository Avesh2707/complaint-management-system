// src/pages/Dashboard.jsx
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import API from "../api/axios";

const StatCard = ({ label, value, color, icon }) => (
  <div className="card flex items-center gap-4">
    <div className={`w-12 h-12 ${color} rounded-xl flex items-center justify-center text-xl shrink-0`}>
      {icon}
    </div>
    <div>
      <p className="text-2xl font-bold text-gray-800">{value}</p>
      <p className="text-sm text-gray-500">{label}</p>
    </div>
  </div>
);

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({ total: 0, pending: 0, progress: 0, resolved: 0 });
  const [recentComplaints, setRecentComplaints] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data } = await API.get("/complaints?limit=5&page=1");
        const complaints = data.complaints || [];
        setRecentComplaints(complaints.slice(0, 5));
        setStats({
          total: data.total || complaints.length,
          pending: complaints.filter((c) => c.status === "Pending").length,
          progress: complaints.filter((c) => c.status === "In Progress").length,
          resolved: complaints.filter((c) => c.status === "Resolved").length,
        });
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const getStatusClass = (status) => {
    const map = {
      Pending: "badge-pending",
      "In Progress": "badge-progress",
      Resolved: "badge-resolved",
      Rejected: "badge-rejected",
    };
    return map[status] || "badge-pending";
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Welcome Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">
          Welcome back, {user?.name?.split(" ")[0]} 👋
        </h1>
        <p className="text-gray-500 mt-1">
          Here's an overview of your complaint management activity.
        </p>
      </div>

      {/* Stats Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="card animate-pulse">
              <div className="h-12 bg-gray-200 rounded-xl w-12 mb-3" />
              <div className="h-6 bg-gray-200 rounded w-16 mb-2" />
              <div className="h-4 bg-gray-200 rounded w-24" />
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard label="Total Complaints" value={stats.total} color="bg-blue-100" icon="📋" />
          <StatCard label="Pending" value={stats.pending} color="bg-yellow-100" icon="⏳" />
          <StatCard label="In Progress" value={stats.progress} color="bg-indigo-100" icon="🔄" />
          <StatCard label="Resolved" value={stats.resolved} color="bg-green-100" icon="✅" />
        </div>
      )}

      {/* Quick Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <Link
          to="/register-complaint"
          className="card flex items-center gap-3 hover:shadow-md transition-shadow cursor-pointer border-2 border-dashed border-blue-200 hover:border-blue-400 bg-blue-50"
        >
          <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
            <span className="text-white text-xl">+</span>
          </div>
          <div>
            <p className="font-semibold text-blue-700">File New Complaint</p>
            <p className="text-xs text-blue-500">Register a complaint with AI analysis</p>
          </div>
        </Link>
        <Link
          to="/complaints"
          className="card flex items-center gap-3 hover:shadow-md transition-shadow cursor-pointer"
        >
          <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center text-xl">
            📋
          </div>
          <div>
            <p className="font-semibold text-gray-700">View All Complaints</p>
            <p className="text-xs text-gray-500">Filter, search, and track complaints</p>
          </div>
        </Link>
        <div className="card flex items-center gap-3 bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-100">
          <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center text-xl">
            🤖
          </div>
          <div>
            <p className="font-semibold text-gray-700">AI Powered</p>
            <p className="text-xs text-gray-500">Priority detection & dept. routing</p>
          </div>
        </div>
      </div>

      {/* Recent Complaints */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-bold text-gray-800">Recent Complaints</h2>
          <Link to="/complaints" className="text-sm text-blue-600 hover:underline">
            View all →
          </Link>
        </div>
        {recentComplaints.length === 0 ? (
          <div className="text-center py-8 text-gray-400">
            <p className="text-4xl mb-2">📭</p>
            <p>No complaints yet. File your first one!</p>
            <Link to="/register-complaint" className="btn-primary text-sm mt-3 inline-block">
              File Complaint
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left py-2 text-gray-500 font-medium">Title</th>
                  <th className="text-left py-2 text-gray-500 font-medium hidden sm:table-cell">Category</th>
                  <th className="text-left py-2 text-gray-500 font-medium hidden md:table-cell">Location</th>
                  <th className="text-left py-2 text-gray-500 font-medium">Status</th>
                  <th className="text-left py-2 text-gray-500 font-medium">AI Priority</th>
                </tr>
              </thead>
              <tbody>
                {recentComplaints.map((c) => (
                  <tr key={c._id} className="border-b border-gray-50 hover:bg-gray-50">
                    <td className="py-3">
                      <Link to={`/complaints/${c._id}`} className="text-blue-600 hover:underline font-medium">
                        {c.title.length > 35 ? c.title.slice(0, 35) + "..." : c.title}
                      </Link>
                    </td>
                    <td className="py-3 text-gray-600 hidden sm:table-cell">{c.category}</td>
                    <td className="py-3 text-gray-600 hidden md:table-cell">{c.location}</td>
                    <td className="py-3">
                      <span className={getStatusClass(c.status)}>{c.status}</span>
                    </td>
                    <td className="py-3">
                      {c.aiAnalysis?.priority ? (
                        <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                          c.aiAnalysis.priority === "High"
                            ? "bg-red-100 text-red-700"
                            : c.aiAnalysis.priority === "Medium"
                            ? "bg-yellow-100 text-yellow-700"
                            : "bg-green-100 text-green-700"
                        }`}>
                          {c.aiAnalysis.priority}
                        </span>
                      ) : (
                        <span className="text-gray-400 text-xs">Not analyzed</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
