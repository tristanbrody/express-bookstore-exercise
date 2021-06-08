const express = require('express');
const Book = require('../models/book');
const jsonschema = require('jsonschema');
const bookSchema = require('../schemas/bookSchema.json');
const updateBookSchema = require('../schemas/updateBookSchema.json');
const router = new express.Router();
const ExpressError = require('../expressError');

/** GET / => {books: [book, ...]}  */

router.get('/', async function (req, res, next) {
	try {
		const books = await Book.findAll(req.query);
		return res.json({ books });
	} catch (err) {
		return next(err);
	}
});

/** GET /[id]  => {book: book} */

router.get('/:id', async function (req, res, next) {
	try {
		const book = await Book.findOne(req.params.id);
		return res.json({ book });
	} catch (err) {
		return next(err);
	}
});

/** POST /   bookData => {book: newBook}  */

router.post('/', async function (req, res, next) {
	try {
		validateJSON(req, bookSchema);
		const book = await Book.create(req.body['book']);
		return res.status(201).json({ book });
	} catch (err) {
		return next(err);
	}
});

/** PUT /[isbn]   bookData => {book: updatedBook}  */

router.put('/:isbn', async function (req, res, next) {
	try {
		validateJSON(req, updateBookSchema);
		console.log(req.params.isbn);
		const book = await Book.update(req.params.isbn, req.body['book']);
		return res.json({ book });
	} catch (err) {
		return next(err);
	}
});

/** DELETE /[isbn]   => {message: "Book deleted"} */

router.delete('/:isbn', async function (req, res, next) {
	try {
		await Book.remove(req.params.isbn);
		return res.json({ message: 'Book deleted' });
	} catch (err) {
		return next(err);
	}
});

function getValidationErrors(errors) {
	const arr = [];
	for (let err of errors) {
		arr.push(err.stack);
	}
	return arr;
}

function validateJSON(req, schema) {
	const validity = jsonschema.validate(req.body, schema);
	if (!validity.valid) {
		const listOfErrors = getValidationErrors(validity.errors);
		throw new ExpressError(listOfErrors, 400);
	}
}

module.exports = router;
