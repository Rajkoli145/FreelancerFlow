import React, { useState, useEffect } from "react";
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
import { getNotifications, markNotificationAsRead, markAllNotificationsAsRead } from '../../api/notificationApi';
import Loader from '../../components/ui/Loader';
import '../../styles/neumorphism.css';

const NotificationsPage = () => {
  const [activeFilter, setActiveFilter] = useState("All");
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getNotifications();
      const data = response.data || [];
      setNotifications(data);
    } catch (err) {
      console.error('Error fetching notifications:', err);
      setError('Failed to load notifications');
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  };

  const filters = ["All", "Invoice", "Payment", "Project", "System"];

  // Map notification type to icon and styling
  const getNotificationIcon = (type) => {
    switch(type) {
      case 'invoice_paid':
      case 'invoice_overdue':
      case 'invoice_sent':
        return { Icon: FileText, color: "text-blue-600", bg: "bg-blue-50" };
      case 'payment_received':
        return { Icon: DollarSign, color: "text-green-600", bg: "bg-green-50" };
      case 'project_deadline':
        return { Icon: Briefcase, color: "text-indigo-600", bg: "bg-indigo-50" };
      case 'system':
        return { Icon: Settings, color: "text-gray-600", bg: "bg-gray-50" };
      default:
        return { Icon: Bell, color: "text-gray-600", bg: "bg-gray-50" };
    }
  };

  // Map backend notifications to frontend format
  const formatNotifications = (notifications) => {
    return notifications.map(notif => {
      const { Icon, color, bg } = getNotificationIcon(notif.type);
      
      // Determine category for filtering
      let category = 'System';
      if (notif.type.includes('invoice')) category = 'Invoice';
      else if (notif.type.includes('payment')) category = 'Payment';
      else if (notif.type.includes('project')) category = 'Project';

      return {
        id: notif._id,
        category,
        icon: Icon,
        iconColor: color,
        iconBg: bg,
        title: notif.title,
        description: notif.description,
        timestamp: formatTimestamp(notif.createdAt),
        isRead: notif.isRead,
      };
    });
  };

  const formatTimestamp = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) return `${diffMins} minute${diffMins !== 1 ? 's' : ''} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`;
    return date.toLocaleDateString();
  };

  const formattedNotifications = formatNotifications(notifications);

  const filteredNotifications =
    activeFilter === "All"
      ? formattedNotifications
      : formattedNotifications.filter((notif) => notif.category === activeFilter);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const handleMarkAllAsRead = async () => {
    try {
      await markAllNotificationsAsRead();
      fetchNotifications();
    } catch (err) {
      console.error('Error marking all as read:', err);
    }
  };

  const handleNotificationClick = async (id) => {
    try {
      await markNotificationAsRead(id);
      fetchNotifications();
    } catch (err) {
      console.error('Error marking notification as read:', err);
    }
  };

  return (
    <div className="neu-container space-y-6">
      {/* Header Section */}
      <div className="neu-card">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold neu-heading flex items-center gap-3">
              Notifications
              {unreadCount > 0 && (
                <span className="neu-badge-primary">
                  {unreadCount} new
                </span>
              )}
            </h1>
            <p className="neu-text-light mt-1">
              Stay updated on your recent activity.
            </p>
          </div>
          <button
            onClick={handleMarkAllAsRead}
            className="neu-button flex items-center gap-2 px-4 py-2.5 font-medium"
          >
            <CheckCircle2 className="w-4 h-4" />
            Mark All as Read
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="neu-card">
        <div className="flex items-center gap-3 flex-wrap">
          {filters.map((filter) => (
            <button
              key={filter}
              onClick={() => setActiveFilter(filter)}
              className={`px-4 py-2 rounded-lg font-medium text-sm transition-all ${
                activeFilter === filter
                  ? "neu-button-primary"
                  : "neu-button"
              }`}
            >
              {filter}
            </button>
          ))}
        </div>
      </div>

      {/* Notifications List */}
      {loading ? (
        <div className="flex justify-center items-center py-20">
          <Loader />
        </div>
      ) : error ? (
        <div className="neu-card">
          <p className="text-red-600 text-center py-8">{error}</p>
        </div>
      ) : filteredNotifications.length > 0 ? (
        <div className="neu-card overflow-hidden">
          {filteredNotifications.map((notification, index) => {
            const Icon = notification.icon;
            return (
              <div
                key={notification.id}
                onClick={() => handleNotificationClick(notification.id)}
                className="p-5 flex items-start gap-4 cursor-pointer transition-all hover:opacity-90"
                style={{
                  borderBottom: index < filteredNotifications.length - 1 ? '1px solid var(--neu-dark)' : 'none',
                  backgroundColor: !notification.isRead ? 'rgba(75, 112, 226, 0.03)' : 'transparent'
                }}
              >
                {/* Status Dot */}
                <div className="flex-shrink-0 mt-1">
                  <div
                    className="w-2.5 h-2.5 rounded-full"
                    style={{
                      backgroundColor: notification.isRead ? '#d1d9e6' : 'var(--neu-primary)'
                    }}
                  />
                </div>

                {/* Icon */}
                <div
                  className="flex-shrink-0 w-12 h-12 neu-icon flex items-center justify-center"
                  style={{
                    backgroundColor: notification.iconBg.includes('green') ? 'rgba(34, 197, 94, 0.1)' :
                                     notification.iconBg.includes('indigo') ? 'rgba(75, 112, 226, 0.1)' :
                                     notification.iconBg.includes('blue') ? 'rgba(59, 130, 246, 0.1)' :
                                     notification.iconBg.includes('red') ? 'rgba(239, 68, 68, 0.1)' :
                                     notification.iconBg.includes('yellow') ? 'rgba(234, 179, 8, 0.1)' :
                                     'rgba(107, 114, 128, 0.1)'
                  }}
                >
                  <Icon className="w-6 h-6" style={{
                    color: notification.iconColor.includes('green') ? '#22c55e' :
                           notification.iconColor.includes('indigo') ? 'var(--neu-primary)' :
                           notification.iconColor.includes('blue') ? '#3b82f6' :
                           notification.iconColor.includes('red') ? '#ef4444' :
                           notification.iconColor.includes('yellow') ? '#eab308' :
                           '#6b7280'
                  }} />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <h3
                    className={`text-sm font-semibold mb-1 ${
                      notification.isRead ? "neu-text" : "neu-heading"
                    }`}
                  >
                    {notification.title}
                  </h3>
                  <p className="text-sm neu-text-light mb-2">
                    {notification.description}
                  </p>
                  <div className="flex items-center gap-2 text-xs neu-text-light">
                    <Clock className="w-3.5 h-3.5" />
                    {notification.timestamp}
                  </div>
                </div>

                {/* Category Badge */}
                <div className="flex-shrink-0">
                  <span className="neu-badge">
                    {notification.category}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Empty State */
        <div className="neu-card p-16">
          <div className="text-center max-w-md mx-auto">
            <div className="w-20 h-20 neu-icon-inset rounded-full flex items-center justify-center mx-auto mb-4">
              <Bell className="w-10 h-10 neu-text-light" />
            </div>
            <h3 className="text-xl font-semibold neu-heading mb-2">
              No notifications yet
            </h3>
            <p className="neu-text">
              You're all caught up! When you receive new notifications, they'll
              appear here.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationsPage;
