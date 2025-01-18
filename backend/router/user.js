const express = require("express");
const zod = require("zod");
const bcrypt = require("bcrypt");
const { User } = require("../db");
const jwt = require("jsonwebtoken");
const { JWT_SECRET } = require("../config");
const { authMiddleware } = require("../middleware");
const router = express.Router();

// Define the signup schema
const signupSchema = zod.object({
    username: zod.string(),
    password: zod.string(),
    firstName: zod.string(),
    lastName: zod.string(),
});


// Signup route
router.post("/signup", async (req, res) => {
    try {
        const body = req.body;

        const result = signupSchema.safeParse(body);
        if (!result.success) {
            return res.status(400).json({
                message: "Invalid input. Please check the required fields.",
            });
        }

        const existingUser = await User.findOne({ username: body.username });
        
        if (existingUser) {
            return res.status(400).json({
                message: "Username already taken",
            });
        }

        // Hash the password
        const hashedPassword = await bcrypt.hash(body.password, 10);
        body.password = hashedPassword;
        
        const dbUser = await User.create(body);
        const token = jwt.sign(
            { userId: dbUser._id },
            JWT_SECRET
        );
        res.status(201).json({
            message: "User created successfully",
            token: token,
        });
        
        
    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: "An error occurred during signup. Please try again.",
        });
    }
});



const signinSchema = zod.object({
    username: zod.string(),
    password: zod.string(),
});

// Sign-in route
router.post("/signin", async (req, res) => {
    try {

        const body = req.body;

        const result = signinSchema.safeParse(body);

        if (!result.success) {
            return res.status(400).json({
                message: "Invalid input",
            });
        }

        const user = await User.findOne({ username: body.username });
        if (!user) {
            return res.status(401).json({
                message: "Invalid username or Invalid password or please signup.",
            });
        }

        // Compare the provided password with the hashed password
        const isPasswordValid = await bcrypt.compare(body.password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({
                message: "Invalid username or password.",
            });
        }

        const token = jwt.sign(
            { userId: user._id },
            JWT_SECRET
        );

        res.status(200).json({
            message: "Sign-in successful",
            token: token,
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: "An error occurred. Please try again.",
        });
    }
    
});

const updateBody = zod.object({
    password: zod.string().optional(),
    firstName: zod.string().optional(),
    lastName: zod.string().optional(),
});

router.put("/updatebody", authMiddleware, async (req, res) => {
    const { success } = updateBody.safeParse(req.body);
    if (!success) {
        return res.status(400).json({
            message: "Error while updating information",
        });
    }

    const updateData = { ...req.body };

    // Hash password if it is being updated
    if (updateData.password) {
        updateData.password = await bcrypt.hash(updateData.password, 10);
    }

    await User.updateOne(updateData, { id: req.userId });

    res.json({
        message: "Updated successfully",
    });
});

router.get("/bulk", async (req, res) => {
    const filter = req.query.filter || "";

    const users = await User.find({
        $or: [
            { firstName: { $regex: filter } },
            { lastName: { $regex: filter } },
        ],
    });

    res.json({
        user: users.map((user) => ({
            username: user.username,
            firstName: user.firstName,
            lastName: user.lastName,
            _id: user._id,
        })),
    });
});

module.exports = router;
