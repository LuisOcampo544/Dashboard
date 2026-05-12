const dotenv = require("dotenv");
const { ConfigurationError } = require("../errors/CustomError");

dotenv.config({ quiet: true });

const ALLOWED_NODE_ENVS = ["development", "test", "production"];
const DEFAULT_LOCAL_ORIGINS = [
    "http://localhost:3000",
    "http://localhost:3001",
    "http://localhost:5173",
    "http://127.0.0.1:3000",
    "http://127.0.0.1:3001",
    "http://127.0.0.1:5173"
];

const parseInteger = (value, key) => {
    const parsedValue = Number.parseInt(value, 10);

    if (!Number.isInteger(parsedValue) || parsedValue <= 0) {
        throw new ConfigurationError(`${key} must be a positive integer`, {
            code: "INVALID_ENV_CONFIGURATION",
            details: { key }
        });
    }

    return parsedValue;
};

const getRequiredValue = (key) => {
    const value = process.env[key];

    if (!value || value.trim() === "") {
        throw new ConfigurationError(`${key} is required`, {
            code: "INVALID_ENV_CONFIGURATION",
            details: { key }
        });
    }

    return value.trim();
};

const nodeEnv = process.env.NODE_ENV || "development";

if (!ALLOWED_NODE_ENVS.includes(nodeEnv)) {
    throw new ConfigurationError("NODE_ENV is invalid", {
        code: "INVALID_ENV_CONFIGURATION",
        details: {
            key: "NODE_ENV",
            allowedValues: ALLOWED_NODE_ENVS
        }
    });
}

const configuredOrigins = (process.env.CORS_ORIGINS || "")
    .split(",")
    .map(origin => origin.trim())
    .filter(Boolean);

if (nodeEnv === "production" && configuredOrigins.length === 0) {
    throw new ConfigurationError("CORS_ORIGINS is required in production", {
        code: "INVALID_ENV_CONFIGURATION",
        details: { key: "CORS_ORIGINS" }
    });
}

const env = {
    NODE_ENV: nodeEnv,
    PORT: parseInteger(process.env.PORT || "3000", "PORT"),
    MONGODB_URI: getRequiredValue("MONGODB_URI"),
    JWT_SECRET: getRequiredValue("JWT_SECRET"),
    JWT_EXPIRES_IN: (process.env.JWT_EXPIRES_IN || "1y").trim(),
    CORS_ORIGINS: configuredOrigins,
    DEFAULT_LOCAL_ORIGINS,
    JSON_BODY_LIMIT: "16kb",
    API_RATE_LIMIT_WINDOW_MS: parseInteger(
        process.env.API_RATE_LIMIT_WINDOW_MS || (nodeEnv === "test" ? "60000" : "900000"),
        "API_RATE_LIMIT_WINDOW_MS"
    ),
    API_RATE_LIMIT_MAX: parseInteger(
        process.env.API_RATE_LIMIT_MAX || (nodeEnv === "test" ? "500" : "200"),
        "API_RATE_LIMIT_MAX"
    ),
    AUTH_RATE_LIMIT_WINDOW_MS: parseInteger(
        process.env.AUTH_RATE_LIMIT_WINDOW_MS || (nodeEnv === "test" ? "60000" : "900000"),
        "AUTH_RATE_LIMIT_WINDOW_MS"
    ),
    AUTH_RATE_LIMIT_MAX: parseInteger(
        process.env.AUTH_RATE_LIMIT_MAX || (nodeEnv === "test" ? "50" : "5"),
        "AUTH_RATE_LIMIT_MAX"
    )
};

module.exports = {
    env
};
