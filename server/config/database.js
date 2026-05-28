const { Sequelize } = require("sequelize");

const host = process.env.DB_HOST || 'localhost';
const isLocalhost = host === 'localhost' || host === '127.0.0.1';
const defaultPort = isLocalhost ? 3306 : 4000;
const port = parseInt(process.env.DB_PORT) || defaultPort;
const useSSL = process.env.DB_SSL === 'true' || (!isLocalhost && process.env.DB_SSL !== 'false');

console.log("DB Connection Details:");
console.log("- Host:", host);
console.log("- Port:", port);
console.log("- Database:", process.env.DB_NAME);
console.log("- User:", process.env.DB_USER);
console.log("- SSL Enabled:", useSSL);

const sequelize = new Sequelize(
    process.env.DB_NAME,
    process.env.DB_USER,
    process.env.DB_PASSWORD, {
        host: host,
        port: port,
        dialect: "mysql",
        logging: false,
        dialectOptions: useSSL ? {
            ssl: {
                minVersion: 'TLSv1.2',
                rejectUnauthorized: true,
            },
        } : {},
    }
);

module.exports = sequelize;