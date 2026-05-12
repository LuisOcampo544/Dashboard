const request = require("supertest");
const jwt = require("jsonwebtoken");
const mockBcrypt = require("bcryptjs");

process.env.NODE_ENV = "test";
process.env.JWT_SECRET = "test-secret";
process.env.JWT_EXPIRES_IN = "1y";
process.env.AUTH_RATE_LIMIT_MAX = "3";
process.env.AUTH_RATE_LIMIT_WINDOW_MS = "60000";
process.env.API_RATE_LIMIT_MAX = "200";
process.env.API_RATE_LIMIT_WINDOW_MS = "60000";

const { errorHandler } = require("../middleware/Error.middleware");

const mockState = {};
let idCounter = 1;
let mockEmailCounter = 1;

const mockNextId = () => (idCounter++).toString(16).padStart(24, "0");
const mockClone = (value) => structuredClone(value);

const withoutPassword = (user, includePassword = false) => {
    if (!user) {
        return null;
    }

    const result = mockClone(user);

    if (!includePassword) {
        delete result.password;
    }

    return result;
};

const resetState = () => {
    mockState.users = [];
    mockState.expenses = [];
    mockState.incomes = [];
    mockState.budgets = [];
    mockState.categoryBudgets = [];
    mockState.categories = [];
    idCounter = 1;
};

const sortByDateDesc = (items) => {
    return [...items].sort((left, right) => {
        const leftDate = new Date(left.date || left.startDate).getTime();
        const rightDate = new Date(right.date || right.startDate).getTime();

        if (leftDate !== rightDate) {
            return rightDate - leftDate;
        }

        return new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime();
    });
};

const aggregateTotal = (items) => {
    const total = items.reduce((sum, item) => sum + item.amount, 0);
    return total > 0 ? [{ _id: null, total }] : [];
};

const aggregateByCategory = (items) => {
    const totals = new Map();

    items.forEach(item => {
        totals.set(item.category, (totals.get(item.category) || 0) + item.amount);
    });

    return [...totals.entries()]
        .map(([category, total]) => ({ _id: category, total }))
        .sort((left, right) => right.total - left.total || left._id.localeCompare(right._id));
};

const filterByDateRange = (items, from, to) => {
    return items.filter(item => item.date >= from && item.date <= to);
};

jest.mock("../config/database", () => ({
    createConnection: jest.fn(async () => undefined)
}));

jest.mock("../repositories/User.repositories", () => ({
    createUser: jest.fn(async (userData) => {
        const user = {
            _id: mockNextId(),
            name: userData.name,
            email: userData.email,
            password: await mockBcrypt.hash(userData.password, 10),
            currency: userData.currency || "USD",
            createdAt: new Date()
        };

        mockState.users.push(user);
        return withoutPassword(user);
    }),
    findUserByEmail: jest.fn(async (email, options = {}) => {
        const user = mockState.users.find(item => item.email === email);
        return withoutPassword(user, options.includePassword);
    }),
    findUserById: jest.fn(async (id) => {
        const user = mockState.users.find(item => item._id === id);
        return withoutPassword(user);
    }),
    updateUserProfile: jest.fn(async (id, updateData) => {
        const user = mockState.users.find(item => item._id === id);

        if (!user) {
            return null;
        }

        Object.assign(user, updateData);
        return withoutPassword(user);
    }),
    updateUserPassword: jest.fn(async (id, password) => {
        const user = mockState.users.find(item => item._id === id);

        if (!user) {
            return null;
        }

        user.password = await mockBcrypt.hash(password, 10);
        return withoutPassword(user);
    }),
    deleteUser: jest.fn(async (id) => {
        const index = mockState.users.findIndex(item => item._id === id);

        if (index === -1) {
            return null;
        }

        const [user] = mockState.users.splice(index, 1);
        return withoutPassword(user);
    })
}));

