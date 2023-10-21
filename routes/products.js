const express = require('express');
const router = express.Router();
const mysql = require('mysql2/promise');

const {config} = require('../config/helpers');
const pool = mysql.createPool(config);

// GET products
router.get('/', async (req, res) => {
  try {
    const connection = await pool.getConnection();
    const [rows] = await connection.query('SELECT ProductID,ProductName,Price,Description,CONCAT("http://localhost:3600/productImages/",ImageURL) as ImageURL,Rating,CategoryID FROM products');
    connection.release();

    res.json(rows);
  } catch (error) {
    console.error('Error retrieving products', error.message);
    res.status(500).json({ error: 'An error occurred while fetching products' });
  }
});


module.exports = router;
