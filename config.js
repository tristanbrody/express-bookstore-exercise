/** Common config for bookstore. */
require('dotenv').config();

let DB_URI = `postgresql://`;

if (process.env.NODE_ENV === 'test') {
	DB_URI = `postgresql://${process.env.DB_USER}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}:${process.env.DB_PORT}/books_test`;
} else {
	DB_URI = `postgresql://${process.env.DB_USER}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}:${process.env.DB_PORT}/books`;
}

module.exports = { DB_URI };
