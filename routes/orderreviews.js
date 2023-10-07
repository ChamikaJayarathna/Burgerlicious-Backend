const express = require('express');
const router = express.Router();
const mysql = require('mysql2/promise'); // Import the mysql2/promise package

const {config} = require('../config/helpers'); // Import the MySQL configuration

// Create a MySQL connection pool
const pool = mysql.createPool(config);

// GET order reviews
router.get('/orderreviews', async (req, res) => {
  try {
    // Get a connection from the pool
    const connection = await pool.getConnection();

    // Query to fetch order reviews
    const [rows] = await connection.query('SELECT * FROM OrderReviews');

    // Release the connection
    connection.release();

    res.json(rows);
  } catch (error) {
    console.error('Error retrieving order reviews:', error.message);
    res.status(500).json({ error: 'An error occurred while fetching order reviews' });
  }
});

// GET order review by ReviewID with ingredient names as an array
router.get('/orderreviews/:ReviewID', async (req, res) => {
  try {
    const { ReviewID } = req.params; // Extract ReviewID from the URL parameters

    // Get a connection from the pool
    const connection = await pool.getConnection();

    // SQL query to fetch the order review by ReviewID with ingredient information
    const query = `
      SELECT
        ORV.*,
        OCI.IngredientID,
        I.IngredientName,
        O.*
      FROM
        orderreviews AS ORV
      LEFT JOIN
        ordercustomizations AS OCI ON ORV.OrderID = OCI.OrderID
      LEFT JOIN
        ingredients AS I ON OCI.IngredientID = I.IngredientID
      LEFT JOIN
        orders AS O ON ORV.OrderID = O.OrderID
      WHERE
        ORV.ReviewID = ?;`;

    // Execute the query with ReviewID as a parameter
    const [rows] = await connection.query(query, [ReviewID]);

    // Release the connection
    connection.release();

    if (rows.length === 0) {
      // If no order review with the specified ReviewID is found, return a 404 status
      res.status(404).json({ error: 'Order review not found' });
    } else {
      // Extract ingredient names and store them in an array
      const ingredientNames = rows.map((row) => row.IngredientName);

      // Remove the IngredientName property from each row
      rows.forEach((row) => delete row.IngredientName);

      // Add the array of ingredient names to the JSON response
      rows[0].IngredientNames = ingredientNames;

      // Return the modified JSON response
      res.json(rows[0]);
    }
  } catch (error) {
    console.error('Error retrieving order review:', error.message);
    res.status(500).json({ error: 'An error occurred while fetching the order review' });
  }
});




// POST order reviews
router.post('/orderreviews', async (req, res) => {
  try {
    const { OrderID, UserID, Rating, Comment, imageURL, burgerName, Name } = req.body;

    // Get a connection from the pool
    const connection = await pool.getConnection();

    // Insert order review data
    await connection.query(
      'INSERT INTO OrderReviews (OrderID, UserID, Rating, Comment, imageURL, burgerName, Name) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [OrderID, UserID, Rating, Comment, imageURL, burgerName, Name]
    );

    // Release the connection
    connection.release();

    res.json({ message: 'Order review added successfully' });
  } catch (error) {
    console.error('Error adding order review:', error.message);
    res.status(500).json({ error: 'An error occurred while adding the order review' });
  }
});


// PUT (Update) order reviews
router.put('/orderreviews/:ReviewID', async (req, res) => {
  try {
    const reviewID = req.params.ReviewID;
    const { Rating, Comment, burgerName, Name } = req.body;

    // Get a connection from the pool
    const connection = await pool.getConnection();

    // Update order review data
    await connection.query(
      'UPDATE orderreviews SET Rating = ?, Comment = ?, burgerName = ?, Name = ? WHERE ReviewID = ?',
      [Rating, Comment, burgerName, Name, reviewID]
    );

    // Release the connection
    connection.release();

    res.json({ message: 'Order review updated successfully' });
  } catch (error) {
    console.error('Error updating order review:', error.message);
    res.status(500).json({ error: 'An error occurred while updating the order review' });
  }
});


// DELETE order review by ReviewID
router.delete('/orderreviews/:ReviewID', async (req, res) => {
  try {
    const { ReviewID } = req.params; // Extract ReviewID from the URL parameters

    // Get a connection from the pool
    const connection = await pool.getConnection();

    // Query to delete the order review by ReviewID
    const deleteQuery = 'DELETE FROM orderreviews WHERE ReviewID = ?';

    // Execute the query with ReviewID as a parameter
    const [result] = await connection.query(deleteQuery, [ReviewID]);

    // Release the connection
    connection.release();

    if (result.affectedRows === 0) {
      // If no order review with the specified ReviewID is found, return a 404 status
      res.status(404).json({ error: 'Order review not found' });
    } else {
      // Otherwise, return a success message
      res.json({ message: 'Order review deleted successfully' });
    }
  } catch (error) {
    console.error('Error deleting order review:', error.message);
    res.status(500).json({ error: 'An error occurred while deleting the order review' });
  }
});


module.exports = router;
