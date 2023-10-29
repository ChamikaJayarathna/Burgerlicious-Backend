const express = require('express');
const router = express.Router();
const mysql = require('mysql2/promise');
const { database } = require("../config/helpers");

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


router.get('/:id', (req, res) => {

  let id = parseInt(req.params.id);
  database.query('SELECT ProductID,ProductName,Price,Description,CONCAT("http://localhost:3600/productImages/",ImageURL) as ImageURL,Rating,CategoryID FROM products where ProductID = ?', [id], (err, result) => {
      if (err) {
          console.log("Error Retrieving Product");
          console.log(err);
      }
      if (result) {
        console.log(result);
          res.status(200).json(result[0]);
      }

  });
});

module.exports = router;
