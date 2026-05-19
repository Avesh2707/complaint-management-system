// src/pages/ComplaintList.jsx
// View all complaints with category filter, location search, status update

import React, { useEffect, useState, useCallback } from "react";
import API from "../api/axios";
import ComplaintCard from "../components/ComplaintCard";
import { useAuth } from "../context/AuthContext";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";

const CATEGORIES = ["", "Water Supply", "Electricity", "Roads", "Sanitation", "Health", "Education", "Public Safety", "Other"];
const STATUSES = ["", "Pending", "In Progress", "Resolved", "Rejected"];

const ComplaintList = () => {
  const { user } = useAuth();
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);

  // Filters
  const [categoryFilter, setCategoryFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [locationQuery, setLocationQuery] = useState("");
  const [searchMode, setSearchMode] = useState(false); // true = location search mode

  const fetchComplaints = useCallback(async () => {
    setLoading(true);
    try {
      let url = `/complaints?page=${page}&limit=9`;
      if (categoryFilter) url += `&category=${encodeURIComponent(categoryFilter)}`;
      if (statusFilter) url += `&status=${encodeURIComponent(statusFilter)}`;
      const { data } = await API.get(url);
      setComplaints(data.complaints || []);
      setTotal(data.total || 0);
      setPages(data.pages || 1);
    } catch (err) {
      toast.error("Failed to load complaints");
    } finally {
      setLoading(false);
    }
  }, [page, categoryFilter, statusFilter]);

  useEffect(() => {
    if (!searchMode) fetchComplaints();
  }, [fetchComplaints, searchMode]);

  // Location search
  const handleLocationSearch = async () => {
    if (!locationQuery.trim()) {
      setSearchMode(false);
      fetchComplaints();
      return;
    }
    setLoading(true);
    setSearchMode(true);
    try {
      const { data } = await API.get(
        `/complaints/search?location=${encodeURIComponent(locationQuery)}`
      );
      setComplaints(data.complaints || []);
      setTotal(data.total || 0);
      setPages(1);
    } catch {
      toast.error("Location search failed");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this complaint?")) return;
    try {
      await API.delete(`/complaints/${id}`);
      toast.success("Complaint deleted");
      fetchComplaints();
    } catch (err) {
      toast.error(err.response?.data?.message || "Delete failed");
    }
  };

  const clearFilters = () => {
    setCategoryFilter("");
    setStatusFilter("");
    setLocationQuery("");
    setSearchMode(false);
    setPage(1);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Complaints</h1>
          <p className="text-gray-500 mt-1">{total} complaint{total !== 1 ? "s" : ""} found</p>
        </div>
        <Link to="/register-complaint" className="btn-primary text-sm">
          + New Complaint
        </Link>
      </div>

      {/* Filters */}
      <div className="card mb-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Category */}
          <select
            value={categoryFilter}
            onChange={(e) => { setCategoryFilter(e.target.value); setPage(1); setSearchMode(false); }}
            className="input-field text-sm"
          >
            <option value="">All Categories</option>
            {CATEGORIES.filter(Boolean).map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>

          {/* Status */}
          <select
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setPage(1); setSearchMode(false); }}
            className="input-field text-sm"
          >
            <option value="">All Statuses</option>
            {STATUSES.filter(Boolean).map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>

          {/* Location Search */}
          <div className="flex gap-2 lg:col-span-2">
            <input
              type="text"
              value={locationQuery}
              onChange={(e) => setLocationQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleLocationSearch()}
              className="input-field text-sm flex-1"
              placeholder="Search by location (e.g. Ghaziabad)"
            />
            <button onClick={handleLocationSearch} className="btn-primary text-sm px-3">
              Search
            </button>
            {(categoryFilter || statusFilter || locationQuery) && (
              <button onClick={clearFilters} className="btn-secondary text-sm px-3">
                Clear
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Complaint Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="card animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-3" />
              <div className="h-3 bg-gray-200 rounded w-1/2 mb-2" />
              <div className="h-3 bg-gray-200 rounded w-2/3" />
            </div>
          ))}
        </div>
      ) : complaints.length === 0 ? (
        <div className="text-center py-16 card">
          <p className="text-5xl mb-3">📭</p>
          <h3 className="text-lg font-semibold text-gray-700">No complaints found</h3>
          <p className="text-gray-400 mb-4">Try changing filters or file a new complaint</p>
          <Link to="/register-complaint" className="btn-primary">
            File First Complaint
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {complaints.map((c) => (
            <ComplaintCard
              key={c._id}
              complaint={c}
              onDelete={user?.role === "admin" || c.user?._id === user?._id ? handleDelete : null}
            />
          ))}
        </div>
      )}

      {/* Pagination */}
      {pages > 1 && !searchMode && (
        <div className="flex items-center justify-center gap-2 mt-8">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="btn-secondary text-sm py-1.5 px-3 disabled:opacity-40"
          >
            ← Prev
          </button>
          <span className="text-sm text-gray-600">
            Page {page} of {pages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(pages, p + 1))}
            disabled={page === pages}
            className="btn-secondary text-sm py-1.5 px-3 disabled:opacity-40"
          >
            Next →
          </button>
        </div>
      )}
    </div>
  );
};

export default ComplaintList;
