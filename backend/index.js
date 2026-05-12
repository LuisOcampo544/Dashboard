const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const mongoose = require("mongoose");
const { env } = require("./config/env");
const { createConnection } = require("./config/database");
const { errorHandler } = require("./middleware/Error.middleware");
const { requestContext } = require("./middleware/Request.middleware");
const { notFoundHandler } = require("./middleware/NotFound.middleware");
const { apiRateLimiter } = require("./middleware/RateLimit.middleware");
const { authMiddleware } = require("./middleware/Auth.middleware");
const { ForbiddenError } = require("./errors/CustomError");
const { logError, logInfo } = require("./utils/logger");
const userRoutes = require("./routes/User.routes");
const expenseRoutes = require("./routes/Expense.routes");
const incomeRoutes = require("./routes/Income.routes");
const budgetRoutes = require("./routes/Budget.routes");
const categoryBudgetRoutes = require("./routes/CategoryBudget.routes");
const analyticsRoutes = require("./routes/Analytics.routes");
const categoryRoutes = require("./routes/Category.routes");

const app = express();

const resolveCorsOrigin = (origin, callback) => {
    if (!origin) {
        return callback(null, true);
    }

    const allowedOrigins = env.CORS_ORIGINS.length > 0
        ? env.CORS_ORIGINS
        : env.DEFAULT_LOCAL_ORIGINS;

    if (allowedOrigins.includes(origin)) {
        return callback(null, true);
    }

    return callback(new ForbiddenError("CORS origin not allowed", {
        code: "CORS_ORIGIN_NOT_ALLOWED",
        details: { origin }
    }));
};

const registerProcessHandlers = (server) => {
    const shutdown = async (signal, error) => {
        if (error) {
            logError(error, { context: signal || "process" });
        }

        if (server) {
            server.close(async () => {
                await mongoose.connection.close();
                process.exit(error ? 1 : 0);
            });

            return;
        }

        await mongoose.connection.close();
        process.exit(error ? 1 : 0);
    };

    process.on("unhandledRejection", (error) => {
        shutdown("unhandledRejection", error);
    });

    process.on("uncaughtException", (error) => {
        shutdown("uncaughtException", error);
    });

    process.on("SIGTERM", () => {
        shutdown("SIGTERM");
    });

    process.on("SIGINT", () => {
        shutdown("SIGINT");
    });
};

app.disable("x-powered-by");
app.use(requestContext);
app.use(helmet());
app.use(express.json({ limit: env.JSON_BODY_LIMIT }));
app.use(cors({
    origin: resolveCorsOrigin
}));
app.use("/api", apiRateLimiter);

app.use("/api/user", userRoutes);
app.use("/api/expense", authMiddleware, expenseRoutes);
app.use("/api/incomes", authMiddleware, incomeRoutes);
app.use("/api/budget-periods", authMiddleware, budgetRoutes);
app.use("/api/category-budgets", authMiddleware, categoryBudgetRoutes);
app.use("/api/analytics", authMiddleware, analyticsRoutes);
app.use("/api/categories", authMiddleware, categoryRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;

if (require.main === module) {
    createConnection()
        .then(() => {
            const server = app.listen(env.PORT, () => {
                logInfo(`Server running on port ${env.PORT}`);
            });

            registerProcessHandlers(server);
        })
        .catch((error) => {
            logError(error, { context: "server.startup" });
            process.exit(1);
        });
}
