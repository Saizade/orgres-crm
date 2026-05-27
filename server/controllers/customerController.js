const { Customer, User } = require('../models');

// @desc    Get all customers
// @route   GET /api/customers
const getCustomers = async(req, res) => {
    try {
        const customers = await Customer.findAll({
            include: [{ model: User, as: 'assignedUser', attributes: ['id', 'name', 'email'] }]
        });
        res.json(customers);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Create a customer
// @route   POST /api/customers
const createCustomer = async(req, res) => {
    const { name, email, phone, company, status, notes } = req.body;

    try {
        const customer = await Customer.create({
            name,
            email,
            phone,
            company,
            status,
            notes,
            assigned_to: req.user.id // Assign to the logged-in user by default
        });
        res.status(201).json(customer);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Get single customer
// @route   GET /api/customers/:id
const getCustomerById = async(req, res) => {
    try {
        const customer = await Customer.findByPk(req.params.id, {
            include: [{ model: User, as: 'assignedUser', attributes: ['id', 'name', 'email'] }]
        });

        if (customer) {
            res.json(customer);
        } else {
            res.status(404).json({ message: 'Customer not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update customer
// @route   PUT /api/customers/:id
const updateCustomer = async(req, res) => {
    try {
        const customer = await Customer.findByPk(req.params.id);

        if (customer) {
            await customer.update(req.body);
            res.json(customer);
        } else {
            res.status(404).json({ message: 'Customer not found' });
        }
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Delete customer
// @route   DELETE /api/customers/:id
const deleteCustomer = async(req, res) => {
    try {
        const customer = await Customer.findByPk(req.params.id);

        if (customer) {
            await customer.destroy();
            res.json({ message: 'Customer removed' });
        } else {
            res.status(404).json({ message: 'Customer not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getCustomers,
    createCustomer,
    getCustomerById,
    updateCustomer,
    deleteCustomer,
};