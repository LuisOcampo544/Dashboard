const Budget = require("../models/Budget.model");

module.exports.createBudget = async (budgetData) => {
    return Budget.create(budgetData);
};

module.exports.getBudgetsByUserId = async (userId, filters = {}) => {
    const query = { userId };

    if (filters.status) {
        query.status = filters.status;
    }

    return Budget.find(query).sort({ startDate: -1, endDate: -1, createdAt: -1 });
};

module.exports.getBudgetByIdForUser = async (id, userId) => {
    return Budget.findOne({ _id: id, userId });
};

module.exports.updateBudgetForUser = async (id, userId, updateData) => {
    return Budget.findOneAndUpdate(
        { _id: id, userId },
        updateData,
        { new: true, runValidators: true }
    );
};

module.exports.deleteBudgetForUser = async (id, userId) => {
    return Budget.findOneAndDelete({ _id: id, userId });
};

module.exports.findCoveringBudgetsForRange = async (userId, from, to) => {
    return Budget.find({
        userId,
        status: "active",
        startDate: { $lte: from },
        endDate: { $gte: to }
    }).sort({ startDate: -1, endDate: 1, createdAt: -1 });
};

module.exports.deleteBudgetsByUserId = async (userId) => {
    return Budget.deleteMany({ userId });
};
