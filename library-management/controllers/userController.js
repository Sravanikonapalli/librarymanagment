const bcrypt = require('bcryptjs');
const db = require('../config/db');

exports.createUser = async (req, res) => {
    const { email, password, role } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    try {
        await db.query('INSERT INTO users (email, password, role) VALUES (?, ?, ?)', [email, hashedPassword, role]);
        res.status(201).send({ message: 'User created' });
    } catch (err) {
        res.status(500).send({ error: err.message });
    }
};
