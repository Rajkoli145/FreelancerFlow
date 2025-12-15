const Notification = require('../models/Notification');

/**
 * Get all notifications for the authenticated user
 */
exports.getNotifications = async (req, res) => {
  try {
    const userId = req.user._id;
    const { unreadOnly } = req.query;
    
    const query = { userId };
    if (unreadOnly === 'true') {
      query.isRead = false;
    }
    
    const notifications = await Notification.find(query)
      .sort({ createdAt: -1 })
      .limit(100); // Limit to last 100 notifications
    
    const unreadCount = await Notification.countDocuments({
      userId,
      isRead: false
    });
    
    res.json({
      success: true,
      data: notifications,
      unreadCount
    });
  } catch (err) {
    console.error('Error fetching notifications:', err);
    res.status(500).json({ success: false, error: err.message });
  }
};

/**
 * Mark a notification as read
 */
exports.markAsRead = async (req, res) => {
  try {
    const notificationId = req.params.id;
    const userId = req.user._id;
    
    const notification = await Notification.findOneAndUpdate(
      { _id: notificationId, userId },
      { isRead: true },
      { new: true }
    );
    
    if (!notification) {
      return res.status(404).json({
        success: false,
        error: 'Notification not found'
      });
    }
    
    res.json({ success: true, data: notification });
  } catch (err) {
    console.error('Error marking notification as read:', err);
    res.status(500).json({ success: false, error: err.message });
  }
};

/**
 * Mark all notifications as read
 */
exports.markAllAsRead = async (req, res) => {
  try {
    const userId = req.user._id;
    
    await Notification.updateMany(
      { userId, isRead: false },
      { isRead: true }
    );
    
    res.json({
      success: true,
      message: 'All notifications marked as read'
    });
  } catch (err) {
    console.error('Error marking all as read:', err);
    res.status(500).json({ success: false, error: err.message });
  }
};

/**
 * Create a notification (helper function for internal use)
 */
exports.createNotification = async (userId, type, title, description, relatedEntityType = null, relatedEntityId = null) => {
  try {
    const notification = await Notification.create({
      userId,
      type,
      title,
      description,
      relatedEntityType,
      relatedEntityId
    });
    return notification;
  } catch (err) {
    console.error('Error creating notification:', err);
    throw err;
  }
};
