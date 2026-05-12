const { Router } = require("express");
const {
    createExpense,
    getExpensesByUserId,
    getExpenseById,
    updateExpense,
    deleteExpense
} = require("../controllers/Expense.controller");
const { methodNotAllowed } = require("../middleware/MethodNotAllowed.middleware");

const router = Router();

router.route("/")
    .post(createExpense)
    .get(getExpensesByUserId)
    .all(methodNotAllowed(["GET", "POST"]));

router.route("/:id")
    .get(getExpenseById)
    .put(updateExpense)
    .delete(deleteExpense)
    .all(methodNotAllowed(["GET", "PUT", "DELETE"]));

module.exports = router;
