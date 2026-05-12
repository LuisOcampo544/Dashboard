const { NotFoundError } = require("../errors/CustomError");

module.exports.notFoundHandler = (req, res, next) => {
    next(new NotFoundError("Route not found", {
        code: "ROUTE_NOT_FOUND",
        details: {
            method: req.method,
            path: req.originalUrl
        }
    }));
};
