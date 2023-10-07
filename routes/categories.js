const express = require('express');
const router = express.Router();
const mysql = require('mysql2/promise'); // Import the mysql2/promise package

const {config} = require('../config/helpers'); // Import the MySQL configuration

// Create a MySQL connection pool
const pool = mysql.createPool(config);

// POST categories
router.post('/categories', async (req, res) => {
  try {
    const { CategoryName } = req.body;

    // Get a connection from the pool
    const connection = await pool.getConnection();

    // Insert category data
    await connection.query('INSERT INTO Categories (CategoryName) VALUES (?)', [CategoryName]);

    // Release the connection
    connection.release();

    res.json({ message: 'Category added successfully' });
  } catch (error) {
    console.error('Error adding category:', error.message);
    res.status(500).json({ error: 'An error occurred while adding the category' });
  }
});

// GET categories
router.get('/categories', async (req, res) => {
  try {
    // Get a connection from the pool
    const connection = await pool.getConnection();

    // Query to fetch categories
    const [rows] = await connection.query('SELECT * FROM Categories');

    // Release the connection
    connection.release();

    res.json(rows);
  } catch (error) {
    console.error('Error retrieving categories:', error.message);
    res.status(500).json({ error: 'An error occurred while fetching categories' });
  }
});

// Edit categories
router.put('/categories/:id', async (req, res) => {
  try {
    const categoryID = req.params.id;
    const { CategoryName } = req.body;

    // Get a connection from the pool
    const connection = await pool.getConnection();

    // Update category data
    await connection.query('UPDATE Categories SET CategoryName = ? WHERE CategoryID = ?', [CategoryName, categoryID]);

    // Release the connection
    connection.release();

    res.json({ message: 'Category updated successfully' });
  } catch (error) {
    console.error('Error updating category:', error.message);
    res.status(500).json({ error: 'An error occurred while updating the category' });
  }
});

// Delete categories
router.delete('/categories/:id', async (req, res) => {
  try {
    const categoryID = req.params.id;

    // Get a connection from the pool
    const connection = await pool.getConnection();

    // Delete the category
    await connection.query('DELETE FROM Categories WHERE CategoryID = ?', [categoryID]);

    // Release the connection
    connection.release();

    res.json({ message: 'Category deleted successfully' });
  } catch (error) {
    console.error('Error deleting category:', error.message);
    res.status(500).json({ error: 'An error occurred while deleting the category' });
  }
});

module.exports = router;
