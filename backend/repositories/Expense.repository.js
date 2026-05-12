const mongoose = require("mongoose");
const Expense = require("../models/Expense.model");

const toObjectId = (value) => new mongoose.Types.ObjectId(value);

const buildExpenseQuery = (userId, filters = {}) => {
    const query = { userId };

    if (filters.category) {
        query.category = filters.category;
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

module.exports.createExpense = async (expenseData) => {
    return Expense.create(expenseData);
};

module.exports.getExpensesByUserId = async (userId, filters = {}) => {
    return Expense.find(buildExpenseQuery(userId, filters))
        .sort({ date: -1, createdAt: -1 });
};

module.exports.getExpenseByIdForUser = async (id, userId) => {
    return Expense.findOne({ _id: id, userId });
};

module.exports.updateExpenseForUser = async (id, userId, updateData) => {
    return Expense.findOneAndUpdate(
        { _id: id, userId },
        updateData,
        { new: true, runValidators: true }
    );
};

module.exports.deleteExpenseForUser = async (id, userId) => {
    return Expense.findOneAndDelete({ _id: id, userId });
};

module.exports.deleteExpensesByUserId = async (userId) => {
    return Expense.deleteMany({ userId });
};

module.exports.aggregateExpenseTotal = async (userId, from, to) => {
    return Expense.aggregate([
        {
            $match: {
                userId: toObjectId(userId),
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

module.exports.aggregateExpenseByCategory = async (userId, from, to) => {
    return Expense.aggregate([
        {
            $match: {
                userId: toObjectId(userId),
                date: {
                    $gte: from,
                    $lte: to
                }
            }
        },
        {
            $group: {
                _id: "$category",
                total: { $sum: "$amount" }
            }
        },
        {
            $sort: {
                total: -1,
                _id: 1
            }
        }
    ]);
};
