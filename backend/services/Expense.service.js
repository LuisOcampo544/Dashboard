const {
    createExpense,
    getExpensesByUserId,
    getExpenseByIdForUser,
    updateExpenseForUser,
    deleteExpenseForUser,
    deleteExpensesByUserId
} = require("../repositories/Expense.repository");
const { NotFoundError, BadRequestError } = require("../errors/CustomError");
const {
    ensureAllowedFields,
    ensureDate,
    ensureDateRange,
    ensureObjectId,
    ensureOptionalString,
    ensurePositiveAmount
} = require("../utils/validation");
const { resolveCategoryName } = require("./Category.service");

const EXPENSE_FIELDS = ["amount", "category", "date", "note"];

const buildCreateExpensePayload = async (userId, payload) => {
    ensureAllowedFields(payload, EXPENSE_FIELDS, "expense");

    return {
        userId,
        amount: ensurePositiveAmount(payload.amount),
        category: await resolveCategoryName(userId, payload.category),
        date: ensureDate(payload.date),
        note: ensureOptionalString(payload.note, "Note", { maxLength: 500 })
    };
};

const buildUpdateExpensePayload = async (userId, payload) => {
    ensureAllowedFields(payload, EXPENSE_FIELDS, "expense");

    const updatePayload = {};

    if (payload.amount !== undefined) {
        updatePayload.amount = ensurePositiveAmount(payload.amount);
    }

    if (payload.category !== undefined) {
        updatePayload.category = await resolveCategoryName(userId, payload.category);
    }

    if (payload.date !== undefined) {
        updatePayload.date = ensureDate(payload.date);
    }

    if (payload.note !== undefined) {
        updatePayload.note = ensureOptionalString(payload.note, "Note", { maxLength: 500 });
    }

    if (Object.keys(updatePayload).length === 0) {
        throw new BadRequestError("At least one expense field is required");
    }

    return updatePayload;
};

module.exports.createExpense = async (userId, expenseData) => {
    ensureObjectId(userId, "User ID");
    const payload = await buildCreateExpensePayload(userId, expenseData);
    return createExpense(payload);
};

module.exports.getExpensesByUserId = async (userId, filters = {}) => {
    ensureObjectId(userId, "User ID");

    const queryFilters = {};

    if (filters.from || filters.to) {
        const range = ensureDateRange(filters.from || "1970-01-01", filters.to || new Date());
        queryFilters.from = range.from;
        queryFilters.to = range.to;
    }

    if (filters.category) {
        queryFilters.category = await resolveCategoryName(userId, filters.category);
    }

    return getExpensesByUserId(userId, queryFilters);
};

module.exports.getExpenseById = async (userId, id) => {
    ensureObjectId(userId, "User ID");
    ensureObjectId(id, "Expense ID");

    const expense = await getExpenseByIdForUser(id, userId);

    if (!expense) {
        throw new NotFoundError("Expense not found");
    }

    return expense;
};

module.exports.updateExpense = async (userId, id, updateData) => {
    ensureObjectId(userId, "User ID");
    ensureObjectId(id, "Expense ID");

    const payload = await buildUpdateExpensePayload(userId, updateData);
    const expense = await updateExpenseForUser(id, userId, payload);

    if (!expense) {
        throw new NotFoundError("Expense not found");
    }

    return expense;
};

module.exports.deleteExpense = async (userId, id) => {
    ensureObjectId(userId, "User ID");
    ensureObjectId(id, "Expense ID");

    const expense = await deleteExpenseForUser(id, userId);

    if (!expense) {
        throw new NotFoundError("Expense not found");
    }

    return expense;
};

module.exports.deleteExpensesByUserId = deleteExpensesByUserId;