jest.mock("../repositories/Expense.repository", () => ({
    createExpense: jest.fn(async (expenseData) => {
        const expense = {
            _id: mockNextId(),
            ...mockClone(expenseData),
            date: new Date(expenseData.date),
            note: expenseData.note ?? null,
            createdAt: new Date(),
            updatedAt: new Date()
        };

        mockState.expenses.push(expense);
        return mockClone(expense);
    }),
    getExpensesByUserId: jest.fn(async (userId, filters = {}) => {
        let items = mockState.expenses.filter(item => item.userId === userId);

        if (filters.category) {
            items = items.filter(item => item.category === filters.category);
        }

        if (filters.from) {
            items = items.filter(item => item.date >= filters.from);
        }

        if (filters.to) {
            items = items.filter(item => item.date <= filters.to);
        }

        return sortByDateDesc(items).map(mockClone);
    }),
    getExpenseByIdForUser: jest.fn(async (id, userId) => {
        const expense = mockState.expenses.find(item => item._id === id && item.userId === userId);
        return expense ? mockClone(expense) : null;
    }),
    updateExpenseForUser: jest.fn(async (id, userId, updateData) => {
        const expense = mockState.expenses.find(item => item._id === id && item.userId === userId);

        if (!expense) {
            return null;
        }

        Object.assign(expense, updateData, { updatedAt: new Date() });
        return mockClone(expense);
    }),
    deleteExpenseForUser: jest.fn(async (id, userId) => {
        const index = mockState.expenses.findIndex(item => item._id === id && item.userId === userId);

        if (index === -1) {
            return null;
        }

        const [expense] = mockState.expenses.splice(index, 1);
        return mockClone(expense);
    }),
    deleteExpensesByUserId: jest.fn(async (userId) => {
        mockState.expenses = mockState.expenses.filter(item => item.userId !== userId);
    }),
    aggregateExpenseTotal: jest.fn(async (userId, from, to) => {
        return aggregateTotal(filterByDateRange(mockState.expenses.filter(item => item.userId === userId), from, to));
    }),
    aggregateExpenseByCategory: jest.fn(async (userId, from, to) => {
        return aggregateByCategory(filterByDateRange(mockState.expenses.filter(item => item.userId === userId), from, to));
    })
}));

jest.mock("../repositories/Income.repository", () => ({
    createIncome: jest.fn(async (incomeData) => {
        const income = {
            _id: mockNextId(),
            ...mockClone(incomeData),
            date: new Date(incomeData.date),
            note: incomeData.note ?? null,
            createdAt: new Date(),
            updatedAt: new Date()
        };

        mockState.incomes.push(income);
        return mockClone(income);
    }),
    getIncomesByUserId: jest.fn(async (userId, filters = {}) => {
        let items = mockState.incomes.filter(item => item.userId === userId);

        if (filters.status) {
            items = items.filter(item => item.status === filters.status);
        }

        if (filters.source) {
            items = items.filter(item => item.source === filters.source);
        }

        if (filters.from) {
            items = items.filter(item => item.date >= filters.from);
        }

        if (filters.to) {
            items = items.filter(item => item.date <= filters.to);
        }

        return sortByDateDesc(items).map(mockClone);
    }),
    getIncomeByIdForUser: jest.fn(async (id, userId) => {
        const income = mockState.incomes.find(item => item._id === id && item.userId === userId);
        return income ? mockClone(income) : null;
    }),
    updateIncomeForUser: jest.fn(async (id, userId, updateData) => {
        const income = mockState.incomes.find(item => item._id === id && item.userId === userId);

        if (!income) {
            return null;
        }

        Object.assign(income, updateData, { updatedAt: new Date() });
        return mockClone(income);
    }),
    deleteIncomeForUser: jest.fn(async (id, userId) => {
        const index = mockState.incomes.findIndex(item => item._id === id && item.userId === userId);

        if (index === -1) {
            return null;
        }

        const [income] = mockState.incomes.splice(index, 1);
        return mockClone(income);
    }),
    deleteIncomesByUserId: jest.fn(async (userId) => {
        mockState.incomes = mockState.incomes.filter(item => item.userId !== userId);
    }),
    aggregateConfirmedIncomeTotal: jest.fn(async (userId, from, to) => {
        const items = mockState.incomes
            .filter(item => item.userId === userId && item.status === "confirmed");

        return aggregateTotal(filterByDateRange(items, from, to));
    })
}));

