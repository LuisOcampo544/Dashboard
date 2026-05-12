const { Router } = require("express");
const {
    createIncome,
    getIncomesByUserId,
    getIncomeById,
    updateIncome,
    deleteIncome
} = require("../controllers/Income.controller");
const { methodNotAllowed } = require("../middleware/MethodNotAllowed.middleware");

const router = Router();

router.route("/")
    .post(createIncome)
    .get(getIncomesByUserId)
    .all(methodNotAllowed(["GET", "POST"]));

router.route("/:id")
    .get(getIncomeById)
    .put(updateIncome)
    .delete(deleteIncome)
    .all(methodNotAllowed(["GET", "PUT", "DELETE"]));

module.exports = router;
