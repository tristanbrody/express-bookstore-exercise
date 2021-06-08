process.env.NODE_ENV = 'test';

const db = require('../db');
const Book = require('../models/book');
const jsonschema = require('jsonschema');
const bookSchema = require('../schemas/bookSchema.json');
const updateBookSchema = require('../schemas/updateBookSchema.json');
const request = require('supertest');
const app = require('../app');

const validBookJSON = {
	book: {
		isbn: '0691161512',
		amazon_url: 'http://a.co/eobPtX2',
		author: 'Don Draper',
		language: 'english',
		pages: 222,
		publisher: 'Princeton University Press',
		title: 'Recovering from Extreme Hunger and Deprivation',
		year: 2021
	}
};

const invalidBookJSON = {
	book: {
		isbn: '0691161512',
		language: 'english',
		pages: '222',
		publisher: 'Princeton University Press',
		title: 'Recovering from Extreme Hunger and Deprivation',
		year: 2021
	}
};

beforeEach(async function () {
	await db.query(`DELETE FROM books WHERE 1 = 1;`);
	await db.query(`INSERT INTO books (isbn, amazon_url, author, language, pages, publisher, title, year) VALUES 
    ('0691161513', 'http://a.co/eobPtX2', 'Don Draper', 'english', 222, 'Princeton University Press', 'Recovering from Extreme Hunger and Deprivation', 2021)`);
});

describe('get books', function () {
	test('get all books in database', async function () {
		const resp = await request(app).get('/books');
		expect(resp.statusCode).toEqual(200);
		for (const entry of Array.from(resp.body)) {
			expect(jsonschema.validate({ book: entry }, bookSchema).valid).toEqual(true);
		}
	});
	test('get a specific book from database', async function () {
		const resp = await request(app).get('/books/0691161513');
		expect(resp.statusCode).toEqual(200);
		expect(jsonschema.validate(resp.body, bookSchema).valid).toEqual(true);
	});
});

describe('create books', function () {
	test('valid data should create book', async function () {
		const resp = await request(app).post('/books').send(validBookJSON);
		expect(jsonschema.validate(resp.body, bookSchema).valid).toEqual(true);
	});

	test('invalid data should return validation errors', async function () {
		const resp = await request(app).post('/books').send(invalidBookJSON);
		const { valid, errors } = jsonschema.validate(resp.body, bookSchema);
		expect(valid).toBe(false);
		expect(errors.length).toBeGreaterThan(0);
	});
});

describe('delete books', function () {
	test('delete endpoint should work', async function () {
		const resp = await request(app).delete('/books/0691161513');
		const confirmDeletion = await db.query(`SELECT * FROM books WHERE isbn = '0691161513';`);
		expect(confirmDeletion.rows[0]).toBeFalsy();
	});
});

afterAll(async function () {
	await db.end();
});
