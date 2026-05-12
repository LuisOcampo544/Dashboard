const {
    createBudget,
    getBudgetsByUserId,
    getBudgetByIdForUser,
    updateBudgetForUser,
    deleteBudgetForUser,
    findCoveringBudgetsForRange,
    deleteBudgetsByUserId
} = require("../repositories/Budget.repository");
const { deleteCategoryBudgetsByBudgetId } = require("../repositories/CategoryBudget.repository");
const { findUserById } = require("../repositories/User.repositories");
const { BadRequestError, NotFoundError } = require("../errors/CustomError");
const {
    ensureAllowedFields,
    ensureCurrencyCode,
    ensureDate,
    ensureEnumValue,
    ensureObjectId,
    ensureRequiredString,
    ensureThreshold
} = require("../utils/validation");

const BUDGET_FIELDS = [
    "name",
    "startDate",
    "endDate",
    "status",
    "currency",
    "expenseToIncomeAlertThreshold"
];
const BUDGET_STATUSES = ["draft", "active", "archived"];

const validateDateOrder = (startDate, endDate) => {
    if (startDate > endDate) {
        throw new BadRequestError("startDate must be earlier than or equal to endDate");
    }
};

const buildCreateBudgetPayload = async (userId, payload) => {
    ensureAllowedFields(payload, BUDGET_FIELDS, "budget");

    const user = await findUserById(userId);
    const startDate = ensureDate(payload.startDate, "startDate");
    const endDate = ensureDate(payload.endDate, "endDate");
    validateDateOrder(startDate, endDate);

    return {
        userId,
        name: ensureRequiredString(payload.name, "Name", { maxLength: 120 }),
        startDate,
        endDate,
        status: payload.status ? ensureEnumValue(payload.status, "Status", BUDGET_STATUSES) : "active",
        currency: ensureCurrencyCode(payload.currency, user?.currency || "USD"),
        expenseToIncomeAlertThreshold: ensureThreshold(
            payload.expenseToIncomeAlertThreshold,
            "expenseToIncomeAlertThreshold",
            1
        )
    };
};

const buildUpdateBudgetPayload = async (userId, currentBudget, payload) => {
    ensureAllowedFields(payload, BUDGET_FIELDS, "budget");

    const updatePayload = {};
    const user = await findUserById(userId);

    if (payload.name !== undefined) {
        updatePayload.name = ensureRequiredString(payload.name, "Name", { maxLength: 120 });
    }

    if (payload.status !== undefined) {
        updatePayload.status = ensureEnumValue(payload.status, "Status", BUDGET_STATUSES);
    }

    if (payload.currency !== undefined) {
        updatePayload.currency = ensureCurrencyCode(payload.currency, user?.currency || "USD");
    }

    if (payload.expenseToIncomeAlertThreshold !== undefined) {
        updatePayload.expenseToIncomeAlertThreshold = ensureThreshold(
            payload.expenseToIncomeAlertThreshold,
            "expenseToIncomeAlertThreshold",
            currentBudget.expenseToIncomeAlertThreshold
        );
    }

    const startDate = payload.startDate !== undefined
        ? ensureDate(payload.startDate, "startDate")
        : currentBudget.startDate;
    const endDate = payload.endDate !== undefined
        ? ensureDate(payload.endDate, "endDate")
        : currentBudget.endDate;

    if (payload.startDate !== undefined) {
        updatePayload.startDate = startDate;
    }

    if (payload.endDate !== undefined) {
        updatePayload.endDate = endDate;
    }

    validateDateOrder(startDate, endDate);

    if (Object.keys(updatePayload).length === 0) {
        throw new BadRequestError("At least one budget field is required");
    }

    return updatePayload;
};

const chooseBestBudget = (budgets) => {
    if (!budgets || budgets.length === 0) {
        return null;
    }

    return [...budgets].sort((left, right) => {
        const leftSpan = new Date(left.endDate).getTime() - new Date(left.startDate).getTime();
        const rightSpan = new Date(right.endDate).getTime() - new Date(right.startDate).getTime();

        if (leftSpan !== rightSpan) {
            return leftSpan - rightSpan;
        }

        return new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime();
    })[0];
};

module.exports.createBudget = async (userId, payload) => {
    ensureObjectId(userId, "User ID");
    return createBudget(await buildCreateBudgetPayload(userId, payload));
};

module.exports.getBudgetsByUserId = async (userId, filters = {}) => {
    ensureObjectId(userId, "User ID");

    const queryFilters = {};

    if (filters.status) {
        queryFilters.status = ensureEnumValue(filters.status, "Status", BUDGET_STATUSES);
    }

    return getBudgetsByUserId(userId, queryFilters);
};

module.exports.getBudgetById = async (userId, id) => {
    ensureObjectId(userId, "User ID");
    ensureObjectId(id, "Budget ID");

    const budget = await getBudgetByIdForUser(id, userId);

    if (!budget) {
        throw new NotFoundError("Budget not found");
    }

    return budget;
};

module.exports.updateBudget = async (userId, id, payload) => {
    ensureObjectId(userId, "User ID");
    ensureObjectId(id, "Budget ID");

    const currentBudget = await getBudgetByIdForUser(id, userId);

    if (!currentBudget) {
        throw new NotFoundError("Budget not found");
    }

    const updatePayload = await buildUpdateBudgetPayload(userId, currentBudget, payload);
    return updateBudgetForUser(id, userId, updatePayload);
};

module.exports.deleteBudget = async (userId, id) => {
    ensureObjectId(userId, "User ID");
    ensureObjectId(id, "Budget ID");

    await deleteCategoryBudgetsByBudgetId(id, userId);
    const budget = await deleteBudgetForUser(id, userId);

    if (!budget) {
        throw new NotFoundError("Budget not found");
    }

    return budget;
};

module.exports.getSelectedBudgetForRange = async (userId, from, to) => {
    ensureObjectId(userId, "User ID");

    const budgets = await findCoveringBudgetsForRange(userId, from, to);

    return {
        matchedBudgets: budgets,
        selectedBudget: chooseBestBudget(budgets)
    };
};

module.exports.deleteBudgetsByUserId = deleteBudgetsByUserId;
