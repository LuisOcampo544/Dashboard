const {
    createBudget,
    getBudgetsByUserId,
    getBudgetById,
    updateBudget,
    deleteBudget
} = require("../services/Budget.service");

module.exports.createBudget = async (req, res) => {
    const budget = await createBudget(req.user.id, req.body);
    res.status(201).json(budget);
};

module.exports.getBudgetsByUserId = async (req, res) => {
    const budgets = await getBudgetsByUserId(req.user.id, req.query);
    res.status(200).json(budgets);
};

module.exports.getBudgetById = async (req, res) => {
    const budget = await getBudgetById(req.user.id, req.params.id);
    res.status(200).json(budget);
};

module.exports.updateBudget = async (req, res) => {
    const budget = await updateBudget(req.user.id, req.params.id, req.body);
    res.status(200).json(budget);
};

module.exports.deleteBudget = async (req, res) => {
    await deleteBudget(req.user.id, req.params.id);
    res.status(204).send();
};
