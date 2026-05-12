const { MethodNotAllowedError } = require("../errors/CustomError");

module.exports.methodNotAllowed = (allowedMethods) => {
    return (req, res, next) => {
        res.setHeader("Allow", allowedMethods.join(", "));

        next(new MethodNotAllowedError("Method not allowed", {
            code: "METHOD_NOT_ALLOWED",
            details: {
                method: req.method,
                allowedMethods
            }
        }));
    };
};
