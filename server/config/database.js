const { Sequelize } = require("sequelize");
console.log("HOST:", process.env.DB_HOST);
console.log("DB:", process.env.DB_NAME);
console.log("USER:", process.env.DB_USER);

const sequelize = new Sequelize(
    process.env.DB_NAME,
    process.env.DB_USER,
    process.env.DB_PASSWORD, {
        host: process.env.DB_HOST,
        port: process.env.DB_PORT || 3306,
        dialect: "mysql",
        logging: false,
        dialectOptions: process.env.NODE_ENV === "production" ? {
            ssl: {
                require: true,
                rejectUnauthorized: false,
            },
        } : {},
    }
);

module.exports = sequelize;