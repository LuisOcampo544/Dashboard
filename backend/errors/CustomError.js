class CustomError extends Error {
    constructor(message, options = {}) {
        const {
            statusCode = 500,
            code = "INTERNAL_SERVER_ERROR",
            details = null,
            expose = statusCode < 500,
            cause = null
        } = options;

        super(message, cause ? { cause } : undefined);

        this.name = this.constructor.name;
        this.statusCode = statusCode;
        this.code = code;
        this.details = details;
        this.expose = expose;
        this.isOperational = true;

        if (cause) {
            this.cause = cause;
        }

        Error.captureStackTrace(this, this.constructor);
    }
}

class BadRequestError extends CustomError {
    constructor(message = "Bad Request", options = {}) {
        super(message, { statusCode: 400, code: "BAD_REQUEST", ...options });
    }
}

class UnauthorizedError extends CustomError {
    constructor(message = "Unauthorized", options = {}) {
        super(message, { statusCode: 401, code: "UNAUTHORIZED", ...options });
    }
}

class ForbiddenError extends CustomError {
    constructor(message = "Forbidden", options = {}) {
        super(message, { statusCode: 403, code: "FORBIDDEN", ...options });
    }
}

class NotFoundError extends CustomError {
    constructor(message = "Not Found", options = {}) {
        super(message, { statusCode: 404, code: "NOT_FOUND", ...options });
    }
}

class MethodNotAllowedError extends CustomError {
    constructor(message = "Method Not Allowed", options = {}) {
        super(message, { statusCode: 405, code: "METHOD_NOT_ALLOWED", ...options });
    }
}

class ConflictError extends CustomError {
    constructor(message = "Conflict", options = {}) {
        super(message, { statusCode: 409, code: "CONFLICT", ...options });
    }
}

class TooManyRequestsError extends CustomError {
    constructor(message = "Too Many Requests", options = {}) {
        super(message, { statusCode: 429, code: "TOO_MANY_REQUESTS", ...options });
    }
}

class InternalServerError extends CustomError {
    constructor(message = "Internal Server Error", options = {}) {
        super(message, {
            statusCode: 500,
            code: "INTERNAL_SERVER_ERROR",
            expose: false,
            ...options
        });
    }
}

class ConfigurationError extends CustomError {
    constructor(message = "Configuration Error", options = {}) {
        super(message, {
            statusCode: 500,
            code: "CONFIGURATION_ERROR",
            expose: false,
            ...options
        });
    }
}

module.exports = {
    CustomError,
    BadRequestError,
    UnauthorizedError,
    ForbiddenError,
    NotFoundError,
    MethodNotAllowedError,
    ConflictError,
    TooManyRequestsError,
    InternalServerError,
    ConfigurationError
};
