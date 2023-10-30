const express = require('express');
const router = express.Router();
const mysql = require('mysql2/promise');
const { database } = require('../config/helpers');
const {config} = require('../config/helpers');
const pool = mysql.createPool(config);


router.get('/orders/ordersByUserId/:id', (req, res) => {

  let UserID = parseInt(req.params.id);
  console.log(UserID);
  let query = "SELECT OrderID, DATE_FORMAT(OrderDate, '%Y-%m-%d %H:%i:%s') AS OrderDate, UserID, TotalAmount, Status from orders where UserID= ? order by OrderDate DESC";
  database.query(query, [UserID],(err, result) => {
      if (err) {
          console.log("Error Retrieving Orders of the user");
      }
      if (result) {
          res.send({
              message: 'All orders data of the user',
              data: result
          });
      }

  });
});


router.get('/orders/orderById/:id', (req, res) => {

  let orderId = parseInt(req.params.id);
  console.log(orderId);
  let query = "SELECT OrderID, UserID, DATE_FORMAT(OrderDate, '%Y-%m-%d %H:%i:%s') AS OrderDate, TotalAmount, Status from orders where OrderID= ?";
  database.query(query, [orderId],(err, result) => {
      if (err) {
          console.log("Error Retrieving Order");
      }
      if (result) {
          res.send({
              message: 'All order data',
              data: result
          });
      }

  });
});


// GET orders
router.get('/orders', async (req, res) => {
  try {
    // Get a connection from the pool
    const connection = await pool.getConnection();

    // Query to fetch orders
    const [rows] = await connection.query('SELECT * FROM Orders');

    // Release the connection
    connection.release();

    res.json(rows);
  } catch (error) {
    console.error('Error retrieving orders:', error.message);
    res.status(500).json({ error: 'An error occurred while fetching orders' });
  }
});

// POST orders
router.post('/orders', async (req, res) => {
  try {
    const { UserID, OrderDate, TotalAmount } = req.body;

    // Get a connection from the pool
    const connection = await pool.getConnection();

    // Insert order data
    await connection.query(
      'INSERT INTO Orders (UserID, OrderDate, TotalAmount) VALUES (?, ?, ?)',
      [UserID, OrderDate, TotalAmount]
    );

    // Release the connection
    connection.release();

    res.json({ message: 'Order added successfully' });
  } catch (error) {
    console.error('Error adding order:', error.message);
    res.status(500).json({ error: 'An error occurred while adding the order' });
  }
});

// PUT (Update) orders
router.put('/orders/:id', async (req, res) => {
  try {
    const orderID = req.params.id;
    const { UserID, OrderDate, TotalAmount } = req.body;

    // Get a connection from the pool
    const connection = await pool.getConnection();

    // Update order data
    await connection.query(
      'UPDATE Orders SET UserID = ?, OrderDate = ?, TotalAmount = ? WHERE OrderID = ?',
      [UserID, OrderDate, TotalAmount, orderID]
    );

    // Release the connection
    connection.release();

    res.json({ message: 'Order updated successfully' });
  } catch (error) {
    console.error('Error updating order:', error.message);
    res.status(500).json({ error: 'An error occurred while updating the order' });
  }
});

// DELETE orders
router.delete('/orders/:id', async (req, res) => {
  try {
    const orderID = req.params.id;

    // Get a connection from the pool
    const connection = await pool.getConnection();

    // Delete the order
    await connection.query('DELETE FROM Orders WHERE OrderID = ?', [orderID]);

    // Release the connection
    connection.release();

    res.json({ message: 'Order deleted successfully' });
  } catch (error) {
    console.error('Error deleting order:', error.message);
    res.status(500).json({ error: 'An error occurred while deleting the order' });
  }
});

module.exports = router;
