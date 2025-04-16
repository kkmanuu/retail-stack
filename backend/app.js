const express = require('express');
const cors = require('cors');
const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Database connection
const pool = mysql.createPool({
    host: process.env.MYSQL_HOST,
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DATABASE
});

// Test database connection
pool.getConnection()
    .then(() => console.log('Database connected successfully'))
    .catch(err => console.error('Database connection failed:', err.message));

// Sign-Up
app.post('/api/users/signup', async (req, res) => {
    const { email, password, re_password } = req.body;

    console.log('Received sign-up request:', { email, password, re_password });

    if (!email || !password || !re_password) {
        console.log('Validation failed: Missing fields');
        return res.status(400).json({ message: 'All fields are required' });
    }

    if (password !== re_password) {
        console.log('Validation failed: Passwords do not match');
        return res.status(400).json({ message: 'Passwords do not match' });
    }

    try {
        const [existingUser] = await pool.query('SELECT email FROM users WHERE email = ?', [email]);
        console.log('Existing user check:', existingUser);
        if (existingUser.length > 0) {
            console.log('Validation failed: Email exists');
            return res.status(400).json({ message: 'Email already exists' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        console.log('Hashed password:', hashedPassword);
        const [result] = await pool.query('INSERT INTO users (email, password) VALUES (?, ?)', [email, hashedPassword]);
        console.log('Insert result:', result);

        const token = jwt.sign({ email }, process.env.JWT_SECRET, { expiresIn: '1h' });
        console.log('User registered:', email);
        res.status(201).json({ message: 'User registered successfully', token });
    } catch (error) {
        console.error('Sign-up error:', error.message, error.stack);
        res.status(500).json({ message: `Server error: ${error.message}` });
    }
});

// Login
app.post('/api/users/login', async (req, res) => {
    const { email, password } = req.body;

    console.log('Received login request:', { email });

    if (!email || !password) {
        console.log('Validation failed: Missing fields');
        return res.status(400).json({ message: 'All fields are required' });
    }

    try {
        const [user] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
        console.log('User query result:', user);
        if (user.length === 0) {
            console.log('Validation failed: User not found');
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        const isMatch = await bcrypt.compare(password, user[0].password);
        console.log('Password match:', isMatch);
        if (!isMatch) {
            console.log('Validation failed: Incorrect password');
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        const token = jwt.sign({ email }, process.env.JWT_SECRET, { expiresIn: '1h' });
        console.log('User logged in:', email);
        res.json({ message: 'Login successful', token });
    } catch (error) {
        console.error('Login error:', error.message, error.stack);
        res.status(500).json({ message: `Server error: ${error.message}` });
    }
});

// Middleware to verify JWT
const verifyToken = (req, res, next) => {
    const token = req.headers['authorization']?.split(' ')[1];
    if (!token) {
        console.log('JWT verification failed: No token');
        return res.status(401).json({ message: 'Unauthorized' });
    }
    try {
        jwt.verify(token, process.env.JWT_SECRET);
        next();
    } catch (error) {
        console.log('JWT verification failed:', error.message);
        res.status(401).json({ message: 'Unauthorized' });
    }
};

// Add Product
app.post('/api/products', verifyToken, async (req, res) => {
    const { name, price, image, category } = req.body;

    console.log('Received product request:', { name, price, image, category });

    if (!name || !price || !image || !category) {
        console.log('Validation failed: Missing fields');
        return res.status(400).json({ message: 'All fields are required' });
    }

    try {
        const [result] = await pool.query(
            'INSERT INTO products (name, price, image, category) VALUES (?, ?, ?, ?)',
            [name, price, image, category]
        );
        console.log('Product insert result:', result);
        res.status(201).json({ message: 'Product added successfully' });
    } catch (error) {
        console.error('Product error:', error.message, error.stack);
        res.status(500).json({ message: `Server error: ${error.message}` });
    }
});

// Get Products
app.get('/api/products', async (req, res) => {
    try {
        const [products] = await pool.query('SELECT * FROM products');
        console.log('Products fetched:', products.length);
        res.json(products);
    } catch (error) {
        console.error('Products error:', error.message, error.stack);
        res.status(500).json({ message: `Server error: ${error.message}` });
    }
});

app.get('/', (req, res) => {
    res.json({ message: 'Welcome to Wow Mart API' });
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});