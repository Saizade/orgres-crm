const { Sequelize } = require("sequelize");

console.log("HOST:", process.env.DB_HOST);
console.log("DB:", process.env.DB_NAME);
console.log("USER:", process.env.DB_USER);
console.log("PORT:", process.env.DB_PORT);

const sequelize = new Sequelize(
    process.env.DB_NAME,
    process.env.DB_USER,
    process.env.DB_PASSWORD, {
        host: process.env.DB_HOST,
        port: parseInt(process.env.DB_PORT) || 4000,
        dialect: "mysql",
        logging: false,
        dialectOptions: {
            ssl: {
                minVersion: 'TLSv1.2',
                rejectUnauthorized: true,
            },
        },
    }
);

module.exports = sequelize;