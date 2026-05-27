const { Lead, Customer, User } = require('../models');

// @desc    Get all leads
// @route   GET /api/leads
const getLeads = async(req, res) => {
    try {
        const leads = await Lead.findAll({
            include: [
                { model: Customer, attributes: ['id', 'name', 'company'] },
                { model: User, as: 'assignedUser', attributes: ['id', 'name'] }
            ],
            order: [
                ['createdAt', 'DESC']
            ]
        });
        res.json(leads);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get single lead by ID
// @route   GET /api/leads/:id
const getLeadById = async(req, res) => {
    try {
        const lead = await Lead.findByPk(req.params.id, {
            include: [
                { model: Customer, attributes: ['id', 'name', 'company'] },
                { model: User, as: 'assignedUser', attributes: ['id', 'name'] }
            ]
        });
        if (!lead) return res.status(404).json({ message: 'Lead not found' });
        res.json(lead);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Create a lead
// @route   POST /api/leads
const createLead = async(req, res) => {
    const { title, status, priority, value, notes, followup_date, customer_id } = req.body;

    try {
        const lead = await Lead.create({
            title,
            status,
            priority,
            value,
            notes,
            followup_date,
            customer_id,
            assigned_to: req.user.id
        });
        res.status(201).json(lead);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Update lead status (for Kanban drag & drop)
// @route   PATCH /api/leads/:id/status
const updateLeadStatus = async(req, res) => {
    const { status } = req.body;
    try {
        const lead = await Lead.findByPk(req.params.id);
        if (lead) {
            lead.status = status;
            await lead.save();
            res.json(lead);
        } else {
            res.status(404).json({ message: 'Lead not found' });
        }
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Update full lead details
// @route   PUT /api/leads/:id
const updateLead = async(req, res) => {
    try {
        const lead = await Lead.findByPk(req.params.id);
        if (lead) {
            await lead.update(req.body);
            res.json(lead);
        } else {
            res.status(404).json({ message: 'Lead not found' });
        }
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Delete lead
// @route   DELETE /api/leads/:id
const deleteLead = async(req, res) => {
    try {
        const lead = await Lead.findByPk(req.params.id);
        if (lead) {
            await lead.destroy();
            res.json({ message: 'Lead removed' });
        } else {
            res.status(404).json({ message: 'Lead not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getLeads,
    getLeadById,
    createLead,
    updateLeadStatus,
    updateLead,
    deleteLead,
};