jest.mock("../repositories/Budget.repository", () => ({
    createBudget: jest.fn(async (budgetData) => {
        const budget = {
            _id: mockNextId(),
            ...mockClone(budgetData),
            startDate: new Date(budgetData.startDate),
            endDate: new Date(budgetData.endDate),
            createdAt: new Date(),
            updatedAt: new Date()
        };

        mockState.budgets.push(budget);
        return mockClone(budget);
    }),
    getBudgetsByUserId: jest.fn(async (userId, filters = {}) => {
        let budgets = mockState.budgets.filter(item => item.userId === userId);

        if (filters.status) {
            budgets = budgets.filter(item => item.status === filters.status);
        }

        return sortByDateDesc(budgets).map(mockClone);
    }),
    getBudgetByIdForUser: jest.fn(async (id, userId) => {
        const budget = mockState.budgets.find(item => item._id === id && item.userId === userId);
        return budget ? mockClone(budget) : null;
    }),
    updateBudgetForUser: jest.fn(async (id, userId, updateData) => {
        const budget = mockState.budgets.find(item => item._id === id && item.userId === userId);

        if (!budget) {
            return null;
        }

        Object.assign(budget, updateData, { updatedAt: new Date() });
        return mockClone(budget);
    }),
    deleteBudgetForUser: jest.fn(async (id, userId) => {
        const index = mockState.budgets.findIndex(item => item._id === id && item.userId === userId);

        if (index === -1) {
            return null;
        }

        const [budget] = mockState.budgets.splice(index, 1);
        return mockClone(budget);
    }),
    findCoveringBudgetsForRange: jest.fn(async (userId, from, to) => {
        return mockState.budgets
            .filter(item => (
                item.userId === userId &&
                item.status === "active" &&
                item.startDate <= from &&
                item.endDate >= to
            ))
            .map(mockClone);
    }),
    deleteBudgetsByUserId: jest.fn(async (userId) => {
        mockState.budgets = mockState.budgets.filter(item => item.userId !== userId);
    })
}));

jest.mock("../repositories/CategoryBudget.repository", () => ({
    createCategoryBudget: jest.fn(async (budgetData) => {
        const categoryBudget = {
            _id: mockNextId(),
            ...mockClone(budgetData),
            createdAt: new Date(),
            updatedAt: new Date()
        };

        mockState.categoryBudgets.push(categoryBudget);
        return mockClone(categoryBudget);
    }),
    getCategoryBudgetsByUserId: jest.fn(async (userId, filters = {}) => {
        let items = mockState.categoryBudgets.filter(item => item.userId === userId);

        if (filters.budgetId) {
            items = items.filter(item => item.budgetId === filters.budgetId);
        }

        return items.map(mockClone);
    }),
    getCategoryBudgetByIdForUser: jest.fn(async (id, userId) => {
        const item = mockState.categoryBudgets.find(entry => entry._id === id && entry.userId === userId);
        return item ? mockClone(item) : null;
    }),
    findCategoryBudgetByBudgetAndCategory: jest.fn(async (userId, budgetId, category) => {
        const item = mockState.categoryBudgets.find(entry => (
            entry.userId === userId &&
            entry.budgetId === budgetId &&
            entry.category === category
        ));

        return item ? mockClone(item) : null;
    }),
    updateCategoryBudgetForUser: jest.fn(async (id, userId, updateData) => {
        const item = mockState.categoryBudgets.find(entry => entry._id === id && entry.userId === userId);

        if (!item) {
            return null;
        }

        Object.assign(item, updateData, { updatedAt: new Date() });
        return mockClone(item);
    }),
    deleteCategoryBudgetForUser: jest.fn(async (id, userId) => {
        const index = mockState.categoryBudgets.findIndex(entry => entry._id === id && entry.userId === userId);

        if (index === -1) {
            return null;
        }

        const [item] = mockState.categoryBudgets.splice(index, 1);
        return mockClone(item);
    }),
    getCategoryBudgetsForBudget: jest.fn(async (userId, budgetId) => {
        return mockState.categoryBudgets
            .filter(item => item.userId === userId && item.budgetId === String(budgetId))
            .map(mockClone);
    }),
    deleteCategoryBudgetsByBudgetId: jest.fn(async (budgetId, userId) => {
        mockState.categoryBudgets = mockState.categoryBudgets.filter(item => !(item.budgetId === budgetId && item.userId === userId));
    }),
    deleteCategoryBudgetsByUserId: jest.fn(async (userId) => {
        mockState.categoryBudgets = mockState.categoryBudgets.filter(item => item.userId !== userId);
    })
}));

