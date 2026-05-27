const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Task = sequelize.define('Task', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
    },
    title: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    description: {
        type: DataTypes.TEXT,
    },
    status: {
        type: DataTypes.ENUM('pending', 'in_progress', 'completed'),
        defaultValue: 'pending',
    },
    due_date: {
        type: DataTypes.DATE,
    },
    assigned_to: {
        type: DataTypes.UUID,
        allowNull: true,
    },
    customer_id: {
        type: DataTypes.UUID,
        allowNull: true,
    },
});

module.exports = Task;