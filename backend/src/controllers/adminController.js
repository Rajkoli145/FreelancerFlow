const User = require('../models/user');
const Invoice = require('../models/Invoice');
const Project = require('../models/Project');
const TimeLog = require('../models/TimeLog');

/**
 * Get platform-wide metrics for Admin Dashboard
 */
exports.getPlatformMetrics = async (req, res) => {
    try {
        console.log('Admin Metrics Request from User:', req.user.email, 'Role:', req.user.role);
        // Only allow admins
        if (req.user.role !== 'admin') {
            console.log('Access Denied: User is not an admin');
            return res.status(403).json({ success: false, error: 'Forbidden: Admin access required' });
        }

        const totalUsers = await User.countDocuments({
            $or: [
                { role: 'freelancer' },
                { role: { $exists: false } }
            ]
        });
        const totalInvoices = await Invoice.countDocuments();
        const totalProjects = await Project.countDocuments();

        // Calculate total revenue across platform (paid invoices)
        const revenueData = await Invoice.aggregate([
            { $match: { status: 'paid' } },
            { $group: { _id: null, totalRevenue: { $sum: '$amountPaid' } } }
        ]);

        const totalPlatformRevenue = revenueData[0]?.totalRevenue || 0;

        // Recent user signups
        const recentUsers = await User.find({
            $or: [
                { role: 'freelancer' },
                { role: { $exists: false } }
            ]
        })
            .sort({ createdAt: -1 })
            .limit(5)
            .select('fullName email createdAt');

        res.json({
            success: true,
            data: {
                stats: {
                    totalUsers,
                    totalInvoices,
                    totalProjects,
                    totalPlatformRevenue
                },
                recentUsers
            }
        });
    } catch (err) {
        console.error('Error fetching platform metrics:', err);
        res.status(500).json({ success: false, error: err.message });
    }
};
