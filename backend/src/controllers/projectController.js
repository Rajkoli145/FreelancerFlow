const Project = require('../models/Project');
const Client = require('../models/Client');
const Invoice = require('../models/Invoice');
const TimeLog = require('../models/TimeLog');
const mongoose = require('mongoose');
const { catchAsync } = require('../middleware/errorMiddleware');
const { NotFoundError, ValidationError } = require('../utils/errors');

exports.createProject = catchAsync(async (req, res) => {
    const { clientId, billingType, hourlyRate, fixedPrice, ...projectData } = req.body;

    // Verify the client exists and belongs to this user
    const client = await Client.findOne({ _id: clientId, userId: req.user._id });
    if (!client) {
        throw new NotFoundError('Client not found');
    }

    const project = await Project.create({
        userId: req.user._id,
        clientId,
        billingType: billingType || 'Hourly',
        hourlyRate: billingType === 'Hourly' ? hourlyRate : undefined,
        fixedPrice: billingType === 'Fixed' ? fixedPrice : undefined,
        ...projectData,
    });

    res.status(201).json({ success: true, data: project });
});

exports.getProjects = catchAsync(async (req, res) => {
    const projects = await Project.find({ userId: req.user._id })
        .populate('clientId', 'name email company');
    res.json({ success: true, data: projects });
});

exports.getProjectById = catchAsync(async (req, res) => {
    const project = await Project.findOne({
        _id: req.params.id,
        userId: req.user._id,
    }).populate('clientId', 'name email company phone');

    if (!project) {
        throw new NotFoundError('Project not found');
    }

    res.json({ success: true, data: project });
});

exports.updateProject = catchAsync(async (req, res) => {
    const project = await Project.findOneAndUpdate(
        { _id: req.params.id, userId: req.user._id },
        req.body,
        { new: true, runValidators: true }
    );

    if (!project) {
        throw new NotFoundError('Project not found');
    }

    res.json({ success: true, data: project });
});

exports.deleteProject = catchAsync(async (req, res) => {
    const project = await Project.findOneAndDelete({
        _id: req.params.id,
        userId: req.user._id,
    });

    if (!project) {
        throw new NotFoundError('Project not found');
    }

    res.json({ success: true, message: 'Project deleted' });
});

/**
 * Get project statistics for the authenticated user
 */
exports.getProjectStats = catchAsync(async (req, res) => {
    const userId = req.user._id;

    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const [total, active, hoursResult] = await Promise.all([
        Project.countDocuments({ userId }),
        Project.countDocuments({ userId, status: 'active' }),
        TimeLog.aggregate([
            {
                $match: {
                    userId: new mongoose.Types.ObjectId(userId),
                    date: { $gte: startOfMonth },
                },
            },
            { $group: { _id: null, totalHours: { $sum: '$hours' } } },
        ]),
    ]);

    res.json({
        success: true,
        total,
        active,
        hoursThisMonth: Math.round((hoursResult[0]?.totalHours || 0) * 10) / 10,
    });
});

/**
 * Get statistics for a specific project
 */
exports.getProjectStatsById = catchAsync(async (req, res) => {
    const projectId = req.params.id;
    const userId = req.user._id;

    const project = await Project.findOne({ _id: projectId, userId });
    if (!project) {
        throw new NotFoundError('Project not found');
    }

    const [hoursResult, unbilledResult, billedResult, paidResult, pendingResult] =
        await Promise.all([
            TimeLog.aggregate([
                { $match: { projectId: new mongoose.Types.ObjectId(projectId), userId: new mongoose.Types.ObjectId(userId) } },
                { $group: { _id: null, total: { $sum: '$hours' } } },
            ]),
            TimeLog.aggregate([
                {
                    $match: {
                        projectId: new mongoose.Types.ObjectId(projectId),
                        userId: new mongoose.Types.ObjectId(userId),
                        billable: true,
                        invoiced: false,
                    },
                },
                { $group: { _id: null, total: { $sum: '$hours' } } },
            ]),
            Invoice.aggregate([
                { $match: { projectId: new mongoose.Types.ObjectId(projectId), userId: new mongoose.Types.ObjectId(userId) } },
                { $group: { _id: null, total: { $sum: '$totalAmount' } } },
            ]),
            Invoice.aggregate([
                { $match: { projectId: new mongoose.Types.ObjectId(projectId), userId: new mongoose.Types.ObjectId(userId) } },
                { $group: { _id: null, total: { $sum: '$amountPaid' } } },
            ]),
            Invoice.aggregate([
                {
                    $match: {
                        projectId: new mongoose.Types.ObjectId(projectId),
                        userId: new mongoose.Types.ObjectId(userId),
                        status: { $in: ['sent', 'partial', 'overdue', 'viewed'] },
                    },
                },
                { $group: { _id: null, total: { $sum: { $subtract: ['$totalAmount', '$amountPaid'] } } } },
            ]),
        ]);

    res.json({
        success: true,
        data: {
            totalHours: Math.round((hoursResult[0]?.total || 0) * 10) / 10,
            unbilledHours: Math.round((unbilledResult[0]?.total || 0) * 10) / 10,
            totalBilled: billedResult[0]?.total || 0,
            totalPaid: paidResult[0]?.total || 0,
            pendingAmount: pendingResult[0]?.total || 0,
        },
    });
});