const jwt = require("jsonwebtoken");
const { UnauthorizedError } = require("../errors/CustomError");
const { env } = require("../config/env");

module.exports.authMiddleware = (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader) {
            throw new UnauthorizedError("Authorization header missing", {
                code: "AUTHORIZATION_HEADER_MISSING"
            });
        }

        const [scheme, token] = authHeader.split(" ");

        if (scheme !== "Bearer" || !token) {
            throw new UnauthorizedError("Authorization token is invalid", {
                code: "AUTHORIZATION_HEADER_INVALID"
            });
        }

        const decodedToken = jwt.verify(token, env.JWT_SECRET);

        if (!decodedToken?.id || typeof decodedToken.id !== "string") {
            throw new UnauthorizedError("Authorization token is invalid", {
                code: "AUTHORIZATION_PAYLOAD_INVALID"
            });
        }

        req.user = decodedToken;
        return next();
    } catch (error) {
        return next(error);
    }
};
