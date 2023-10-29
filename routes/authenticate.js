const express = require('express');
const router = express.Router();
const mysql = require('mysql2/promise'); // Import the mysql2/promise package
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const {config} = require('../config/helpers'); // Import the MySQL configuration

// Create a MySQL connection pool
const pool = mysql.createPool(config);

router.post('/signup', async (req, res) => {
  try {
    const { Name, Email, Password, Contact, FirstName, LastName} = req.body;

    // Get a connection from the pool
    const connection = await pool.getConnection();

    // Check if the user already exists
    const [existingUserRows] = await connection.query('SELECT * FROM users WHERE Username = ?', [Name]);
    if (existingUserRows.length > 0) {
      connection.release();
      return res.status(400).json({ error: 'Username already exists' });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(Password, 10);
  
    // Insert the new user into the database
    await connection.query('INSERT INTO users (Username, PasswordHash, Email, Contact, FirstName, LastName ) VALUES (?, ?, ?, ?, ?, ?)', [Name, hashedPassword, Email, Contact, FirstName, LastName ]);

    // Release the connection
    connection.release();

    res.json({ message: 'User registered successfully' });
  } catch (error) {
    console.error('Error signing up:', error.message);
    res.status(500).json({ error: 'An error occurred while signing up' });
  }
});

router.post('/signin', async (req, res) => {
  try {
    const { Name, Password } = req.body;

    // Get a connection from the pool
    const connection = await pool.getConnection();

    // Retrieve user by username
    const [userRows] = await connection.query('SELECT * FROM users WHERE Username = ?', [Name]);
    if (userRows.length === 0) {
      connection.release();
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Check password
    const isPasswordValid = await bcrypt.compare(Password, userRows[0].PasswordHash);
    if (!isPasswordValid) {
      connection.release();
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Create and send JWT token
    const token = jwt.sign({ userId: userRows[0].UserID }, 'yourSecretKey');
    connection.release();
    res.json({ token });
  } catch (error) {
    console.error('Error signing in:', error.message);
    res.status(500).json({ error: 'An error occurred while signing in' });
  }
});

module.exports = router;
