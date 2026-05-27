const sequelize = require('../config/database');
const User = require('./User');
const Customer = require('./Customer');
const Lead = require('./Lead');
const Task = require('./Task');
const Note = require('./Note');

// User relationships
User.hasMany(Customer, { foreignKey: 'assigned_to' });
Customer.belongsTo(User, { foreignKey: 'assigned_to', as: 'assignedUser' });

User.hasMany(Lead, { foreignKey: 'assigned_to' });
Lead.belongsTo(User, { foreignKey: 'assigned_to', as: 'assignedUser' });

User.hasMany(Task, { foreignKey: 'assigned_to' });
Task.belongsTo(User, { foreignKey: 'assigned_to', as: 'assignedUser' });

// Customer relationships
Customer.hasMany(Lead, { foreignKey: 'customer_id' });
Lead.belongsTo(Customer, { foreignKey: 'customer_id' });

Customer.hasMany(Task, { foreignKey: 'customer_id' });
Task.belongsTo(Customer, { foreignKey: 'customer_id' });

Customer.hasMany(Note, { foreignKey: 'customer_id' });
Note.belongsTo(Customer, { foreignKey: 'customer_id' });

Lead.hasMany(Note, { foreignKey: 'lead_id' });
Note.belongsTo(Lead, { foreignKey: 'lead_id' });

module.exports = { sequelize, User, Customer, Lead, Task, Note };