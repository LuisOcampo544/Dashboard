const { env } = require("../config/env");

const getNodeEnv = () => process.env.NODE_ENV || env.NODE_ENV;
const shouldLog = () => getNodeEnv() !== "test";

const baseEntry = (level, payload) => ({
    level,
    timestamp: new Date().toISOString(),
    ...payload
});

const logInfo = (message, payload = {}) => {
    if (!shouldLog()) {
        return;
    }

    console.log(JSON.stringify(baseEntry("info", { message, ...payload })));
};

const logError = (error, payload = {}) => {
    if (!shouldLog()) {
        return;
    }

    console.error(JSON.stringify(baseEntry("error", {
        message: error?.message || "Unexpected error",
        errorName: error?.name || "Error",
        errorCode: error?.code || null,
        statusCode: error?.statusCode || null,
        stack: getNodeEnv() === "production" ? undefined : error?.stack,
        ...payload
    })));
};

module.exports = {
    logInfo,
    logError
};
