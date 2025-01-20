const express = require('express');
const mongoose = require('mongoose');
const { authMiddleware } = require('../middleware');
const { Account } = require('../db');

const router = express.Router();

// Get balance
router.get("/balance", authMiddleware, async (req, res) => {
    try {
        console.log("User ID from token:", req.userId);

        const account = await Account.findOne({ userId: req.userId });
        console.log("Account fetched:", account);

        if (!account) {
            return res.status(404).json({ message: "Account not found." });
        }

        res.json({ balance: account.balance });
    } catch (err) {
        console.error("Error fetching account:", err);
        res.status(500).json({ message: "An error occurred while fetching balance." });
    }
});

// Transfer balance
router.post("/transfer", authMiddleware, async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const { amount, to } = req.body;

        const fromAccount = await Account.findOne({ userId: req.userId }).session(session);
        if (!fromAccount || fromAccount.balance < amount) {
            await session.abortTransaction();
            return res.status(400).json({ message: "Insufficient balance" });
        }

        const toAccount = await Account.findOne({ userId: to }).session(session);
        if (!toAccount) {
            await session.abortTransaction();
            return res.status(400).json({ message: "Invalid account" });
        }

        fromAccount.balance -= amount;
        toAccount.balance += amount;

        await fromAccount.save({ session });
        await toAccount.save({ session });

        await session.commitTransaction();
        res.json({ message: "Transfer successful" });
    } catch (err) {
        console.error("Error during transfer:", err);
        await session.abortTransaction();
        res.status(500).json({ message: "An error occurred during the transfer." });
    } finally {
        session.endSession();
    }
});

module.exports = router;
