const { Router } = require("express");
const {
    createBudget,
    getBudgetsByUserId,
    getBudgetById,
    updateBudget,
    deleteBudget
} = require("../controllers/Budget.controller");
const { methodNotAllowed } = require("../middleware/MethodNotAllowed.middleware");

const router = Router();

router.route("/")
    .post(createBudget)
    .get(getBudgetsByUserId)
    .all(methodNotAllowed(["GET", "POST"]));

router.route("/:id")
    .get(getBudgetById)
    .put(updateBudget)
    .delete(deleteBudget)
    .all(methodNotAllowed(["GET", "PUT", "DELETE"]));

module.exports = router;
