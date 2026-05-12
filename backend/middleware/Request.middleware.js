const crypto = require("crypto");

module.exports.requestContext = (req, res, next) => {
    const requestId = crypto.randomUUID();

    req.requestId = requestId;
    res.locals.requestId = requestId;
    res.setHeader("X-Request-Id", requestId);

    next();
};
