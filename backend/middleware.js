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
        console.log('User ID from token:', req.userId); // Log the userId to verify

        next(); // Proceed to the next middleware
    } catch (err) {
        return res.status(403).json({ message: "Forbidden: Invalid or expired token." });
    }
};

module.exports = {
    authMiddleware,
};


// const jwt = require('jsonwebtoken');
// const { JWT_SECRET } = require('../config');

// const authMiddleware = (req, res, next) => {
//     const token = req.header('Authorization')?.replace('Bearer ', ''); // Extract token from header
//     if (!token) {
//         return res.status(401).json({ message: "No token provided, authorization denied." });
//     }

//     try {
//         const decoded = jwt.verify(token, JWT_SECRET); // Verify the token
//         req.userId = decoded.userId; // Attach userId to the request object
//         next(); // Pass control to the next handler
//     } catch (err) {
//         return res.status(401).json({ message: "Invalid or expired token." });
//     }
// };

// module.exports = { authMiddleware };
