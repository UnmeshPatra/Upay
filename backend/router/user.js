const express = require("express");
const zod = require("zod");
const bcrypt = require("bcrypt");
const { User } = require("../db");
const jwt = require("jsonwebtoken");
const { JWT_SECRET } = require("../config");
const router = express.Router();

// Define the signup schema
const signupSchema = zod.object({
    username: zod.string(),
    password: zod.string(),
    firstName: zod.string(),
});

const signinSchema = zod.object({
    username: zod.string(),
    password: zod.string(),
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

        
        const existingUser = await User.findOne({
             username: body.username 
            });

        if (existingUser) {
            return res.status(400).json({
                message: "Email already taken",
            });
        }

       
        const dbUser = await User.create(body);
        const token = jwt.sign({
             userId: dbUser._id
            },JWT_SECRET
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

router.post("/signin", async (req, res) => {
    try {

        const body = req.body;

        const result = signinSchema.safeParse(body);

        if(!result.success){
            return res.json({
                message:"Invalid input"
            })

        }

        const user = User.findOne({
            username:body.username
        });
        if (!user || user.password !== body.password) {
            return res.status(401).json({
                message: "Invalid username or password.",
            });
        }

        const token = jwt.sign({ 
            userId: user._id 
        },JWT_SECRET);

        res.status(200).json({
            message: "Sign-in successful",
            token: token,
        });
        
    } catch(error){
        console.error(error);
        res.status(500).json({
            message: "an error occur.please try again"
        });
    }

});


module.exports = router;
