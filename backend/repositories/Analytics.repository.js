const {
    aggregateExpenseByCategory,
    aggregateExpenseTotal
} = require("./Expense.repository");
const { aggregateConfirmedIncomeTotal } = require("./Income.repository");
const { findCoveringBudgetsForRange } = require("./Budget.repository");

module.exports.getFinancialTotals = async (userId, from, to) => {
    const [incomeResult, expenseResult] = await Promise.all([
        aggregateConfirmedIncomeTotal(userId, from, to),
        aggregateExpenseTotal(userId, from, to)
    ]);

    return {
        totalIncome: incomeResult[0]?.total || 0,
        totalExpense: expenseResult[0]?.total || 0
    };
};

module.exports.getExpenseBreakdownByCategory = async (userId, from, to) => {
    return aggregateExpenseByCategory(userId, from, to);
};

module.exports.getCoveringBudgets = async (userId, from, to) => {
    return findCoveringBudgetsForRange(userId, from, to);
};
