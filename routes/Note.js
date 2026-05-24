const express = require('express');
const router = express.Router();
const Task = require('../model/Task');
const AuthMiddleware = require('../authmiddleware/Authmiddleware');
// Create a new task
router.use(AuthMiddleware);
router.post('/create/task', async (req, res) => {
    try {
        const { title, description } = req.body;
        if(!title || !description) {
            return res.status(400).json({ message: 'Please provide all required fields' });
        }
        const task = new Task({ title, description, userId: req.user.id });
        await task.save();
        res.json({ message: 'Note created successfully' });
    } catch (error) {
        console.log(error.message);
        res.status(500).json({ message: 'Server error' });
    }
});
// Get all tasks
router.get('/tasks', async (req, res) => {
    try {
        const tasks = await Task.find({ userId: req.user.id }).lean().sort({ createdAt: -1 });
        res.json(tasks);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

router.get('/task/:id', async (req, res) => {
    try {
        const task = await Task.findById({ _id: req.params.id, userId: req.user.id }).lean();
        if(!task) {
            return res.status(404).json({ message: 'Task not found' });
        }
        res.json(task);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

router.put('/task/:id', async (req, res) => {
    try {
        const { title, description } = req.body;
        if(!title || !description) {
            return res.status(400).json({ message: 'Please provide all required fields' });
        }
        const task = await Task.findByIdAndUpdate({ _id: req.params.id, userId: req.user.id }, { title, description }, { new: true }).lean();
        if(!task) {
            return res.status(404).json({ message: 'Task not found' });
        }
        res.json({ message: 'Note updated successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

router.delete('/task/:id', async (req, res) => {
    try {
        const task = await Task.findByIdAndDelete({ _id: req.params.id, userId: req.user.id }).lean();
        if(!task) {
            return res.status(404).json({ message: 'Task not found' });
        }
        res.json({ message: 'Task deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

router.get('/search', async (req, res) => {
    try {
        const { query } = req.query;
        if (!query || query.trim() === "") {
            return res.json([]);
        }

        const safeQuery = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const searchRegex = new RegExp(safeQuery, 'i');
        const tasks = await Task.find({
            userId: req.user.id, 
            $or: [
                { title: { $regex: searchRegex } },
                { description: { $regex: searchRegex } }
            ]
        })
        .select('title description _id') 
        .limit(20)
        .lean(); 
        res.status(200).json(tasks);

    } catch (error) {
        console.error('Search Error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

module.exports = router;