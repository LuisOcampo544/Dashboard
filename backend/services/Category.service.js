const {
    createCategory,
    getCategoriesByUserId,
    getCategoryByIdForUser,
    findCategoryByNormalizedName,
    deleteCategoryForUser,
    deleteCategoriesByUserId
} = require("../repositories/Category.repository");
const {
    BadRequestError,
    ConflictError,
    NotFoundError
} = require("../errors/CustomError");
const {
    ensureAllowedFields,
    ensureObjectId,
    normalizeCategoryName
} = require("../utils/validation");
const { DEFAULT_CATEGORIES } = require("../constants/categories");

const DEFAULT_CATEGORY_MAP = new Map(
    DEFAULT_CATEGORIES.map(category => [category.toLowerCase(), category])
);

const normalizeLookupKey = (value) => normalizeCategoryName(value).toLowerCase();

module.exports.listCategories = async (userId) => {
    ensureObjectId(userId, "User ID");

    const customCategories = await getCategoriesByUserId(userId);

    return [
        ...DEFAULT_CATEGORIES.map(name => ({
            id: null,
            name,
            isDefault: true
        })),
        ...customCategories.map(category => ({
            id: category._id,
            name: category.name,
            isDefault: false
        }))
    ];
};

module.exports.createCategory = async (userId, payload) => {
    ensureObjectId(userId, "User ID");
    ensureAllowedFields(payload, ["name"], "category");

    const name = normalizeCategoryName(payload.name);
    const normalizedName = name.toLowerCase();

    if (DEFAULT_CATEGORY_MAP.has(normalizedName)) {
        throw new ConflictError("Category already exists as a default category");
    }

    const existingCategory = await findCategoryByNormalizedName(userId, normalizedName);

    if (existingCategory) {
        throw new ConflictError("Category already exists");
    }

    return createCategory({
        userId,
        name,
        normalizedName
    });
};

module.exports.deleteCategory = async (userId, categoryId) => {
    ensureObjectId(userId, "User ID");
    ensureObjectId(categoryId, "Category ID");

    const deletedCategory = await deleteCategoryForUser(categoryId, userId);

    if (!deletedCategory) {
        throw new NotFoundError("Category not found");
    }

    return deletedCategory;
};

module.exports.getCategoryById = async (userId, categoryId) => {
    ensureObjectId(userId, "User ID");
    ensureObjectId(categoryId, "Category ID");

    const category = await getCategoryByIdForUser(categoryId, userId);

    if (!category) {
        throw new NotFoundError("Category not found");
    }

    return category;
};

module.exports.resolveCategoryName = async (userId, categoryName) => {
    ensureObjectId(userId, "User ID");

    const normalizedLookupKey = normalizeLookupKey(categoryName);
    const defaultCategory = DEFAULT_CATEGORY_MAP.get(normalizedLookupKey);

    if (defaultCategory) {
        return defaultCategory;
    }

    const customCategory = await findCategoryByNormalizedName(userId, normalizedLookupKey);

    if (!customCategory) {
        throw new BadRequestError("Category is not registered for this user");
    }

    return customCategory.name;
};

module.exports.deleteCategoriesByUserId = deleteCategoriesByUserId;
