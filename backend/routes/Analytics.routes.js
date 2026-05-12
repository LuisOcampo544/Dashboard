const { Router } = require("express");
const {
    getOverview,
    getCategoryAnalytics,
    getAlerts
} = require("../controllers/Analytics.controller");
const { methodNotAllowed } = require("../middleware/MethodNotAllowed.middleware");

const router = Router();

router.route("/overview")
    .get(getOverview)
    .all(methodNotAllowed(["GET"]));

router.route("/categories")
    .get(getCategoryAnalytics)
    .all(methodNotAllowed(["GET"]));

router.route("/alerts")
    .get(getAlerts)
    .all(methodNotAllowed(["GET"]));

module.exports = router;
