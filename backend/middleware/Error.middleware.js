const {
    BadRequestError,
    ConflictError,
    CustomError,
    InternalServerError,
    TooManyRequestsError,
    UnauthorizedError
} = require("../errors/CustomError");
const { env } = require("../config/env");
const { logError } = require("../utils/logger");

const buildValidationDetails = (errors = {}) => {
    return Object.values(errors).map(error => ({
        field: error.path,
        message: error.message
    }));
};

const normalizeError = (err) => {
    if (err instanceof CustomError) {
        return err;
    }

    if (err?.name === "ValidationError") {
        return new BadRequestError("Validation failed", {
            code: "VALIDATION_ERROR",
            details: buildValidationDetails(err.errors)
        });
    }

    if (err?.name === "CastError") {
        return new BadRequestError(`${err.path} is invalid`, {
            code: "INVALID_IDENTIFIER",
            details: {
                field: err.path,
                value: err.value
            }
        });
    }

    if (err?.code === 11000) {
        return new ConflictError("Duplicate value", {
            code: "DUPLICATE_VALUE",
            details: {
                fields: Object.keys(err.keyValue || {})
            }
        });
    }

    if (err?.name === "TokenExpiredError") {
        return new UnauthorizedError("Token expired", {
            code: "TOKEN_EXPIRED"
        });
    }

    if (err?.name === "JsonWebTokenError") {
        return new UnauthorizedError("Invalid token", {
            code: "INVALID_TOKEN"
        });
    }

    if (err instanceof SyntaxError && err.status === 400 && Object.prototype.hasOwnProperty.call(err, "body")) {
        return new BadRequestError("Malformed JSON payload", {
            code: "MALFORMED_JSON"
        });
    }

    if (err?.status === 429 || err?.statusCode === 429) {
        return new TooManyRequestsError("Too many requests", {
            code: err.code || "TOO_MANY_REQUESTS",
            details: err.details || null
        });
    }

    return new InternalServerError("Internal Server Error", {
        cause: err
    });
};

module.exports.errorHandler = (err, req, res, next) => {
    const normalizedError = normalizeError(err);
    const requestId = req.requestId || res.locals.requestId || null;
    const isProduction = (process.env.NODE_ENV || env.NODE_ENV) === "production";
    const errorMessage = isProduction && !normalizedError.expose
        ? "Internal Server Error"
        : normalizedError.message;

    logError(err, {
        requestId,
        method: req.method,
        path: req.originalUrl,
        normalizedCode: normalizedError.code,
        normalizedStatus: normalizedError.statusCode
    });

    const responseBody = {
        success: false,
        error: {
            code: normalizedError.code,
            message: errorMessage,
            status: normalizedError.statusCode,
            details: normalizedError.details ?? null,
            requestId
        }
    };

    if (!isProduction) {
        responseBody.error.stack = normalizedError.cause?.stack || normalizedError.stack;
    }

    res.status(normalizedError.statusCode).json(responseBody);
};
