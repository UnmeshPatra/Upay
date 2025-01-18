// const express = require("express");
// const mongoose = require("mongoose");
// const app = express();


// app.use(express.json());

// mongoose.connect(
//     "mongodb+srv://UnmeshPatra:uHYN9mo3wVMBTdV3@cluster0.pz1jvcm.mongodb.net/Payyytm?retryWrites=true&w=majority&appName=Cluster0",
//     { useNewUrlParser: true, useUnifiedTopology: true }
// )
//     .then(() => console.log("Connected to MongoDB"))
//     .catch((err) => console.error("Error connecting to MongoDB:", err));

// const User = mongoose.model('User', { lastname: String, password: String, firstname: String });

// app.post("/signup", async function (req, res) {
//     const firstname = req.body.firstname;
//     const lastname = req.body.lastname;
//     const password = req.body.password;

//     try {
//         const existinguser = await User.findOne({ firstname: firstname });
//         if (existinguser) {
//             return res.status(403).send("firstname already exists");
//         }

//         const user = new User({
//             lastname: lastname,
//             firstname: firstname,
//             password: password
//         });

//         await user.save();
//         res.json({ message: "User created successfully" });
//     } catch (error) {
//         console.error("Error during signup:", error);
//         res.status(500).send("Internal server error");
//     }
// });

// app.listen(3000, () => {
//     console.log(`Example app listening on port 3000`);
// });



// const express = require("express");
// const mongoose = require("mongoose");
// require("dotenv").config(); // Load environment variables from .env file

// // Connect to MongoDB
// mongoose.connect(process.env.MONGO_URI, {
//     useNewUrlParser: true,
//     useUnifiedTopology: true,
// })
//     .then(() => console.log("Connected to MongoDB"))
//     .catch((err) => console.error("Could not connect to MongoDB:", err));

// // Create a Schema for Users
// const userSchema = new mongoose.Schema({
//     username: {
//         type: String,
//         required: true,
//         unique: true,
//         trim: true,
//         lowercase: true,
//         minLength: 3,
//         maxLength: 30,
//     },
//     password: {
//         type: String,
//         required: true,
//         minLength: 6,
//     },
//     firstName: {
//         type: String,
//         required: true,
//         trim: true,
//         maxLength: 50,
//     },
//     lastName: {
//         type: String,
//         required: true,
//         trim: true,
//         maxLength: 50,
//     },
// });

// // Create a model from the schema
// const User = mongoose.model("User", userSchema);

// const app = express();

// // Middleware to parse JSON requests
// app.use(express.json());

// // Signup route
// app.post("/signup", async (req, res) => {
//     const { username, firstName, lastName, password } = req.body;

//     try {
//         // Check if the username already exists
//         const existingUser = await User.findOne({ username });
//         if (existingUser) {
//             return res.status(403).send("Username already exists");
//         }

//         // Create a new user
//         const user = new User({
//             username,
//             firstName,
//             lastName,
//             password,
//         });

//         // Save the user
//         await user.save();
//         res.json({ message: "User created successfully" });
//     } catch (error) {
//         res.status(500).json({ error: "An error occurred", details: error.message });
//     }
// });

// // Start the server on port 3000 (or any other port you prefer)
// app.listen(3001, () => {
//     console.log("Server is running on port 3000");
// });



const mongoose = require("mongoose");
const { MONGO_URI } = require("./config");

// Connect to MongoDB
mongoose.connect(MONGO_URI)
    .then(() => {
        console.log("MongoDB connected");
    })
    .catch((err) => {
        console.error("MongoDB connection error:", err);
    });

// Create a Schema for Users
const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
    minLength: 3,
    maxLength: 30,
  },
  password: {
    type: String,
    required: true,
    minLength: 6,
  },
  firstName: {
    type: String,
    required: true,
    trim: true,
    maxLength: 50,
  },
  lastName: {
    type: String,
    required: true,
    trim: true,
    maxLength: 50,
  },
});

//acounts schemal (all the balences of the user stores here)
const accountSchema = new mongoose.Schema({
  userId:{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  balance:{
    type: Number,
    required:true
  }
}); 

// Create a model from the schema
const Account = mongoose.model("Account", accountSchema);
const User = mongoose.model("User", userSchema);

module.exports = {
  User,Account
} ;