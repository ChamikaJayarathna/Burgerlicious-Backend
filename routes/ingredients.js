const express = require('express');
const router = express.Router();
const mysql = require('mysql2/promise'); // Import the mysql2/promise package

const {config} = require('../config/helpers'); // Import the MySQL configuration

// Create a MySQL connection pool
const pool = mysql.createPool(config);

// GET ingredients
router.get('/ingredients', async (req, res) => {
  try {
    // Get a connection from the pool
    const connection = await pool.getConnection();

    // Query to fetch ingredients
    const [rows] = await connection.query('SELECT * FROM Ingredients');

    // Release the connection
    connection.release();

    res.json(rows);
  } catch (error) {
    console.error('Error retrieving ingredients:', error.message);
    res.status(500).json({ error: 'An error occurred while fetching ingredients' });
  }
});

// POST ingredients
router.post('/ingredients', async (req, res) => {
  try {
    const { IngredientName, Price, Description, ImageURL, CategoryID } = req.body;

    // Get a connection from the pool
    const connection = await pool.getConnection();

    // Insert ingredient data
    await connection.query(
      'INSERT INTO Ingredients (IngredientName, Price, Description, ImageURL, CategoryID) VALUES (?, ?, ?, ?, ?)',
      [IngredientName, Price, Description, ImageURL, CategoryID]
    );

    // Release the connection
    connection.release();

    res.json({ message: 'Ingredient added successfully' });
  } catch (error) {
    console.error('Error adding ingredient:', error.message);
    res.status(500).json({ error: 'An error occurred while adding the ingredient' });
  }
});

// DELETE ingredients
router.delete('/ingredients/:id', async (req, res) => {
  try {
    const ingredientID = req.params.id;

    // Get a connection from the pool
    const connection = await pool.getConnection();

    // Delete the ingredient
    await connection.query('DELETE FROM Ingredients WHERE IngredientID = ?', [ingredientID]);

    // Release the connection
    connection.release();

    res.json({ message: 'Ingredient deleted successfully' });
  } catch (error) {
    console.error('Error deleting ingredient:', error.message);
    res.status(500).json({ error: 'An error occurred while deleting the ingredient' });
  }
});

// PUT (Update) ingredients
router.put('/ingredients/:id', async (req, res) => {
  try {
    const ingredientID = req.params.id;
    const { IngredientName, Price, Description, ImageURL, CategoryID } = req.body;

    // Get a connection from the pool
    const connection = await pool.getConnection();

    // Update ingredient data
    await connection.query(
      'UPDATE Ingredients SET IngredientName = ?, Price = ?, Description = ?, ImageURL = ?, CategoryID = ? WHERE IngredientID = ?',
      [IngredientName, Price, Description, ImageURL, CategoryID, ingredientID]
    );

    // Release the connection
    connection.release();

    res.json({ message: 'Ingredient updated successfully' });
  } catch (error) {
    console.error('Error updating ingredient:', error.message);
    res.status(500).json({ error: 'An error occurred while updating the ingredient' });
  }
});

module.exports = router;
