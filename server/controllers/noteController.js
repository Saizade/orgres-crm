const { Note, User } = require('../models/index');

// GET /api/notes?customer_id=x or ?lead_id=x
const getNotes = async(req, res) => {
    try {
        const where = {};
        if (req.query.customer_id) where.customer_id = req.query.customer_id;
        if (req.query.lead_id) where.lead_id = req.query.lead_id;
        const notes = await Note.findAll({
            where,
            order: [
                ['createdAt', 'DESC']
            ],
        });
        res.json(notes);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// POST /api/notes
const createNote = async(req, res) => {
    try {
        const { content, customer_id, lead_id } = req.body;
        if (!content) return res.status(400).json({ message: 'Content is required' });
        const note = await Note.create({
            content,
            customer_id: customer_id || null,
            lead_id: lead_id || null,
            created_by: req.user.id,
        });
        res.status(201).json({ message: 'Note created', note });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// DELETE /api/notes/:id
const deleteNote = async(req, res) => {
    try {
        const note = await Note.findByPk(req.params.id);
        if (!note) return res.status(404).json({ message: 'Note not found' });
        await note.destroy();
        res.json({ message: 'Note deleted' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

module.exports = { getNotes, createNote, deleteNote };