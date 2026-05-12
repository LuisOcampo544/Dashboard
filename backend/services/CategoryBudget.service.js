const {
    createCategoryBudget,
    getCategoryBudgetsByUserId,
    getCategoryBudgetByIdForUser,
    findCategoryBudgetByBudgetAndCategory,
    updateCategoryBudgetForUser,
    deleteCategoryBudgetForUser,
    deleteCategoryBudgetsByUserId
} = require("../repositories/CategoryBudget.repository");
const { getBudgetByIdForUser } = require("../repositories/Budget.repository");
const { BadRequestError, ConflictError, NotFoundError } = require("../errors/CustomError");
const {
    ensureAllowedFields,
    ensureObjectId,
    ensurePositiveAmount,
    ensureThreshold
} = require("../utils/validation");
const { resolveCategoryName } = require("./Category.service");

const CATEGORY_BUDGET_FIELDS = ["budgetId", "category", "limitAmount", "alertThreshold"];

const ensureBudgetBelongsToUser = async (userId, budgetId) => {
    const budget = await getBudgetByIdForUser(budgetId, userId);

    if (!budget) {
        throw new NotFoundError("Budget not found");
    }

    return budget;
};

const validateCategoryBudgetUniqueness = async (userId, budgetId, category, currentId = null) => {
    const existingBudget = await findCategoryBudgetByBudgetAndCategory(userId, budgetId, category);

    if (existingBudget && String(existingBudget._id) !== String(currentId)) {
        throw new ConflictError("A category budget already exists for this budget and category");
    }
};

module.exports.createCategoryBudget = async (userId, payload) => {
    ensureObjectId(userId, "User ID");
    ensureAllowedFields(payload, CATEGORY_BUDGET_FIELDS, "category budget");

    ensureObjectId(payload.budgetId, "Budget ID");
    await ensureBudgetBelongsToUser(userId, payload.budgetId);

    const category = await resolveCategoryName(userId, payload.category);
    await validateCategoryBudgetUniqueness(userId, payload.budgetId, category);

    return createCategoryBudget({
        userId,
        budgetId: payload.budgetId,
        category,
        limitAmount: ensurePositiveAmount(payload.limitAmount, "limitAmount"),
        alertThreshold: ensureThreshold(payload.alertThreshold, "alertThreshold", 0.8)
    });
};

module.exports.getCategoryBudgetsByUserId = async (userId, filters = {}) => {
    ensureObjectId(userId, "User ID");

    const queryFilters = {};

    if (filters.budgetId) {
        ensureObjectId(filters.budgetId, "Budget ID");
        queryFilters.budgetId = filters.budgetId;
    }

    return getCategoryBudgetsByUserId(userId, queryFilters);
};

module.exports.getCategoryBudgetById = async (userId, id) => {
    ensureObjectId(userId, "User ID");
    ensureObjectId(id, "Category budget ID");

    const categoryBudget = await getCategoryBudgetByIdForUser(id, userId);

    if (!categoryBudget) {
        throw new NotFoundError("Category budget not found");
    }

    return categoryBudget;
};

module.exports.updateCategoryBudget = async (userId, id, payload) => {
    ensureObjectId(userId, "User ID");
    ensureObjectId(id, "Category budget ID");
    ensureAllowedFields(payload, CATEGORY_BUDGET_FIELDS, "category budget");

    const currentBudget = await getCategoryBudgetByIdForUser(id, userId);

    if (!currentBudget) {
        throw new NotFoundError("Category budget not found");
    }

    const updatePayload = {};
    const budgetId = payload.budgetId || String(currentBudget.budgetId);

    if (payload.budgetId !== undefined) {
        ensureObjectId(payload.budgetId, "Budget ID");
        await ensureBudgetBelongsToUser(userId, payload.budgetId);
        updatePayload.budgetId = payload.budgetId;
    }

    const category = payload.category !== undefined
        ? await resolveCategoryName(userId, payload.category)
        : currentBudget.category;

    if (payload.category !== undefined) {
        updatePayload.category = category;
    }

    await validateCategoryBudgetUniqueness(userId, budgetId, category, id);

    if (payload.limitAmount !== undefined) {
        updatePayload.limitAmount = ensurePositiveAmount(payload.limitAmount, "limitAmount");
    }

    if (payload.alertThreshold !== undefined) {
        updatePayload.alertThreshold = ensureThreshold(
            payload.alertThreshold,
            "alertThreshold",
            currentBudget.alertThreshold
        );
    }

    if (Object.keys(updatePayload).length === 0) {
        throw new BadRequestError("At least one category budget field is required");
    }

    return updateCategoryBudgetForUser(id, userId, updatePayload);
};

module.exports.deleteCategoryBudget = async (userId, id) => {
    ensureObjectId(userId, "User ID");
    ensureObjectId(id, "Category budget ID");

    const categoryBudget = await deleteCategoryBudgetForUser(id, userId);

    if (!categoryBudget) {
        throw new NotFoundError("Category budget not found");
    }

    return categoryBudget;
};

module.exports.deleteCategoryBudgetsByUserId = deleteCategoryBudgetsByUserId;
