const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const {
    createUser: createUserRepo,
    findUserByEmail,
    findUserById,
    updateUserProfile,
    updateUserPassword,
    deleteUser: deleteUserRepo
} = require("../repositories/User.repositories");
const { deleteExpensesByUserId } = require("./Expense.service");
const { deleteIncomesByUserId } = require("./Income.service");
const { deleteBudgetsByUserId } = require("./Budget.service");
const { deleteCategoryBudgetsByUserId } = require("./CategoryBudget.service");
const { deleteCategoriesByUserId } = require("./Category.service");
const {
    BadRequestError,
    UnauthorizedError,
    NotFoundError,
    ConflictError
} = require("../errors/CustomError");
const {
    ensureAllowedFields,
    ensureCurrencyCode,
    ensureObjectId,
    ensureRequiredString,
    normalizeEmail
} = require("../utils/validation");
const { env } = require("../config/env");

const USER_PROFILE_FIELDS = ["name", "email", "currency"];

const createToken = (user) => {
    return jwt.sign({ id: String(user._id) }, env.JWT_SECRET, { expiresIn: env.JWT_EXPIRES_IN });
};

const ensurePassword = (password, fieldName) => {
    const normalizedPassword = ensureRequiredString(password, fieldName, { minLength: 8, maxLength: 128 });

    if (normalizedPassword.length < 8) {
        throw new BadRequestError(`${fieldName} must be at least 8 characters`);
    }

    return normalizedPassword;
};

const buildUserResponse = (user) => ({
    id: user._id,
    name: user.name,
    email: user.email,
    currency: user.currency
});

module.exports.getUserByEmail = async (email) => {
    return findUserByEmail(normalizeEmail(email));
};

module.exports.getUserById = async (id) => {
    ensureObjectId(id, "User ID");

    const user = await findUserById(id);

    if (!user) {
        throw new NotFoundError("User not found");
    }

    return user;
};

module.exports.updateUser = async (id, updateData) => {
    ensureObjectId(id, "User ID");
    ensureAllowedFields(updateData, USER_PROFILE_FIELDS, "user");

    const payload = {};

    if (updateData.name !== undefined) {
        payload.name = ensureRequiredString(updateData.name, "Name", { maxLength: 120 });
    }

    if (updateData.email !== undefined) {
        payload.email = normalizeEmail(updateData.email);
        const existingUser = await findUserByEmail(payload.email);

        if (existingUser && String(existingUser._id) !== String(id)) {
            throw new ConflictError("User already exists");
        }
    }

    if (updateData.currency !== undefined) {
        payload.currency = ensureCurrencyCode(updateData.currency);
    }

    if (Object.keys(payload).length === 0) {
        throw new BadRequestError("At least one user field is required");
    }

    const user = await updateUserProfile(id, payload);

    if (!user) {
        throw new NotFoundError("User not found");
    }

    return user;
};

module.exports.updatePassword = async (id, passwordData) => {
    ensureObjectId(id, "User ID");
    ensureAllowedFields(passwordData, ["currentPassword", "newPassword"], "password update");

    const currentPassword = ensurePassword(passwordData.currentPassword, "currentPassword");
    const newPassword = ensurePassword(passwordData.newPassword, "newPassword");
    const user = await findUserById(id);

    if (!user) {
        throw new NotFoundError("User not found");
    }

    const userWithPassword = await findUserByEmail(user.email, { includePassword: true });
    const isMatch = await bcrypt.compare(currentPassword, userWithPassword.password);

    if (!isMatch) {
        throw new UnauthorizedError("Current password is invalid");
    }

    await updateUserPassword(id, newPassword);
    return { message: "Password updated successfully" };
};

module.exports.deleteUser = async (id) => {
    ensureObjectId(id, "User ID");

    const existingUser = await findUserById(id);

    if (!existingUser) {
        throw new NotFoundError("User not found");
    }

    await Promise.all([
        deleteExpensesByUserId(id),
        deleteIncomesByUserId(id),
        deleteBudgetsByUserId(id),
        deleteCategoryBudgetsByUserId(id),
        deleteCategoriesByUserId(id)
    ]);

    return deleteUserRepo(id);
};

module.exports.loginUser = async ({ email, password }) => {
    const normalizedEmail = normalizeEmail(email);
    const normalizedPassword = ensurePassword(password, "Password");
    const user = await findUserByEmail(normalizedEmail, { includePassword: true });

    if (!user) {
        throw new NotFoundError("User not found");
    }

    const isMatch = await bcrypt.compare(normalizedPassword, user.password);

    if (!isMatch) {
        throw new UnauthorizedError("Invalid password");
    }

    return {
        token: createToken(user),
        user: buildUserResponse(user)
    };
};

module.exports.registerUser = async (userData) => {
    const name = ensureRequiredString(userData.name, "Name", { maxLength: 120 });
    const email = normalizeEmail(userData.email);
    const password = ensurePassword(userData.password, "Password");
    const currency = ensureCurrencyCode(userData.currency, "USD");
    const existingUser = await findUserByEmail(email);

    if (existingUser) {
        throw new ConflictError("User already exists");
    }

    const user = await createUserRepo({ name, email, password, currency });

    return {
        token: createToken(user),
        user: buildUserResponse(user)
    };
};
