const express = require('express');
const sqlite3 = require('sqlite3');
const bodyParser = require('body-parser');

const app = express();
const port = 3000;

// SQLite database configuration
const DB_NAME = 'users.db';

// Create users table if not exists
const db = new sqlite3.Database(DB_NAME);
db.run(`
    CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        first_name TEXT NOT NULL,
        last_name TEXT NOT NULL,
        email TEXT NOT NULL UNIQUE,
        password TEXT NOT NULL
    )
`);
db.close();

// Middleware to parse JSON in request body
app.use(bodyParser.json());

// Serve static files (HTML, CSS, etc.)
app.use(express.static(__dirname));

// Route to handle user registration
app.post('/register', (req, res) => {
    const { firstName, lastName, email, password } = req.body;

    if (!firstName || !lastName || !email || !password) {
        return res.status(400).json({ error: 'Please fill in all fields' });
    }

    const db = new sqlite3.Database(DB_NAME);
    const stmt = db.prepare('INSERT INTO users (first_name, last_name, email, password) VALUES (?, ?, ?, ?)');
    stmt.run(firstName, lastName, email, password, (err) => {
        stmt.finalize();
        db.close();

        if (err) {
            if (err.code === 'SQLITE_CONSTRAINT') {
                return res.status(400).json({ error: 'Email already exists. Choose a different one.' });
            }
            return res.status(500).json({ error: 'Internal Server Error' });
        }

        res.json({ message: 'User registered successfully' });
    });
});

app.listen(port, () => {
    console.log(`Server listening at http://localhost:${port}`);
});
