const { Task, Customer, User } = require('../models/index');

// GET /api/tasks
const getTasks = async(req, res) => {
    try {
        const tasks = await Task.findAll({
            include: [
                { model: Customer, attributes: ['id', 'name', 'email'] },
                { model: User, as: 'assignedUser', attributes: ['id', 'name', 'email'] },
            ],
            order: [
                ['createdAt', 'DESC']
            ],
        });
        res.json(tasks);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// POST /api/tasks
const createTask = async(req, res) => {
    try {
        const { title, description, status, due_date, assigned_to, customer_id } = req.body;
        if (!title) return res.status(400).json({ message: 'Title is required' });
        const task = await Task.create({
            title,
            description,
            status,
            due_date,
            assigned_to: assigned_to || req.user.id,
            customer_id: customer_id || null,
        });
        res.status(201).json({ message: 'Task created', task });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// PUT /api/tasks/:id
const updateTask = async(req, res) => {
    try {
        const task = await Task.findByPk(req.params.id);
        if (!task) return res.status(404).json({ message: 'Task not found' });
        await task.update(req.body);
        res.json({ message: 'Task updated', task });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// DELETE /api/tasks/:id
const deleteTask = async(req, res) => {
    try {
        const task = await Task.findByPk(req.params.id);
        if (!task) return res.status(404).json({ message: 'Task not found' });
        await task.destroy();
        res.json({ message: 'Task deleted' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

module.exports = { getTasks, createTask, updateTask, deleteTask };