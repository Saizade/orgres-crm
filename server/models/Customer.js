const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Customer = sequelize.define('Customer', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    phone: {
        type: DataTypes.STRING,
    },
    company: {
        type: DataTypes.STRING,
    },
    status: {
        type: DataTypes.ENUM('active', 'inactive', 'prospect'),
        defaultValue: 'prospect',
    },
    notes: {
        type: DataTypes.TEXT,
    },
    assigned_to: {
        type: DataTypes.UUID,
        allowNull: true,
    },
});

module.exports = Customer;