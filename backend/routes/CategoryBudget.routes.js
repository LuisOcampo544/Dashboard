const { Router } = require("express");
const {
    createCategoryBudget,
    getCategoryBudgetsByUserId,
    getCategoryBudgetById,
    updateCategoryBudget,
    deleteCategoryBudget
} = require("../controllers/CategoryBudget.controller");
const { methodNotAllowed } = require("../middleware/MethodNotAllowed.middleware");

const router = Router();

router.route("/")
    .post(createCategoryBudget)
    .get(getCategoryBudgetsByUserId)
    .all(methodNotAllowed(["GET", "POST"]));

router.route("/:id")
    .get(getCategoryBudgetById)
    .put(updateCategoryBudget)
    .delete(deleteCategoryBudget)
    .all(methodNotAllowed(["GET", "PUT", "DELETE"]));

module.exports = router;
