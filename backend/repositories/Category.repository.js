const Category = require("../models/Category.model");

module.exports.createCategory = async (categoryData) => {
    return Category.create(categoryData);
};

module.exports.getCategoriesByUserId = async (userId) => {
    return Category.find({ userId }).sort({ name: 1 });
};

module.exports.getCategoryByIdForUser = async (id, userId) => {
    return Category.findOne({ _id: id, userId });
};

module.exports.findCategoryByNormalizedName = async (userId, normalizedName) => {
    return Category.findOne({ userId, normalizedName });
};

module.exports.deleteCategoryForUser = async (id, userId) => {
    return Category.findOneAndDelete({ _id: id, userId });
};

module.exports.deleteCategoriesByUserId = async (userId) => {
    return Category.deleteMany({ userId });
};
