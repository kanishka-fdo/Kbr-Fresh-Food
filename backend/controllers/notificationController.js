const Notification = require('../models/Notification');

// @route GET /api/notifications
const getMyNotifications = async (req, res) => {
  const notifications = await Notification.find({ user: req.user._id }).sort({ createdAt: -1 }).limit(50);
  const unreadCount = await Notification.countDocuments({ user: req.user._id, isRead: false });
  return res.json({ notifications, unreadCount });
};

// @route PATCH /api/notifications/:id/read
const markAsRead = async (req, res) => {
  const notification = await Notification.findOneAndUpdate(
    { _id: req.params.id, user: req.user._id },
    { isRead: true },
    { new: true }
  );
  if (!notification) return res.status(404).json({ message: 'Notification not found' });
  return res.json({ notification });
};

// @route PATCH /api/notifications/read-all
const markAllAsRead = async (req, res) => {
  await Notification.updateMany({ user: req.user._id, isRead: false }, { isRead: true });
  return res.json({ message: 'All notifications marked as read' });
};

module.exports = { getMyNotifications, markAsRead, markAllAsRead };
