import React, { useState } from "react";
import {
  Bell,
  FileText,
  Briefcase,
  Users,
  Settings,
  CheckCircle2,
  AlertCircle,
  Clock,
  DollarSign,
} from "lucide-react";

const NotificationsPage = () => {
  const [activeFilter, setActiveFilter] = useState("All");

  // Mock Notifications Data
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      category: "Invoices",
      icon: DollarSign,
      iconColor: "text-green-600",
      iconBg: "bg-green-50",
      title: "Invoice INV-002 marked as paid",
      description: "Payment received from TechStart Inc",
      timestamp: "2 hours ago",
      isRead: false,
    },
    {
      id: 2,
      category: "Projects",
      icon: Briefcase,
      iconColor: "text-indigo-600",
      iconBg: "bg-indigo-50",
      title: "New project milestone completed",
      description: "Website Redesign - Phase 2 completed",
      timestamp: "5 hours ago",
      isRead: false,
    },
    {
      id: 3,
      category: "Clients",
      icon: Users,
      iconColor: "text-blue-600",
      iconBg: "bg-blue-50",
      title: "New message from Acme Corp",
      description: "Please review the latest design mockups",
      timestamp: "1 day ago",
      isRead: true,
    },
    {
      id: 4,
      category: "Invoices",
      icon: AlertCircle,
      iconColor: "text-red-600",
      iconBg: "bg-red-50",
      title: "Invoice INV-003 is overdue",
      description: "Payment from Design Co is 5 days late",
      timestamp: "2 days ago",
      isRead: false,
    },
    {
      id: 5,
      category: "System",
      icon: Settings,
      iconColor: "text-gray-600",
      iconBg: "bg-gray-50",
      title: "System maintenance scheduled",
      description: "Scheduled downtime on Dec 15, 2025 at 2:00 AM",
      timestamp: "3 days ago",
      isRead: true,
    },
    {
      id: 6,
      category: "Projects",
      icon: Briefcase,
      iconColor: "text-indigo-600",
      iconBg: "bg-indigo-50",
      title: "Project deadline approaching",
      description: "Mobile App project due in 3 days",
      timestamp: "4 days ago",
      isRead: true,
    },
    {
      id: 7,
      category: "Invoices",
      icon: FileText,
      iconColor: "text-yellow-600",
      iconBg: "bg-yellow-50",
      title: "New invoice created",
      description: "Invoice INV-004 created for Client One",
      timestamp: "5 days ago",
      isRead: true,
    },
  ]);

  const filters = ["All", "Invoices", "Projects", "Clients", "System"];

  const filteredNotifications =
    activeFilter === "All"
      ? notifications
      : notifications.filter((notif) => notif.category === activeFilter);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const handleMarkAllAsRead = () => {
    setNotifications(notifications.map((notif) => ({ ...notif, isRead: true })));
  };

  const handleNotificationClick = (id) => {
    setNotifications(
      notifications.map((notif) =>
        notif.id === id ? { ...notif, isRead: true } : notif
      )
    );
  };

  return (
    <div className="min-h-screen bg-[#F7F7FB]">
      <div className="max-w-5xl mx-auto px-6 py-10 space-y-8">
        {/* Header Section */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              Notifications
              {unreadCount > 0 && (
                <span className="bg-indigo-600 text-white text-sm font-semibold px-3 py-1 rounded-full">
                  {unreadCount} new
                </span>
              )}
            </h1>
            <p className="text-gray-500 mt-1">
              Stay updated on your recent activity.
            </p>
          </div>
          <button
            onClick={handleMarkAllAsRead}
            className="flex items-center gap-2 px-4 py-2.5 bg-white hover:bg-gray-50 border border-gray-200 text-gray-700 font-medium rounded-lg transition-colors shadow-sm"
          >
            <CheckCircle2 className="w-4 h-4" />
            Mark All as Read
          </button>
        </div>

        {/* Filter Bar */}
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center gap-3 flex-wrap">
            {filters.map((filter) => (
              <button
                key={filter}
                onClick={() => setActiveFilter(filter)}
                className={`px-4 py-2 rounded-lg font-medium text-sm transition-all ${
                  activeFilter === filter
                    ? "bg-indigo-600 text-white shadow-sm"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                {filter}
              </button>
            ))}
          </div>
        </div>

        {/* Notifications List */}
        {filteredNotifications.length > 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 divide-y divide-gray-100">
            {filteredNotifications.map((notification) => {
              const Icon = notification.icon;
              return (
                <div
                  key={notification.id}
                  onClick={() => handleNotificationClick(notification.id)}
                  className={`p-5 flex items-start gap-4 cursor-pointer transition-all hover:bg-gray-50 ${
                    !notification.isRead ? "bg-indigo-50/30" : ""
                  }`}
                >
                  {/* Status Dot */}
                  <div className="flex-shrink-0 mt-1">
                    <div
                      className={`w-2.5 h-2.5 rounded-full ${
                        notification.isRead ? "bg-gray-300" : "bg-indigo-600"
                      }`}
                    />
                  </div>

                  {/* Icon */}
                  <div
                    className={`flex-shrink-0 w-12 h-12 ${notification.iconBg} rounded-lg flex items-center justify-center`}
                  >
                    <Icon className={`w-6 h-6 ${notification.iconColor}`} />
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <h3
                      className={`text-sm font-semibold mb-1 ${
                        notification.isRead ? "text-gray-700" : "text-gray-900"
                      }`}
                    >
                      {notification.title}
                    </h3>
                    <p className="text-sm text-gray-500 mb-2">
                      {notification.description}
                    </p>
                    <div className="flex items-center gap-2 text-xs text-gray-400">
                      <Clock className="w-3.5 h-3.5" />
                      {notification.timestamp}
                    </div>
                  </div>

                  {/* Category Badge */}
                  <div className="flex-shrink-0">
                    <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2.5 py-1 rounded-full">
                      {notification.category}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* Empty State */
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-16">
            <div className="text-center max-w-md mx-auto">
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Bell className="w-10 h-10 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                No notifications yet
              </h3>
              <p className="text-gray-500">
                You're all caught up! When you receive new notifications, they'll
                appear here.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default NotificationsPage;