jest.mock("../repositories/Category.repository", () => ({
    createCategory: jest.fn(async (categoryData) => {
        const category = {
            _id: mockNextId(),
            ...mockClone(categoryData),
            createdAt: new Date()
        };

        mockState.categories.push(category);
        return mockClone(category);
    }),
    getCategoriesByUserId: jest.fn(async (userId) => {
        return mockState.categories.filter(item => item.userId === userId).map(mockClone);
    }),
    getCategoryByIdForUser: jest.fn(async (id, userId) => {
        const category = mockState.categories.find(item => item._id === id && item.userId === userId);
        return category ? mockClone(category) : null;
    }),
    findCategoryByNormalizedName: jest.fn(async (userId, normalizedName) => {
        const category = mockState.categories.find(item => item.userId === userId && item.normalizedName === normalizedName);
        return category ? mockClone(category) : null;
    }),
    deleteCategoryForUser: jest.fn(async (id, userId) => {
        const index = mockState.categories.findIndex(item => item._id === id && item.userId === userId);

        if (index === -1) {
            return null;
        }

        const [category] = mockState.categories.splice(index, 1);
        return mockClone(category);
    }),
    deleteCategoriesByUserId: jest.fn(async (userId) => {
        mockState.categories = mockState.categories.filter(item => item.userId !== userId);
    })
}));

const app = require("../index");

const expectErrorResponse = (response, { status, code, message }) => {
    expect(response.status).toBe(status);
    expect(response.headers["x-request-id"]).toBeDefined();
    expect(response.body.success).toBe(false);
    expect(response.body.error.status).toBe(status);
    expect(response.body.error.code).toBe(code);
    expect(response.body.error.requestId).toBe(response.headers["x-request-id"]);

    if (message) {
        expect(response.body.error.message).toBe(message);
    }
};

const registerUser = async (overrides = {}) => {
    const payload = {
        name: "User Test",
        email: `user${mockEmailCounter++}@mail.com`,
        password: "Password123",
        currency: "USD",
        ...overrides
    };

    const response = await request(app)
        .post("/api/user/register")
        .send(payload);

    return response.body;
};

beforeEach(() => {
    resetState();
    jest.spyOn(console, "error").mockImplementation(() => {});
    jest.spyOn(console, "log").mockImplementation(() => {});
});

afterEach(() => {
    jest.restoreAllMocks();
    process.env.NODE_ENV = "test";
});

