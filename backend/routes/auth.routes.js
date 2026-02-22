const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const dbPool = require('../config/db');
const { authenticateToken } = require('../middleware/auth.middleware');

// POST: Login
router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        const [users] = await dbPool.query('SELECT * FROM users WHERE email = ?', [email]);
        
        if (users.length === 0) {
            return res.status(401).json({
                success: false,
                message: 'Invalid email or password'
            });
        }

        const user = users[0];
        
        // Check password (supports both bcrypt and plain text for migration)
        let isMatch = false;
        
        if (user.password_hash.startsWith('$2b$') || user.password_hash.startsWith('$2a$')) {
            // Bcrypt hash
            isMatch = await bcrypt.compare(password, user.password_hash);
        } else {
            // Plain text (for migration)
            isMatch = password === user.password_hash;
        }

        if (!isMatch) {
            return res.status(401).json({
                success: false,
                message: 'Invalid email or password'
            });
        }

        // Generate JWT token
        const token = jwt.sign(
            {
                id: user.id,
                username: user.username,
                email: user.email,
                role: user.role
            },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.json({
            success: true,
            message: 'Login successful',
            token,
            user: {
                id: user.id,
                username: user.username,
                email: user.email,
                role: user.role
            }
        });

    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error during login'
        });
    }
});

// POST: Register new staff
router.post('/register', authenticateToken, async (req, res) => {
    const { username, email, password, role } = req.body;

    try {
        // Check if email already exists
        const [existing] = await dbPool.query('SELECT * FROM users WHERE email = ?', [email]);
        
        if (existing.length > 0) {
            return res.status(400).json({
                success: false,
                message: 'Email is already registered'
            });
        }

        // Hash password
        const saltRounds = 10;
        const hash = await bcrypt.hash(password, saltRounds);

        // Insert new user
        await dbPool.query(
            'INSERT INTO users (username, email, password_hash, role) VALUES (?, ?, ?, ?)',
            [username, email, hash, role || 'staff']
        );

        res.json({
            success: true,
            message: `Staff account for ${username} created successfully`
        });

    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({
            success: false,
            message: 'Database error during registration'
        });
    }
});

// GET: Verify token and get user info
router.get('/verify', authenticateToken, (req, res) => {
    res.json({
        success: true,
        user: req.user
    });
});

module.exports = router;
