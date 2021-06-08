const db = require('../db');

/** Collection of related methods for books. */

class Book {
	/** given an isbn, return book data with that isbn:
	 *
	 * => {isbn, amazon_url, author, language, pages, publisher, title, year}
	 *
	 **/

	static async findOne(isbn) {
		const bookRes = await db.query(
			`SELECT isbn,
                amazon_url,
                author,
                language,
                pages,
                publisher,
                title,
                year
            FROM books 
            WHERE isbn = $1`,
			[isbn]
		);

		if (bookRes.rows.length === 0) {
			throw { message: `There is no book with an isbn '${isbn}`, status: 404 };
		}

		return bookRes.rows[0];
	}

	/** Return array of book data:
	 *
	 * => [ {isbn, amazon_url, author, language,
	 *       pages, publisher, title, year}, ... ]
	 *
	 * */

	static async findAll() {
		const booksRes = await db.query(
			`SELECT isbn,
                amazon_url,
                author,
                language,
                pages,
                publisher,
                title,
                year
            FROM books 
            ORDER BY title`
		);

		return booksRes.rows;
	}

	/** create book in database from data, return book data:
	 *
	 * {isbn, amazon_url, author, language, pages, publisher, title, year}
	 *
	 * => {isbn, amazon_url, author, language, pages, publisher, title, year}
	 *
	 * */

	static async create(data) {
		const result = await db.query(
			`INSERT INTO books (
            isbn,
            amazon_url,
            author,
            language,
            pages,
            publisher,
            title,
            year) 
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8) 
         RETURNING isbn,
                   amazon_url,
                   author,
                   language,
                   pages,
                   publisher,
                   title,
                   year`,
			[data.isbn, data.amazon_url, data.author, data.language, data.pages, data.publisher, data.title, data.year]
		);

		return result.rows[0];
	}

	/** Update data with matching ID to data, return updated book.

   * {isbn, amazon_url, author, language, pages, publisher, title, year}
   *
   * => {isbn, amazon_url, author, language, pages, publisher, title, year}
   *
   * */

	static async update(isbn, data) {
		const { query, preparedValues } = returnQuery(data);
		const result = await db.query(
			`UPDATE books SET 
            ${query}
            WHERE isbn='${isbn}'
        RETURNING isbn,
                  amazon_url,
                  author,
                  language,
                  pages,
                  publisher,
                  title,
                  year`,
			preparedValues
		);

		if (result.rows.length === 0) {
			throw { message: `There is no book with an isbn '${isbn}`, status: 404 };
		}

		return result.rows[0];
	}

	/** remove book with matching isbn. Returns undefined. */

	static async remove(isbn) {
		const result = await db.query(
			`DELETE FROM books 
         WHERE isbn = $1 
         RETURNING isbn`,
			[isbn]
		);

		if (result.rows.length === 0) {
			throw { message: `There is no book with an isbn '${isbn}`, status: 404 };
		}
	}
}
function returnQuery(obj) {
	//allow for updating columns dynamically without 'nullifying' existing values in DB for non-updated columns
	let returnStr = '';
	let returnValues = [];
	let idx = 1;
	for (const [key, value] of Object.entries(obj)) {
		returnStr += `${key}=($${idx}),`;
		returnValues.push(value);
		idx++;
	}
	returnStr = returnStr.slice(0, returnStr.length - 1);
	return { query: returnStr, preparedValues: returnValues };
}
module.exports = Book;