describe("Financial backend hardening", () => {
    test("registers, logs in, protects routes, never returns password and sends request ids", async () => {
        const registerResponse = await request(app)
            .post("/api/user/register")
            .send({
                name: "Alpha",
                email: "alpha@mail.com",
                password: "Password123",
                currency: "USD"
            });

        expect(registerResponse.status).toBe(201);
        expect(registerResponse.headers["x-request-id"]).toBeDefined();
        expect(registerResponse.body.token).toBeDefined();
        expect(registerResponse.body.user.email).toBe("alpha@mail.com");
        expect(registerResponse.body.user.password).toBeUndefined();

        const protectedResponse = await request(app)
            .get(`/api/user/${registerResponse.body.user.id}`)
            .set("Authorization", `Bearer ${registerResponse.body.token}`);

        expect(protectedResponse.status).toBe(200);
        expect(protectedResponse.headers["x-request-id"]).toBeDefined();
        expect(protectedResponse.body.password).toBeUndefined();

        const invalidTokenResponse = await request(app)
            .get("/api/expense")
            .set("Authorization", "Bearer invalid-token");

        expectErrorResponse(invalidTokenResponse, {
            status: 401,
            code: "INVALID_TOKEN",
            message: "Invalid token"
        });

        const loginResponse = await request(app)
            .post("/api/user/login")
            .send({ email: "alpha@mail.com", password: "Password123" });

        expect(loginResponse.status).toBe(200);
        expect(loginResponse.headers["x-request-id"]).toBeDefined();
        expect(loginResponse.body.token).toBeDefined();
    });

    test("user A cannot access user B profile", async () => {
        const userA = await registerUser({ email: "usera@mail.com" });
        const userB = await registerUser({ email: "userb@mail.com" });

        const response = await request(app)
            .get(`/api/user/${userB.user.id}`)
            .set("Authorization", `Bearer ${userA.token}`);

        expectErrorResponse(response, {
            status: 403,
            code: "FORBIDDEN",
            message: "You can only access your own user resource"
        });
    });

    test("user A cannot read, edit or delete user B expense", async () => {
        const userA = await registerUser({ email: "usera@mail.com" });
        const userB = await registerUser({ email: "userb@mail.com" });

        const expenseResponse = await request(app)
            .post("/api/expense")
            .set("Authorization", `Bearer ${userB.token}`)
            .send({
                amount: 120,
                category: "Food",
                date: "2026-05-03"
            });

        const expenseId = expenseResponse.body._id;

        const getResponse = await request(app)
            .get(`/api/expense/${expenseId}`)
            .set("Authorization", `Bearer ${userA.token}`);

        const updateResponse = await request(app)
            .put(`/api/expense/${expenseId}`)
            .set("Authorization", `Bearer ${userA.token}`)
            .send({ amount: 200 });

        const deleteResponse = await request(app)
            .delete(`/api/expense/${expenseId}`)
            .set("Authorization", `Bearer ${userA.token}`);

        expectErrorResponse(getResponse, { status: 404, code: "NOT_FOUND", message: "Expense not found" });
        expectErrorResponse(updateResponse, { status: 404, code: "NOT_FOUND", message: "Expense not found" });
        expectErrorResponse(deleteResponse, { status: 404, code: "NOT_FOUND", message: "Expense not found" });
    });

    test("creates an expense without note and rejects invalid values and invalid object ids", async () => {
        const user = await registerUser();

        const successResponse = await request(app)
            .post("/api/expense")
            .set("Authorization", `Bearer ${user.token}`)
            .send({
                amount: 89.5,
                category: "Food",
                date: "2026-05-04"
            });

        expect(successResponse.status).toBe(201);
        expect(successResponse.body.note).toBeNull();

        const negativeAmountResponse = await request(app)
            .post("/api/expense")
            .set("Authorization", `Bearer ${user.token}`)
            .send({
                amount: -10,
                category: "Food",
                date: "2026-05-04"
            });

        const invalidDateResponse = await request(app)
            .post("/api/expense")
            .set("Authorization", `Bearer ${user.token}`)
            .send({
                amount: 10,
                category: "Food",
                date: "not-a-date"
            });

        const invalidIdResponse = await request(app)
            .get("/api/expense/not-a-valid-id")
            .set("Authorization", `Bearer ${user.token}`);

        expectErrorResponse(negativeAmountResponse, {
            status: 400,
            code: "BAD_REQUEST",
            message: "Amount must be a positive number"
        });
        expectErrorResponse(invalidDateResponse, {
            status: 400,
            code: "BAD_REQUEST",
            message: "Date is invalid"
        });
        expectErrorResponse(invalidIdResponse, {
            status: 400,
            code: "BAD_REQUEST",
            message: "Expense ID is invalid"
        });
    });

    test("rejects malformed json payloads with a uniform contract", async () => {
        const user = await registerUser({ email: "json@mail.com" });

        const response = await request(app)
            .post("/api/categories")
            .set("Authorization", `Bearer ${user.token}`)
            .set("Content-Type", "application/json")
            .send("{invalid-json");

        expectErrorResponse(response, {
            status: 400,
            code: "MALFORMED_JSON",
            message: "Malformed JSON payload"
        });
    });

    test("creates income and returns overview without budget coverage", async () => {
        const user = await registerUser();

        await request(app)
            .post("/api/incomes")
            .set("Authorization", `Bearer ${user.token}`)
            .send({
                amount: 1000,
                source: "Salary",
                date: "2026-05-01",
                status: "confirmed"
            });

        await request(app)
            .post("/api/expense")
            .set("Authorization", `Bearer ${user.token}`)
            .send({
                amount: 250,
                category: "Food",
                date: "2026-05-02"
            });

        const response = await request(app)
            .get("/api/analytics/overview?from=2026-05-01&to=2026-05-31")
            .set("Authorization", `Bearer ${user.token}`);

        expect(response.status).toBe(200);
        expect(response.body.totalIncome).toBe(1000);
        expect(response.body.totalExpense).toBe(250);
        expect(response.body.netBalance).toBe(750);
        expect(response.body.expenseToIncomeRatio).toBe(0.25);
        expect(response.body.savingsRate).toBe(0.75);
        expect(response.body.periodCoverage.hasBudget).toBe(false);
    });

    test("rejects budget periods with invalid date order", async () => {
        const user = await registerUser();

        const response = await request(app)
            .post("/api/budget-periods")
            .set("Authorization", `Bearer ${user.token}`)
            .send({
                name: "Bad range",
                startDate: "2026-05-31",
                endDate: "2026-05-01"
            });

        expectErrorResponse(response, {
            status: 400,
            code: "BAD_REQUEST",
            message: "startDate must be earlier than or equal to endDate"
        });
    });

    test("returns budget usage and over-budget categories when a budget exists", async () => {
        const user = await registerUser();

        await request(app)
            .post("/api/incomes")
            .set("Authorization", `Bearer ${user.token}`)
            .send({
                amount: 1000,
                source: "Salary",
                date: "2026-05-01",
                status: "confirmed"
            });

        const budgetResponse = await request(app)
            .post("/api/budget-periods")
            .set("Authorization", `Bearer ${user.token}`)
            .send({
                name: "May plan",
                startDate: "2026-05-01",
                endDate: "2026-05-31",
                expenseToIncomeAlertThreshold: 0.2
            });

        await request(app)
            .post("/api/category-budgets")
            .set("Authorization", `Bearer ${user.token}`)
            .send({
                budgetId: budgetResponse.body._id,
                category: "Food",
                limitAmount: 200,
                alertThreshold: 0.8
            });

        await request(app)
            .post("/api/expense")
            .set("Authorization", `Bearer ${user.token}`)
            .send({
                amount: 300,
                category: "Food",
                date: "2026-05-05"
            });

        const overviewResponse = await request(app)
            .get("/api/analytics/overview?from=2026-05-01&to=2026-05-31")
            .set("Authorization", `Bearer ${user.token}`);

        expect(overviewResponse.status).toBe(200);
        expect(overviewResponse.body.periodCoverage.hasBudget).toBe(true);
        expect(overviewResponse.body.remainingBudget).toBe(-100);
        expect(overviewResponse.body.overBudgetCategories).toContain("Food");

        const alertsResponse = await request(app)
            .get("/api/analytics/alerts?from=2026-05-01&to=2026-05-31")
            .set("Authorization", `Bearer ${user.token}`);

        expect(alertsResponse.status).toBe(200);
        expect(alertsResponse.body.alerts.some(alert => alert.type === "CATEGORY_BUDGET_EXCEEDED")).toBe(true);
        expect(alertsResponse.body.alerts.some(alert => alert.type === "EXPENSE_TO_INCOME_THRESHOLD_REACHED")).toBe(true);
    });

    test("updates password and allows login only with the new password", async () => {
        const user = await registerUser({ email: "password@mail.com" });

        const updateResponse = await request(app)
            .patch(`/api/user/${user.user.id}/password`)
            .set("Authorization", `Bearer ${user.token}`)
            .send({
                currentPassword: "Password123",
                newPassword: "NewPassword123"
            });

        expect(updateResponse.status).toBe(200);

        const oldLoginResponse = await request(app)
            .post("/api/user/login")
            .send({
                email: "password@mail.com",
                password: "Password123"
            });

        const newLoginResponse = await request(app)
            .post("/api/user/login")
            .send({
                email: "password@mail.com",
                password: "NewPassword123"
            });

        expectErrorResponse(oldLoginResponse, {
            status: 401,
            code: "UNAUTHORIZED",
            message: "Invalid password"
        });
        expect(newLoginResponse.status).toBe(200);
    });

    test("returns 401 without token and 401 for expired token", async () => {
        const user = await registerUser({ email: "expired@mail.com" });
        const expiredToken = jwt.sign(
            { id: user.user.id },
            process.env.JWT_SECRET,
            { expiresIn: -1 }
        );

        const missingTokenResponse = await request(app)
            .get("/api/expense");

        const expiredTokenResponse = await request(app)
            .get("/api/expense")
            .set("Authorization", `Bearer ${expiredToken}`);

        expectErrorResponse(missingTokenResponse, {
            status: 401,
            code: "AUTHORIZATION_HEADER_MISSING",
            message: "Authorization header missing"
        });
        expectErrorResponse(expiredTokenResponse, {
            status: 401,
            code: "TOKEN_EXPIRED",
            message: "Token expired"
        });
    });

    test("returns 404 for unknown routes and 405 for known routes with unsupported methods", async () => {
        const user = await registerUser({ email: "methods@mail.com" });

        const notFoundResponse = await request(app)
            .get("/api/unknown-route");

        const methodNotAllowedResponse = await request(app)
            .patch("/api/expense")
            .set("Authorization", `Bearer ${user.token}`);

        expectErrorResponse(notFoundResponse, {
            status: 404,
            code: "ROUTE_NOT_FOUND",
            message: "Route not found"
        });

        expectErrorResponse(methodNotAllowedResponse, {
            status: 405,
            code: "METHOD_NOT_ALLOWED",
            message: "Method not allowed"
        });
        expect(methodNotAllowedResponse.headers.allow).toBe("GET, POST");
    });

    test("returns 409 for duplicated resources and 429 for repeated auth attempts", async () => {
        await registerUser({ email: "duplicate@mail.com" });

        const duplicateResponse = await request(app)
            .post("/api/user/register")
            .send({
                name: "Duplicate",
                email: "duplicate@mail.com",
                password: "Password123",
                currency: "USD"
            });

        expectErrorResponse(duplicateResponse, {
            status: 409,
            code: "CONFLICT",
            message: "User already exists"
        });

        await registerUser({ email: "ratelimit@mail.com" });

        const attemptOne = await request(app)
            .post("/api/user/login")
            .send({ email: "ratelimit@mail.com", password: "WrongPassword123" });
        const attemptTwo = await request(app)
            .post("/api/user/login")
            .send({ email: "ratelimit@mail.com", password: "WrongPassword123" });
        const attemptThree = await request(app)
            .post("/api/user/login")
            .send({ email: "ratelimit@mail.com", password: "WrongPassword123" });
        const attemptFour = await request(app)
            .post("/api/user/login")
            .send({ email: "ratelimit@mail.com", password: "WrongPassword123" });

        expectErrorResponse(attemptOne, {
            status: 401,
            code: "UNAUTHORIZED",
            message: "Invalid password"
        });
        expectErrorResponse(attemptTwo, {
            status: 401,
            code: "UNAUTHORIZED",
            message: "Invalid password"
        });
        expectErrorResponse(attemptThree, {
            status: 401,
            code: "UNAUTHORIZED",
            message: "Invalid password"
        });
        expectErrorResponse(attemptFour, {
            status: 429,
            code: "AUTH_RATE_LIMIT_EXCEEDED",
            message: "Too many authentication attempts"
        });
    });

    test("sanitizes unexpected internal errors in production", () => {
        const previousNodeEnv = process.env.NODE_ENV;
        process.env.NODE_ENV = "production";

        const req = {
            method: "GET",
            originalUrl: "/api/expense",
            requestId: "req-production-001"
        };
        const res = {
            locals: {},
            statusCode: 200,
            headers: {},
            status(code) {
                this.statusCode = code;
                return this;
            },
            json(payload) {
                this.payload = payload;
                return this;
            }
        };

        errorHandler(new Error("Sensitive database failure"), req, res, () => {});

        expect(res.statusCode).toBe(500);
        expect(res.payload.success).toBe(false);
        expect(res.payload.error.code).toBe("INTERNAL_SERVER_ERROR");
        expect(res.payload.error.message).toBe("Internal Server Error");
        expect(res.payload.error.requestId).toBe("req-production-001");
        expect(res.payload.error.stack).toBeUndefined();

        process.env.NODE_ENV = previousNodeEnv;
    });
});
