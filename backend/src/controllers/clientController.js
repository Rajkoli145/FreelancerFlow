const Client = require('../models/Client');
const Project = require('../models/Project');
const Invoice = require('../models/Invoice');
const TimeLog = require('../models/TimeLog');
const mongoose = require('mongoose');
const { catchAsync } = require('../middleware/errorMiddleware');
const { NotFoundError } = require('../utils/errors');

exports.createClient = catchAsync(async (req, res) => {
    const newClient = await Client.create({
        userId: req.user._id,
        ...req.body,
    });
    res.status(201).json({ success: true, data: newClient });
});

exports.getClients = catchAsync(async (req, res) => {
    const userId = new mongoose.Types.ObjectId(req.user._id);

    const clients = await Client.aggregate([
        { $match: { userId } },
        {
            $lookup: {
                from: 'invoices',
                let: { clientId: '$_id' },
                pipeline: [
                    {
                        $match: {
                            $expr: {
                                $and: [
                                    { $eq: ['$clientId', '$$clientId'] },
                                    { $eq: ['$userId', userId] },
                                ],
                            },
                        },
                    },
                ],
                as: 'invoices',
            },
        },
        {
            $addFields: {
                totalBilled: { $sum: '$invoices.totalAmount' },
                outstandingAmount: {
                    $sum: {
                        $map: {
                            input: {
                                $filter: {
                                    input: '$invoices',
                                    as: 'inv',
                                    cond: { $in: ['$$inv.status', ['sent', 'partial', 'overdue', 'viewed']] },
                                },
                            },
                            as: 'inv',
                            in: { $subtract: ['$$inv.totalAmount', '$$inv.amountPaid'] },
                        },
                    },
                },
            },
        },
        { $project: { invoices: 0 } },
        { $sort: { createdAt: -1 } },
    ]);

    res.json({ success: true, data: clients });
});

exports.getClientById = catchAsync(async (req, res) => {
    const client = await Client.findOne({
        _id: req.params.id,
        userId: req.user._id,
    });

    if (!client) {
        throw new NotFoundError('Client not found');
    }

    res.json({ success: true, data: client });
});

exports.updateClient = catchAsync(async (req, res) => {
    const client = await Client.findOneAndUpdate(
        { _id: req.params.id, userId: req.user._id },
        req.body,
        { new: true, runValidators: true }
    );

    if (!client) {
        throw new NotFoundError('Client not found');
    }

    res.json({ success: true, data: client });
});

exports.deleteClient = catchAsync(async (req, res) => {
    const client = await Client.findOneAndDelete({
        _id: req.params.id,
        userId: req.user._id,
    });

    if (!client) {
        throw new NotFoundError('Client not found');
    }

    res.json({ success: true, message: 'Client deleted' });
});

exports.getAllClientsStats = catchAsync(async (req, res) => {
    const userId = req.user._id;

    const outstandingResult = await Invoice.aggregate([
        {
            $match: {
                userId: new mongoose.Types.ObjectId(userId),
                status: { $ne: 'paid' },
            },
        },
        {
            $group: {
                _id: null,
                totalOutstanding: { $sum: { $subtract: ['$totalAmount', '$amountPaid'] } },
            },
        },
    ]);

    const outstandingAmount = outstandingResult.length > 0
        ? outstandingResult[0].totalOutstanding
        : 0;

    res.json({ success: true, data: { outstandingAmount } });
});

exports.getClientStats = catchAsync(async (req, res) => {
    const { id: clientId } = req.params;
    const userId = req.user._id;

    const client = await Client.findOne({ _id: clientId, userId });
    if (!client) {
        throw new NotFoundError('Client not found');
    }

    const [
        totalProjects,
        activeProjects,
        totalInvoices,
        billedResult,
        paidResult,
        outstandingResult,
        projectIds,
    ] = await Promise.all([
        Project.countDocuments({ clientId, userId }),
        Project.countDocuments({ clientId, userId, status: 'active' }),
        Invoice.countDocuments({ clientId, userId }),
        Invoice.aggregate([
            { $match: { clientId: new mongoose.Types.ObjectId(clientId), userId: new mongoose.Types.ObjectId(userId) } },
            { $group: { _id: null, total: { $sum: '$totalAmount' } } },
        ]),
        Invoice.aggregate([
            { $match: { clientId: new mongoose.Types.ObjectId(clientId), userId: new mongoose.Types.ObjectId(userId) } },
            { $group: { _id: null, total: { $sum: '$amountPaid' } } },
        ]),
        Invoice.aggregate([
            {
                $match: {
                    clientId: new mongoose.Types.ObjectId(clientId),
                    userId: new mongoose.Types.ObjectId(userId),
                    status: { $in: ['sent', 'partial', 'overdue', 'viewed'] },
                },
            },
            { $group: { _id: null, total: { $sum: { $subtract: ['$totalAmount', '$amountPaid'] } } } },
        ]),
        Project.find({ clientId, userId }).distinct('_id'),
    ]);

    const hoursResult = await TimeLog.aggregate([
        { $match: { projectId: { $in: projectIds }, userId: new mongoose.Types.ObjectId(userId) } },
        { $group: { _id: null, total: { $sum: '$hours' } } },
    ]);

    const unbilledResult = await TimeLog.aggregate([
        {
            $match: {
                projectId: { $in: projectIds },
                userId: new mongoose.Types.ObjectId(userId),
                billable: true,
                invoiced: false,
            },
        },
        { $group: { _id: null, total: { $sum: '$hours' } } },
    ]);

    res.json({
        success: true,
        data: {
            totalProjects,
            activeProjects,
            totalInvoices,
            totalBilled: billedResult[0]?.total || 0,
            totalPaid: paidResult[0]?.total || 0,
            outstanding: outstandingResult[0]?.total || 0,
            totalHours: Math.round((hoursResult[0]?.total || 0) * 10) / 10,
            unbilledHours: Math.round((unbilledResult[0]?.total || 0) * 10) / 10,
        },
    });
});
