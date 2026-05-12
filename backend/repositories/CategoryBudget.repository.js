const CategoryBudget = require("../models/CategoryBudget.model");

module.exports.createCategoryBudget = async (budgetData) => {
    return CategoryBudget.create(budgetData);
};

module.exports.getCategoryBudgetsByUserId = async (userId, filters = {}) => {
    const query = { userId };

    if (filters.budgetId) {
        query.budgetId = filters.budgetId;
    }

    return CategoryBudget.find(query).sort({ createdAt: -1, category: 1 });
};

module.exports.getCategoryBudgetByIdForUser = async (id, userId) => {
    return CategoryBudget.findOne({ _id: id, userId });
};

module.exports.findCategoryBudgetByBudgetAndCategory = async (userId, budgetId, category) => {
    return CategoryBudget.findOne({ userId, budgetId, category });
};

module.exports.updateCategoryBudgetForUser = async (id, userId, updateData) => {
    return CategoryBudget.findOneAndUpdate(
        { _id: id, userId },
        updateData,
        { new: true, runValidators: true }
    );
};

module.exports.deleteCategoryBudgetForUser = async (id, userId) => {
    return CategoryBudget.findOneAndDelete({ _id: id, userId });
};

module.exports.getCategoryBudgetsForBudget = async (userId, budgetId) => {
    return CategoryBudget.find({ userId, budgetId }).sort({ category: 1 });
};

module.exports.deleteCategoryBudgetsByBudgetId = async (budgetId, userId) => {
    return CategoryBudget.deleteMany({ budgetId, userId });
};

module.exports.deleteCategoryBudgetsByUserId = async (userId) => {
    return CategoryBudget.deleteMany({ userId });
};
