const {
    getFinancialTotals,
    getExpenseBreakdownByCategory
} = require("../repositories/Analytics.repository");
const { getCategoryBudgetsForBudget } = require("../repositories/CategoryBudget.repository");
const { findUserById } = require("../repositories/User.repositories");
const { ensureDateRange, ensureObjectId, roundCurrency } = require("../utils/validation");
const { getSelectedBudgetForRange } = require("./Budget.service");

const roundRatio = (value) => {
    if (value === null || value === undefined) {
        return null;
    }

    return Number(value.toFixed(4));
};

const serializeBudgetCoverage = (selectedBudget, matchedBudgets, totalBudget) => {
    return {
        hasBudget: Boolean(selectedBudget),
        budgetId: selectedBudget?._id || null,
        budgetName: selectedBudget?.name || null,
        currency: selectedBudget?.currency || null,
        totalBudget: selectedBudget ? roundCurrency(totalBudget) : null,
        matchedBudgets: matchedBudgets.map(budget => ({
            id: budget._id,
            name: budget.name,
            startDate: budget.startDate,
            endDate: budget.endDate,
            status: budget.status
        }))
    };
};

const buildCategoryBreakdown = (expenseBreakdown, categoryBudgets, totalExpense, totalIncome) => {
    const budgetMap = new Map(categoryBudgets.map(budget => [budget.category, budget]));
    const expenseMap = new Map(expenseBreakdown.map(entry => [entry._id, entry]));
    const categories = new Set([
        ...expenseBreakdown.map(entry => entry._id),
        ...categoryBudgets.map(budget => budget.category)
    ]);

    return [...categories].map(category => {
        const entry = expenseMap.get(category) || { _id: category, total: 0 };
        const budget = budgetMap.get(entry._id);
        const total = roundCurrency(entry.total || 0);
        const budgetedAmount = budget ? roundCurrency(budget.limitAmount) : null;
        const remainingBudget = budget ? roundCurrency(budget.limitAmount - total) : null;
        const usageRatio = budget ? roundRatio(total / budget.limitAmount) : null;

        return {
            category: entry._id,
            totalExpense: total,
            percentageOfExpense: totalExpense > 0 ? roundRatio(total / totalExpense) : 0,
            percentageOfIncome: totalIncome > 0 ? roundRatio(total / totalIncome) : null,
            budgetedAmount,
            remainingBudget,
            usageRatio,
            alertThreshold: budget?.alertThreshold ?? null,
            isOverBudget: Boolean(budget && total > budget.limitAmount)
        };
    }).sort((left, right) => right.totalExpense - left.totalExpense || left.category.localeCompare(right.category));
};

const buildAlerts = (overview, selectedBudget) => {
    const alerts = [];

    overview.categoryBreakdown.forEach(item => {
        if (!selectedBudget || item.budgetedAmount === null) {
            return;
        }

        if (item.isOverBudget) {
            alerts.push({
                type: "CATEGORY_BUDGET_EXCEEDED",
                category: item.category,
                currentAmount: item.totalExpense,
                budgetedAmount: item.budgetedAmount
            });
        } else if (item.alertThreshold !== null && item.usageRatio !== null && item.usageRatio >= item.alertThreshold) {
            alerts.push({
                type: "CATEGORY_BUDGET_THRESHOLD_REACHED",
                category: item.category,
                currentAmount: item.totalExpense,
                budgetedAmount: item.budgetedAmount,
                threshold: item.alertThreshold
            });
        }
    });

    const ratioThreshold = selectedBudget?.expenseToIncomeAlertThreshold ?? 1;
    const shouldRaiseRatioAlert = overview.totalExpense > 0 && (
        overview.totalIncome === 0 ||
        (overview.expenseToIncomeRatio !== null && overview.expenseToIncomeRatio >= ratioThreshold)
    );

    if (shouldRaiseRatioAlert) {
        alerts.push({
            type: "EXPENSE_TO_INCOME_THRESHOLD_REACHED",
            threshold: ratioThreshold,
            expenseToIncomeRatio: overview.expenseToIncomeRatio,
            totalIncome: overview.totalIncome,
            totalExpense: overview.totalExpense
        });
    }

    return alerts;
};

module.exports.getOverview = async (userId, query) => {
    ensureObjectId(userId, "User ID");

    const { from, to } = ensureDateRange(query.from, query.to);
    const user = await findUserById(userId);
    const [{ totalIncome, totalExpense }, expenseBreakdown, budgetSelection] = await Promise.all([
        getFinancialTotals(userId, from, to),
        getExpenseBreakdownByCategory(userId, from, to),
        getSelectedBudgetForRange(userId, from, to)
    ]);

    const selectedBudget = budgetSelection.selectedBudget;
    const matchedBudgets = budgetSelection.matchedBudgets;
    const categoryBudgets = selectedBudget
        ? await getCategoryBudgetsForBudget(userId, selectedBudget._id)
        : [];

    const totalBudget = categoryBudgets.reduce((sum, item) => sum + item.limitAmount, 0);
    const netBalance = roundCurrency(totalIncome - totalExpense);
    const expenseToIncomeRatio = totalIncome > 0 ? roundRatio(totalExpense / totalIncome) : null;
    const savingsRate = totalIncome > 0 ? roundRatio(netBalance / totalIncome) : null;
    const categoryBreakdown = buildCategoryBreakdown(expenseBreakdown, categoryBudgets, totalExpense, totalIncome);
    const overBudgetCategories = categoryBreakdown
        .filter(item => item.isOverBudget)
        .map(item => item.category);

    return {
        from,
        to,
        currency: selectedBudget?.currency || user?.currency || "USD",
        totalIncome: roundCurrency(totalIncome),
        totalExpense: roundCurrency(totalExpense),
        netBalance,
        expenseToIncomeRatio,
        savingsRate,
        remainingBudget: selectedBudget ? roundCurrency(totalBudget - totalExpense) : null,
        categoryBreakdown,
        overBudgetCategories,
        periodCoverage: serializeBudgetCoverage(selectedBudget, matchedBudgets, totalBudget)
    };
};

module.exports.getCategoryAnalytics = async (userId, query) => {
    const overview = await module.exports.getOverview(userId, query);

    return {
        from: overview.from,
        to: overview.to,
        currency: overview.currency,
        categoryBreakdown: overview.categoryBreakdown,
        overBudgetCategories: overview.overBudgetCategories,
        periodCoverage: overview.periodCoverage
    };
};

module.exports.getAlerts = async (userId, query) => {
    const overview = await module.exports.getOverview(userId, query);
    const budgetSelection = await getSelectedBudgetForRange(userId, overview.from, overview.to);

    return {
        from: overview.from,
        to: overview.to,
        currency: overview.currency,
        expenseToIncomeRatio: overview.expenseToIncomeRatio,
        overBudgetCategories: overview.overBudgetCategories,
        periodCoverage: overview.periodCoverage,
        alerts: buildAlerts(overview, budgetSelection.selectedBudget)
    };
};
