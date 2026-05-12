const {
    createIncome,
    getIncomesByUserId,
    getIncomeByIdForUser,
    updateIncomeForUser,
    deleteIncomeForUser,
    deleteIncomesByUserId
} = require("../repositories/Income.repository");
const { BadRequestError, NotFoundError } = require("../errors/CustomError");
const {
    ensureAllowedFields,
    ensureDate,
    ensureDateRange,
    ensureEnumValue,
    ensureObjectId,
    ensureOptionalString,
    ensurePositiveAmount,
    normalizeSourceName
} = require("../utils/validation");

const INCOME_FIELDS = ["amount", "source", "status", "date", "note"];
const INCOME_STATUSES = ["pending", "confirmed", "cancelled"];

const buildCreateIncomePayload = (userId, payload) => {
    ensureAllowedFields(payload, INCOME_FIELDS, "income");

    return {
        userId,
        amount: ensurePositiveAmount(payload.amount),
        source: normalizeSourceName(payload.source),
        status: payload.status ? ensureEnumValue(payload.status, "Status", INCOME_STATUSES) : "confirmed",
        date: ensureDate(payload.date),
        note: ensureOptionalString(payload.note, "Note", { maxLength: 500 })
    };
};

const buildUpdateIncomePayload = (payload) => {
    ensureAllowedFields(payload, INCOME_FIELDS, "income");

    const updatePayload = {};

    if (payload.amount !== undefined) {
        updatePayload.amount = ensurePositiveAmount(payload.amount);
    }

    if (payload.source !== undefined) {
        updatePayload.source = normalizeSourceName(payload.source);
    }

    if (payload.status !== undefined) {
        updatePayload.status = ensureEnumValue(payload.status, "Status", INCOME_STATUSES);
    }

    if (payload.date !== undefined) {
        updatePayload.date = ensureDate(payload.date);
    }

    if (payload.note !== undefined) {
        updatePayload.note = ensureOptionalString(payload.note, "Note", { maxLength: 500 });
    }

    if (Object.keys(updatePayload).length === 0) {
        throw new BadRequestError("At least one income field is required");
    }

    return updatePayload;
};

module.exports.createIncome = async (userId, incomeData) => {
    ensureObjectId(userId, "User ID");
    return createIncome(buildCreateIncomePayload(userId, incomeData));
};

module.exports.getIncomesByUserId = async (userId, filters = {}) => {
    ensureObjectId(userId, "User ID");

    const queryFilters = {};

    if (filters.from || filters.to) {
        const range = ensureDateRange(filters.from || "1970-01-01", filters.to || new Date());
        queryFilters.from = range.from;
        queryFilters.to = range.to;
    }

    if (filters.status) {
        queryFilters.status = ensureEnumValue(filters.status, "Status", INCOME_STATUSES);
    }

    if (filters.source) {
        queryFilters.source = normalizeSourceName(filters.source);
    }

    return getIncomesByUserId(userId, queryFilters);
};

module.exports.getIncomeById = async (userId, id) => {
    ensureObjectId(userId, "User ID");
    ensureObjectId(id, "Income ID");

    const income = await getIncomeByIdForUser(id, userId);

    if (!income) {
        throw new NotFoundError("Income not found");
    }

    return income;
};

module.exports.updateIncome = async (userId, id, updateData) => {
    ensureObjectId(userId, "User ID");
    ensureObjectId(id, "Income ID");

    const income = await updateIncomeForUser(id, userId, buildUpdateIncomePayload(updateData));

    if (!income) {
        throw new NotFoundError("Income not found");
    }

    return income;
};

module.exports.deleteIncome = async (userId, id) => {
    ensureObjectId(userId, "User ID");
    ensureObjectId(id, "Income ID");

    const income = await deleteIncomeForUser(id, userId);

    if (!income) {
        throw new NotFoundError("Income not found");
    }

    return income;
};

module.exports.deleteIncomesByUserId = deleteIncomesByUserId;
