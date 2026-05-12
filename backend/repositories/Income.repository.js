const mongoose = require("mongoose");
const Income = require("../models/Income.model");

const toObjectId = (value) => new mongoose.Types.ObjectId(value);

const buildIncomeQuery = (userId, filters = {}) => {
    const query = { userId };

    if (filters.status) {
        query.status = filters.status;
    }

    if (filters.source) {
        query.source = filters.source;
    }

    if (filters.from || filters.to) {
        query.date = {};
    }

    if (filters.from) {
        query.date.$gte = filters.from;
    }

    if (filters.to) {
        query.date.$lte = filters.to;
    }

    return query;
};

module.exports.createIncome = async (incomeData) => {
    return Income.create(incomeData);
};

module.exports.getIncomesByUserId = async (userId, filters = {}) => {
    return Income.find(buildIncomeQuery(userId, filters))
        .sort({ date: -1, createdAt: -1 });
};

module.exports.getIncomeByIdForUser = async (id, userId) => {
    return Income.findOne({ _id: id, userId });
};

module.exports.updateIncomeForUser = async (id, userId, updateData) => {
    return Income.findOneAndUpdate(
        { _id: id, userId },
        updateData,
        { new: true, runValidators: true }
    );
};

module.exports.deleteIncomeForUser = async (id, userId) => {
    return Income.findOneAndDelete({ _id: id, userId });
};

module.exports.deleteIncomesByUserId = async (userId) => {
    return Income.deleteMany({ userId });
};

module.exports.aggregateConfirmedIncomeTotal = async (userId, from, to) => {
    return Income.aggregate([
        {
            $match: {
                userId: toObjectId(userId),
                status: "confirmed",
                date: {
                    $gte: from,
                    $lte: to
                }
            }
        },
        {
            $group: {
                _id: null,
                total: { $sum: "$amount" }
            }
        }
    ]);
};
