const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../model/User');
const crypto = require('crypto');
const { sendPasswordResetEmail, sendWelcomeEmail} = require('../Email/Email');
// Create a new user
router.post('/signup', async (req, res) => {
    try {
        const { name, email, password } = req.body;
        if(!name || !email || !password) {
            return res.status(400).json({ message: 'Please provide all required fields' });
        }
        // const existingUser = await User.findOne({ email }).lean();
        // if(existingUser) {
        //     return res.status(400).json({ message: 'User already exists' });
        // }
        const hashedPassword = await bcrypt.hash(password, 10);
        const user = new User({ name, email, password: hashedPassword });
        await user.save();
        await sendWelcomeEmail(email, name);
        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
        const refreshToken = jwt.sign({ id: user._id }, process.env.REFRESH_TOKEN_SECRET, { expiresIn: '30d' });
        res.json({ ok: true, token, refreshToken, user: name, message: 'User created successfully' });
    } catch (error) {
        console.log(error.message);
        res.status(500).json({ message: 'Server error' });
    }
})
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        if(!email || !password) {
            return res.status(400).json({ message: 'Please provide all required fields' });
        }
        const user = await User.findOne({ email });
        if(!user) {
            return res.status(400).json({ message: 'User does not exist' });
        }
        const isMatch = await bcrypt.compare(password, user.password);
        if(!isMatch) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }
        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
        const refreshToken = jwt.sign({ id: user._id }, process.env.REFRESH_TOKEN_SECRET, { expiresIn: '30d' });
        res.json({ token, refreshToken, user: user.name });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});
router.post('/forgot-password', async (req, res) => {
    try {
        const { email } = req.body;
        if(!email) {
            return res.status(400).json({ message: 'Please provide email' });
        }
        const user = await User.findOne({ email });
        if(!user) {
            return res.status(400).json({ message: 'this user does not exist' });
        }
        const resetLink = crypto.randomBytes(20).toString('hex');
        const ResetDate = Date.now() + 3600000; // Link valid for 1 hour
        user.passwordResetLink = resetLink;
        user.passwordResetDate = ResetDate;
        await user.save();
        // Send email to user with reset link
        await sendPasswordResetEmail(email, resetLink);
        res.json({ message: 'Password reset email sent', ok: true });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});
router.get('/reset/password', async (req, res) => {
    try {
        const { resetLink } = req.query;
        const user = await User.findOne({ passwordResetLink: resetLink });
        if (!user) {
            return res.status(400).json({ message: 'Invalid reset link' });
        }
        if (user.passwordResetDate < Date.now()) {
            return res.status(400).json({ message: 'Reset link has expired' });
        }
        res.json({ message: 'Reset link is valid', ok: true });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});
router.post('/reset-password', async (req, res) => {
    try {
        const { resetLink, newPassword } = req.body;
        const user = await User.findOne({ passwordResetLink: resetLink });
        if (!user) {
            return res.status(400).json({ message: 'Invalid reset link' });
        }
        if (user.passwordResetDate < Date.now()) {
            return res.status(400).json({ message: 'Reset link has expired' });
        }
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        user.password = hashedPassword;
        user.passwordResetLink = '';
        user.passwordResetDate = undefined;
        await user.save();
        res.json({ message: 'Password reset successfully', ok: true});
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});
router.post('/refresh-token', async (req, res) => {
    try {
        const { refreshToken } = req.body;
        if (!refreshToken) {
            return res.status(400).json({ message: 'Refresh token is required' });
        }
        const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
        const token = jwt.sign({ id: decoded.id }, process.env.JWT_SECRET, { expiresIn: '7d' });
        const newRefreshToken = jwt.sign({ id: decoded.id }, process.env.REFRESH_TOKEN_SECRET, { expiresIn: '30d' });
        res.json({ token, refreshToken: newRefreshToken });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});
module.exports = router;