// src/components/ComplaintCard.jsx
import React from "react";
import { Link } from "react-router-dom";

// Returns appropriate badge class based on status
const getStatusBadge = (status) => {
  switch (status) {
    case "Pending": return "badge-pending";
    case "In Progress": return "badge-progress";
    case "Resolved": return "badge-resolved";
    case "Rejected": return "badge-rejected";
    default: return "badge-pending";
  }
};

// Returns appropriate badge class based on AI priority
const getPriorityBadge = (priority) => {
  switch (priority) {
    case "High": return "badge-high";
    case "Medium": return "badge-medium";
    case "Low": return "badge-low";
    default: return "badge-medium";
  }
};

const ComplaintCard = ({ complaint, onDelete }) => {
  const { _id, title, category, location, status, createdAt, aiAnalysis } = complaint;

  return (
    <div className="card hover:shadow-md transition-shadow duration-200">
      {/* Header Row */}
      <div className="flex items-start justify-between gap-2 mb-3">
        <h3 className="font-semibold text-gray-800 text-sm leading-snug line-clamp-2 flex-1">
          {title}
        </h3>
        <span className={`shrink-0 ${getStatusBadge(status)}`}>{status}</span>
      </div>

      {/* Meta Info */}
      <div className="flex flex-wrap gap-3 text-xs text-gray-500 mb-3">
        <span className="flex items-center gap-1">
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
          </svg>
          {category}
        </span>
        <span className="flex items-center gap-1">
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
          </svg>
          {location}
        </span>
        <span className="flex items-center gap-1">
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          {new Date(createdAt).toLocaleDateString("en-IN")}
        </span>
      </div>

      {/* AI Analysis Tags */}
      {aiAnalysis?.priority && (
        <div className="flex flex-wrap gap-2 mb-3">
          <span className={getPriorityBadge(aiAnalysis.priority)}>
            🤖 {aiAnalysis.priority} Priority
          </span>
          {aiAnalysis.department && (
            <span className="bg-purple-100 text-purple-700 text-xs font-medium px-2.5 py-0.5 rounded-full">
              {aiAnalysis.department}
            </span>
          )}
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex gap-2 mt-3 pt-3 border-t border-gray-100">
        <Link
          to={`/complaints/${_id}`}
          className="flex-1 text-center text-xs btn-primary py-1.5"
        >
          View Details
        </Link>
        {onDelete && (
          <button
            onClick={() => onDelete(_id)}
            className="text-xs btn-danger py-1.5 px-3"
          >
            Delete
          </button>
        )}
      </div>
    </div>
  );
};

export default ComplaintCard;
