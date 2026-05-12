const { Router } = require("express");
const {
    register,
    login,
    getUser,
    updateUser,
    updatePassword,
    deleteUser
} = require("../controllers/User.controller");
const { authMiddleware } = require("../middleware/Auth.middleware");
const { requireSelfAccess } = require("../middleware/Ownership.middleware");
const { methodNotAllowed } = require("../middleware/MethodNotAllowed.middleware");
const { authRateLimiter } = require("../middleware/RateLimit.middleware");

const router = Router();

router.route("/register")
    .post(authRateLimiter, register)
    .all(methodNotAllowed(["POST"]));

router.route("/login")
    .post(authRateLimiter, login)
    .all(methodNotAllowed(["POST"]));

router.use(authMiddleware);

router.route("/:id")
    .get(requireSelfAccess, getUser)
    .put(requireSelfAccess, updateUser)
    .delete(requireSelfAccess, deleteUser)
    .all(methodNotAllowed(["GET", "PUT", "DELETE"]));

router.route("/:id/password")
    .patch(requireSelfAccess, updatePassword)
    .all(methodNotAllowed(["PATCH"]));

module.exports = router;
