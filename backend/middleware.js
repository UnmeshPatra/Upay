const { JWT_SECRET } = process.env; // Ensure JWT_SECRET is loaded from .env file
const jwt = require("jsonwebtoken");

const authMiddleware = (req, res, next) => {
    const authHeader = req.headers.authorization;

    // Check if the Authorization header is missing or does not start with 'Bearer '
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(403).json({ message: "Forbidden: Token is missing or invalid." });
    }

    const token = authHeader.split(" ")[1];

    try {
        // Verify the token using the secret
        const decoded = jwt.verify(token, JWT_SECRET);
        req.userId = decoded.userId; // Attach decoded user information to the request
        next(); // Proceed to the next middleware
    } catch (err) {
        return res.status(403).json({ message: "Forbidden: Invalid or expired token." });
    }
};

module.exports = {
    authMiddleware,
};
