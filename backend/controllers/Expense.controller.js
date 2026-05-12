const {
    createExpense,
    getExpensesByUserId,
    getExpenseById,
    updateExpense,
    deleteExpense
} = require("../services/Expense.service");

module.exports.createExpense = async (req, res) => {
    const expense = await createExpense(req.user.id, req.body);
    res.status(201).json(expense);
};

module.exports.getExpensesByUserId = async (req, res) => {
    const expenses = await getExpensesByUserId(req.user.id, req.query);
    res.status(200).json(expenses);
};

module.exports.getExpenseById = async (req, res) => {
    const expense = await getExpenseById(req.user.id, req.params.id);
    res.status(200).json(expense);
};

module.exports.updateExpense = async (req, res) => {
    const expense = await updateExpense(req.user.id, req.params.id, req.body);
    res.status(200).json(expense);
};

module.exports.deleteExpense = async (req, res) => {
    await deleteExpense(req.user.id, req.params.id);
    res.status(204).send();
};
