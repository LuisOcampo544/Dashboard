const mongoose = require("mongoose");
const { env } = require("./env");
const { logError, logInfo } = require("../utils/logger");

module.exports.createConnection = async (callback = () => {}) => {
    try {
        await mongoose.connect(env.MONGODB_URI);
        logInfo("Connected to MongoDB");
        return callback();
    } catch (error) {
        logError(error, { context: "database.connect" });
        throw error;
    }
};
