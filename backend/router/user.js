const express = require("express");
const zod = require("zod");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { User } = require("../db");
const { JWT_SECRET } = require("../config");
const { authMiddleware } = require("../middleware");

const router = express.Router();

// Signup schema
const signupSchema = zod.object({
    username: zod.string(),
    password: zod.string(),
    firstName: zod.string(),
    lastName: zod.string(),
});

// Signup route
router.post("/signup", async (req, res) => {
    try {
        const result = signupSchema.safeParse(req.body);
        if (!result.success) {
            return res.status(400).json({ message: "Invalid input. Please check the required fields." });
        }

        const { username, password, firstName, lastName } = result.data;

        if (await User.findOne({ username })) {
            return res.status(400).json({ message: "Username already taken" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = await User.create({ username, password: hashedPassword, firstName, lastName });

        const token = jwt.sign({ userId: newUser._id }, JWT_SECRET);
        res.status(201).json({ message: "User created successfully", token });
    } catch (err) {
        console.error("Signup error:", err);
        res.status(500).json({ message: "An error occurred during signup." });
    }
});

// Sign-in schema
const signinSchema = zod.object({
    username: zod.string(),
    password: zod.string(),
});

// Sign-in route
router.post("/signin", async (req, res) => {
    try {
        const result = signinSchema.safeParse(req.body);
        if (!result.success) {
            return res.status(400).json({ message: "Invalid input" });
        }

        const { username, password } = result.data;
        const user = await User.findOne({ username });
        if (!user || !(await bcrypt.compare(password, user.password))) {
            return res.status(401).json({ message: "Invalid username or password." });
        }

        const token = jwt.sign({ userId: user._id }, JWT_SECRET);
        res.status(200).json({ message: "Sign-in successful", token });
    } catch (err) {
        console.error("Sign-in error:", err);
        res.status(500).json({ message: "An error occurred during sign-in." });
    }
});

// Update user info
router.put("/updatebody", authMiddleware, async (req, res) => {
    const { success, data } = zod.object({
        password: zod.string().optional(),
        firstName: zod.string().optional(),
        lastName: zod.string().optional(),
    }).safeParse(req.body);

    if (!success) {
        return res.status(400).json({ message: "Invalid input" });
    }

    try {
        if (data.password) {
            data.password = await bcrypt.hash(data.password, 10);
        }

        await User.updateOne({ _id: req.userId }, data);
        res.json({ message: "Updated successfully" });
    } catch (err) {
        console.error("Error updating user:", err);
        res.status(500).json({ message: "An error occurred while updating user info." });
    }
});

// Bulk fetch users
router.get("/bulk", async (req, res) => {
    try {
        const filter = req.query.filter || "";
        const users = await User.find({
            $or: [{ firstName: { $regex: filter, $options: "i" } }, { lastName: { $regex: filter, $options: "i" } }],
        });

        res.json({
            users: users.map(({ username, firstName, lastName, _id }) => ({ username, firstName, lastName, _id })),
        });
    } catch (err) {
        console.error("Error fetching users:", err);
        res.status(500).json({ message: "An error occurred while fetching users." });
    }
});

module.exports = router;
