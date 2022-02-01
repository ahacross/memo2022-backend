require('dotenv').config();

module.exports = {
  development: {
    host: '192.168.50.50',
    user: 'backend',
    password: process.env.DB_PASSWORD,
    port: 3306,
    connectionLimit: 20,
  },
  production: {
    host: '192.168.50.50',
    user: 'backend',
    password: process.env.DB_PASSWORD,
    port: 3306,
    connectionLimit: 20,
    logging: false,
  },
};
