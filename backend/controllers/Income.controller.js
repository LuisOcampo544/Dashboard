const {
    createIncome,
    getIncomesByUserId,
    getIncomeById,
    updateIncome,
    deleteIncome
} = require("../services/Income.service");

module.exports.createIncome = async (req, res) => {
    const income = await createIncome(req.user.id, req.body);
    res.status(201).json(income);
};

module.exports.getIncomesByUserId = async (req, res) => {
    const incomes = await getIncomesByUserId(req.user.id, req.query);
    res.status(200).json(incomes);
};

module.exports.getIncomeById = async (req, res) => {
    const income = await getIncomeById(req.user.id, req.params.id);
    res.status(200).json(income);
};

module.exports.updateIncome = async (req, res) => {
    const income = await updateIncome(req.user.id, req.params.id, req.body);
    res.status(200).json(income);
};

module.exports.deleteIncome = async (req, res) => {
    await deleteIncome(req.user.id, req.params.id);
    res.status(204).send();
};
