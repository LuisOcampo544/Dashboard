const { rateLimit, ipKeyGenerator } = require("express-rate-limit");
const { TooManyRequestsError } = require("../errors/CustomError");
const { env } = require("../config/env");

const buildLimitHandler = (message, code) => {
    return (req, res, next, options) => {
        next(new TooManyRequestsError(message, {
            code,
            details: {
                retryAfterSeconds: Math.ceil(options.windowMs / 1000)
            }
        }));
    };
};

const authKeyGenerator = (req) => {
    const email = typeof req.body?.email === "string"
        ? req.body.email.trim().toLowerCase()
        : "anonymous";

    return `${ipKeyGenerator(req.ip)}:${req.baseUrl}${req.path}:${email}`;
};

const apiRateLimiter = rateLimit({
    windowMs: env.API_RATE_LIMIT_WINDOW_MS,
    max: env.API_RATE_LIMIT_MAX,
    standardHeaders: true,
    legacyHeaders: false,
    handler: buildLimitHandler("Too many requests to the API", "API_RATE_LIMIT_EXCEEDED")
});

const authRateLimiter = rateLimit({
    windowMs: env.AUTH_RATE_LIMIT_WINDOW_MS,
    max: env.AUTH_RATE_LIMIT_MAX,
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator: authKeyGenerator,
    handler: buildLimitHandler("Too many authentication attempts", "AUTH_RATE_LIMIT_EXCEEDED")
});

module.exports = {
    apiRateLimiter,
    authRateLimiter
};
