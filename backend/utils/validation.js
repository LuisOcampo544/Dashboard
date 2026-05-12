const mongoose = require("mongoose");
const { BadRequestError } = require("../errors/CustomError");

const roundCurrency = (value) => {
    return Math.round((value + Number.EPSILON) * 100) / 100;
};

const ensureObjectId = (value, fieldName) => {
    if (!value || !mongoose.Types.ObjectId.isValid(value)) {
        throw new BadRequestError(`${fieldName} is invalid`);
    }

    return value;
};

const ensureRequiredString = (value, fieldName, options = {}) => {
    const {
        minLength = 1,
        maxLength = 120
    } = options;

    if (typeof value !== "string") {
        throw new BadRequestError(`${fieldName} must be a string`);
    }

    const trimmedValue = value.trim();

    if (trimmedValue.length < minLength) {
        throw new BadRequestError(`${fieldName} is required`);
    }

    if (trimmedValue.length > maxLength) {
        throw new BadRequestError(`${fieldName} is too long`);
    }

    return trimmedValue;
};

const ensureOptionalString = (value, fieldName, options = {}) => {
    if (value === undefined) {
        return undefined;
    }

    if (value === null) {
        return null;
    }

    return ensureRequiredString(value, fieldName, options);
};

const ensurePositiveAmount = (value, fieldName = "Amount") => {
    const numericValue = Number(value);

    if (!Number.isFinite(numericValue) || numericValue <= 0) {
        throw new BadRequestError(`${fieldName} must be a positive number`);
    }

    return roundCurrency(numericValue);
};

const ensureDate = (value, fieldName = "Date") => {
    const parsedDate = value instanceof Date ? new Date(value.getTime()) : new Date(value);

    if (Number.isNaN(parsedDate.getTime())) {
        throw new BadRequestError(`${fieldName} is invalid`);
    }

    return parsedDate;
};

const ensureDateRange = (from, to) => {
    const fromDate = ensureDate(from, "from");
    const toDate = ensureDate(to, "to");

    if (fromDate > toDate) {
        throw new BadRequestError("from must be earlier than or equal to to");
    }

    return {
        from: fromDate,
        to: toDate
    };
};

const ensureAllowedFields = (payload, allowedFields, entityName = "payload") => {
    const payloadKeys = Object.keys(payload || {});
    const invalidFields = payloadKeys.filter(field => !allowedFields.includes(field));

    if (invalidFields.length > 0) {
        throw new BadRequestError(`Unexpected fields in ${entityName}: ${invalidFields.join(", ")}`);
    }
};

const ensureEnumValue = (value, fieldName, allowedValues) => {
    if (!allowedValues.includes(value)) {
        throw new BadRequestError(`${fieldName} must be one of: ${allowedValues.join(", ")}`);
    }

    return value;
};

const ensureCurrencyCode = (value, fallback = "USD") => {
    if (value === undefined || value === null || value === "") {
        return fallback;
    }

    if (typeof value !== "string") {
        throw new BadRequestError("Currency must be a string");
    }

    const currencyCode = value.trim().toUpperCase();

    if (!/^[A-Z]{3}$/.test(currencyCode)) {
        throw new BadRequestError("Currency must be a valid ISO code");
    }

    return currencyCode;
};

const ensureThreshold = (value, fieldName, fallback) => {
    if (value === undefined || value === null || value === "") {
        return fallback;
    }

    const numericValue = Number(value);

    if (!Number.isFinite(numericValue) || numericValue < 0 || numericValue > 1) {
        throw new BadRequestError(`${fieldName} must be a number between 0 and 1`);
    }

    return Number(numericValue.toFixed(4));
};

const normalizeEmail = (value) => {
    return ensureRequiredString(value, "Email", { maxLength: 254 }).toLowerCase();
};

const normalizeCategoryName = (value) => {
    return ensureRequiredString(value, "Category", { maxLength: 80 }).replace(/\s+/g, " ");
};

const normalizeSourceName = (value) => {
    return ensureRequiredString(value, "Source", { maxLength: 80 }).replace(/\s+/g, " ");
};

module.exports = {
    roundCurrency,
    ensureObjectId,
    ensureRequiredString,
    ensureOptionalString,
    ensurePositiveAmount,
    ensureDate,
    ensureDateRange,
    ensureAllowedFields,
    ensureEnumValue,
    ensureCurrencyCode,
    ensureThreshold,
    normalizeEmail,
    normalizeCategoryName,
    normalizeSourceName
};
