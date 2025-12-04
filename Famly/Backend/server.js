const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Database Connection
// For simulation, we can mock it if no local DB, but let's try to connect
// or just use in-memory if connection fails? 
// Let's assume standard connection for now.
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/famly';

mongoose.connect(MONGO_URI)
    .then(() => console.log('MongoDB Connected'))
    .catch(err => console.log('MongoDB Connection Error:', err));

// Routes
app.post('/api/login', (req, res) => {
    const { email, password } = req.body;

    // Simple mock authentication
    if (email === 'admin@famly.com' && password === 'password123') {
        return res.json({ success: true, token: 'mock-jwt-token', user: { name: 'Admin User' } });
    }

    // Simulate a user
    if (email && password) {
        return res.json({ success: true, token: 'user-jwt-token', user: { name: 'Famly Member' } });
    }

    res.status(401).json({ success: false, message: 'Invalid credentials' });
});

app.get('/', (req, res) => {
    res.send('Famly Backend is running');
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
