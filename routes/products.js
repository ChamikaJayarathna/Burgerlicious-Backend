const express = require('express');
const router = express.Router();
const mysql = require('mysql2/promise');

const {config} = require('../config/helpers');
const pool = mysql.createPool(config);

// GET products
router.get('/', async (req, res) => {
  try {
    const connection = await pool.getConnection();
    const [rows] = await connection.query('SELECT IngredientID,IngredientName,Price,Description,CONCAT("http://localhost:3600/ingredientImages/",ImageURL) as ImageURL,CategoryID FROM ingredients');
    connection.release();

    res.json(rows);
  } catch (error) {
    console.error('Error retrieving order reviews:', error.message);
    res.status(500).json({ error: 'An error occurred while fetching order reviews' });
  }
});


module.exports = router;
