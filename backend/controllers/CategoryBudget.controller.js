const {
    createCategoryBudget,
    getCategoryBudgetsByUserId,
    getCategoryBudgetById,
    updateCategoryBudget,
    deleteCategoryBudget
} = require("../services/CategoryBudget.service");

module.exports.createCategoryBudget = async (req, res) => {
    const categoryBudget = await createCategoryBudget(req.user.id, req.body);
    res.status(201).json(categoryBudget);
};

module.exports.getCategoryBudgetsByUserId = async (req, res) => {
    const categoryBudgets = await getCategoryBudgetsByUserId(req.user.id, req.query);
    res.status(200).json(categoryBudgets);
};

module.exports.getCategoryBudgetById = async (req, res) => {
    const categoryBudget = await getCategoryBudgetById(req.user.id, req.params.id);
    res.status(200).json(categoryBudget);
};

module.exports.updateCategoryBudget = async (req, res) => {
    const categoryBudget = await updateCategoryBudget(req.user.id, req.params.id, req.body);
    res.status(200).json(categoryBudget);
};

module.exports.deleteCategoryBudget = async (req, res) => {
    await deleteCategoryBudget(req.user.id, req.params.id);
    res.status(204).send();
};
