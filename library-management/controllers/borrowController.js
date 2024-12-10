const db = require('../config/db');

exports.createBorrowRequest = async (req, res) => {
    const { userId, bookId, startDate, endDate } = req.body;
    try {
        await db.query(
            'INSERT INTO borrow_requests (user_id, book_id, start_date, end_date) VALUES (?, ?, ?, ?)',
            [userId, bookId, startDate, endDate]
        );
        res.status(201).send({ message: 'Borrow request created' });
    } catch (err) {
        res.status(500).send({ error: err.message });
    }
};
