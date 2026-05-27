const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Lead = sequelize.define('Lead', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
    },
    title: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    status: {
        type: DataTypes.ENUM('new', 'interested', 'negotiation', 'closed', 'rejected'),
        defaultValue: 'new',
    },
    priority: {
        type: DataTypes.ENUM('low', 'medium', 'high'),
        defaultValue: 'medium',
    },
    value: {
        type: DataTypes.DECIMAL(10, 2),
        defaultValue: 0,
    },
    notes: {
        type: DataTypes.TEXT,
    },
    followup_date: {
        type: DataTypes.DATE,
    },
    customer_id: {
        type: DataTypes.UUID,
        allowNull: true,
    },
    assigned_to: {
        type: DataTypes.UUID,
        allowNull: true,
    },
});

module.exports = Lead;