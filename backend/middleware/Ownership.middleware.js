const { ForbiddenError } = require("../errors/CustomError");

module.exports.requireSelfAccess = (req, res, next) => {
    if (!req.user || !req.params.id || req.user.id !== req.params.id) {
        return next(new ForbiddenError("You can only access your own user resource"));
    }

    return next();
};
