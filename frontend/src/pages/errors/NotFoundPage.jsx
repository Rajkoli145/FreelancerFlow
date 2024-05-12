import React from "react";
import { useNavigate } from "react-router-dom";
import { Home, Mail, FileQuestion } from "lucide-react";

const NotFoundPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#F7F7FB] flex items-center justify-center px-6">
      <div className="max-w-lg w-full">
        {/* Card Container */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
          {/* Icon Illustration */}
          <div className="mb-6">
            <div className="w-24 h-24 bg-indigo-50 rounded-full flex items-center justify-center mx-auto">
              <FileQuestion className="w-12 h-12 text-indigo-600" />
            </div>
          </div>

          {/* Error Code */}
          <div className="mb-4">
            <h1 className="text-6xl font-bold text-gray-900 mb-2">404</h1>
            <h2 className="text-2xl font-semibold text-gray-900">
              Page Not Found
            </h2>
          </div>

          {/* Description */}
          <p className="text-gray-600 mb-8 leading-relaxed">
            The page you're looking for doesn't exist or has been moved.
            Please check the URL or return to the homepage.
          </p>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={() => navigate("/")}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg transition-colors shadow-sm"
            >
              <Home className="w-4 h-4" />
              Go Back Home
            </button>
            <button
              onClick={() => navigate("/settings")}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 bg-white hover:bg-gray-50 border border-gray-300 text-gray-700 font-medium rounded-lg transition-colors"
            >
              <Mail className="w-4 h-4" />
              Contact Support
            </button>
          </div>

          {/* Error Code Footer */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <p className="text-xs text-gray-400 font-mono">Error Code: 404</p>
          </div>
        </div>

        {/* Quick Links (Optional) */}
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-500 mb-3">Quick links:</p>
          <div className="flex items-center justify-center gap-4 text-sm">
            <button
              onClick={() => navigate("/dashboard")}
              className="text-indigo-600 hover:text-indigo-700 font-medium"
            >
              Dashboard
            </button>
            <span className="text-gray-300">•</span>
            <button
              onClick={() => navigate("/projects")}
              className="text-indigo-600 hover:text-indigo-700 font-medium"
            >
              Projects
            </button>
            <span className="text-gray-300">•</span>
            <button
              onClick={() => navigate("/invoices")}
              className="text-indigo-600 hover:text-indigo-700 font-medium"
            >
              Invoices
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotFoundPage;
