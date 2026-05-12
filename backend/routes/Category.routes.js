const { Router } = require("express");
const {
    listCategories,
    createCategory,
    deleteCategory
} = require("../controllers/Category.controller");
const { methodNotAllowed } = require("../middleware/MethodNotAllowed.middleware");

const router = Router();

router.route("/")
    .get(listCategories)
    .post(createCategory)
    .all(methodNotAllowed(["GET", "POST"]));

router.route("/:id")
    .delete(deleteCategory)
    .all(methodNotAllowed(["DELETE"]));

module.exports = router;
