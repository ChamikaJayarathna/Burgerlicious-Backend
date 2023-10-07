const express = require('express');
const router = express.Router();
const mysql = require('mysql2/promise'); // Import the mysql2/promise package

const {config} = require('../config/helpers'); // Import the MySQL configuration

// Create a MySQL connection pool
const pool = mysql.createPool(config);

// Get all items
// GET endpoint to retrieve users
router.get('/users', async (req, res) => {
  try {
    // Get a connection from the pool
    const connection = await pool.getConnection();

    // Query to fetch users
    const [rows] = await connection.query('SELECT * FROM Users');

    // Release the connection
    connection.release();

    // Send the user data as the response
    res.json(rows);
  } catch (error) {
    console.error('Error retrieving users:', error.message);
    res.status(500).json({ error: 'An error occurred while fetching users' });
  }
});

// Add users
router.post('/users', async (req, res) => {
  try {
    const { username, email, passwordHash, contact, createdAt } = req.body;

    // Get a connection from the pool
    const connection = await pool.getConnection();

    // Insert user data
    await connection.query(
      'INSERT INTO Users (Username, Email, PasswordHash, Contact, CreatedAt) VALUES (?, ?, ?, ?, ?)',
      [username, email, passwordHash, contact, createdAt]
    );

    // Release the connection
    connection.release();

    res.json({ message: 'User added successfully' });
  } catch (error) {
    console.error('Error adding user:', error.message);
    res.status(500).json({ error: 'An error occurred while adding the user' });
  }
});

// Edit users
router.put('/users/:id', async (req, res) => {
  try {
    const userID = req.params.id;
    const { username, email, passwordHash, contact, createdAt } = req.body;

    // Get a connection from the pool
    const connection = await pool.getConnection();

    // Update user data
    await connection.query(
      'UPDATE Users SET Username = ?, Email = ?, PasswordHash = ?, Contact = ?, CreatedAt = ? WHERE UserID = ?',
      [username, email, passwordHash, contact, createdAt, userID]
    );

    // Release the connection
    connection.release();

    res.json({ message: 'User updated successfully' });
  } catch (error) {
    console.error('Error updating user:', error.message);
    res.status(500).json({ error: 'An error occurred while updating the user' });
  }
});

// Delete user and related records
router.delete('/users/:UserID', async (req, res) => {
  try {
    const userID = req.params.UserID;

    // Begin a database transaction
    const connection = await pool.getConnection();
    await connection.beginTransaction();

    try {
      // Delete related records in other tables (e.g., orderreviews)
      // Here, we're assuming the related records have a foreign key 'UserID'
      await connection.query('DELETE FROM orderreviews WHERE UserID = ?', [userID]);

      // Delete the user
      await connection.query('DELETE FROM users WHERE UserID = ?', [userID]);

      // Commit the transaction
      await connection.commit();

      res.json({ message: 'User and related records deleted successfully' });
    } catch (error) {
      // Rollback the transaction if an error occurs
      await connection.rollback();
      throw error;
    } finally {
      // Release the connection
      connection.release();
    }
  } catch (error) {
    console.error('Error deleting user and related records:', error.message);
    res.status(500).json({ error: 'An error occurred while deleting the user and related records' });
  }
});

module.exports = router;
