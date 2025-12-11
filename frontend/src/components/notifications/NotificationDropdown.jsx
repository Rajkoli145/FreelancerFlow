import React from "react";
import {
  FileText,
  Briefcase,
  Users,
  DollarSign,
  Clock,
  ChevronRight,
  Bell,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const NotificationDropdown = ({ onClose }) => {
  const navigate = useNavigate();

  // Mock notifications data
  const notifications = [
    {
      id: 1,
      icon: DollarSign,
      iconColor: "text-green-600",
      iconBg: "bg-green-50",
      title: "Invoice INV-002 paid",
      description: "Payment received from TechStart Inc",
      timestamp: "2h ago",
      isRead: false,
    },
    {
      id: 2,
      icon: Briefcase,
      iconColor: "text-indigo-600",
      iconBg: "bg-indigo-50",
      title: "Milestone completed",
      description: "Website Redesign - Phase 2",
      timestamp: "5h ago",
      isRead: false,
    },
    {
      id: 3,
      icon: Users,
      iconColor: "text-blue-600",
      iconBg: "bg-blue-50",
      title: "New message from Acme Corp",
      description: "Please review design mockups",
      timestamp: "1d ago",
      isRead: false,
    },
    {
      id: 4,
      icon: FileText,
      iconColor: "text-red-600",
      iconBg: "bg-red-50",
      title: "Invoice overdue",
      description: "INV-003 is 5 days late",
      timestamp: "2d ago",
      isRead: true,
    },
  ];

  const handleViewAll = () => {
    navigate("/notifications");
    onClose();
  };

  const handleNotificationClick = (id) => {
    console.log("Notification clicked:", id);
    onClose();
  };

  return (
    <div className="absolute right-0 mt-2 w-96 bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden z-50">
      {/* Header */}
      <div className="px-5 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">Notifications</h3>
          <button
            onClick={handleViewAll}
            className="text-sm text-indigo-600 hover:text-indigo-700 font-medium"
          >
            View All
          </button>
        </div>
      </div>

      {/* Notifications List */}
      <div className="max-h-96 overflow-y-auto">
        {notifications.length > 0 ? (
          notifications.map((notification) => {
            const Icon = notification.icon;
            return (
              <div
                key={notification.id}
                onClick={() => handleNotificationClick(notification.id)}
                className={`px-5 py-4 flex items-start gap-3 cursor-pointer transition-all hover:bg-gray-50 border-b border-gray-100 last:border-0 ${
                  !notification.isRead ? "bg-indigo-50/30" : ""
                }`}
              >
                {/* Status Dot */}
                <div className="flex-shrink-0 mt-2">
                  <div
                    className={`w-2 h-2 rounded-full ${
                      notification.isRead ? "bg-gray-300" : "bg-indigo-600"
                    }`}
                  />
                </div>

                {/* Icon */}
                <div
                  className={`flex-shrink-0 w-10 h-10 ${notification.iconBg} rounded-lg flex items-center justify-center`}
                >
                  <Icon className={`w-5 h-5 ${notification.iconColor}`} />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <h4
                    className={`text-sm font-semibold mb-0.5 ${
                      notification.isRead ? "text-gray-700" : "text-gray-900"
                    }`}
                  >
                    {notification.title}
                  </h4>
                  <p className="text-xs text-gray-500 mb-1">
                    {notification.description}
                  </p>
                  <div className="flex items-center gap-1.5 text-xs text-gray-400">
                    <Clock className="w-3 h-3" />
                    {notification.timestamp}
                  </div>
                </div>

                {/* Arrow */}
                <div className="flex-shrink-0 mt-2">
                  <ChevronRight className="w-4 h-4 text-gray-400" />
                </div>
              </div>
            );
          })
        ) : (
          /* Empty State */
          <div className="px-5 py-12 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <Bell className="w-8 h-8 text-gray-400" />
            </div>
            <p className="text-sm text-gray-500">No new notifications</p>
          </div>
        )}
      </div>

      {/* Footer */}
      {notifications.length > 0 && (
        <div className="px-5 py-3 bg-gray-50 border-t border-gray-200">
          <button
            onClick={handleViewAll}
            className="w-full text-sm text-indigo-600 hover:text-indigo-700 font-medium flex items-center justify-center gap-2"
          >
            View All Notifications
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
};

export default NotificationDropdown;
