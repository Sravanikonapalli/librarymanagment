const db = require('../config/db');

exports.getBooks = async (req, res) => {
    try {
        const [books] = await db.query('SELECT * FROM books');
        res.send(books);
    } catch (err) {
        res.status(500).send({ error: err.message });
    }
};
