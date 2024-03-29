const express = require('express');
const router = express.Router();
const mysql = require('mysql2/promise'); // Import the mysql2/promise package

const multer = require('multer');
const fs = require('fs');
const base64Img = require("base64-img");
const path = require('path');


const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'customizeImages/');
  },
  filename: function (req, file, cb) {
    const uniqueFileName = Date.now() + '-' + file.originalname + '.png';
    cb(null, uniqueFileName);
  },
});

const upload = multer({ storage: storage });

const {config} = require('../config/helpers'); // Import the MySQL configuration

// Create a MySQL connection pool
const pool = mysql.createPool(config);

// GET order customizations
router.get('/ordercustomizations', async (req, res) => {
  try {
    // Get a connection from the pool
    const connection = await pool.getConnection();

    // Query to fetch order customizations
    const [rows] = await connection.query('SELECT * FROM OrderCustomizations');

    // Release the connection
    connection.release();

    res.json(rows);
  } catch (error) {
    console.error('Error retrieving order customizations:', error.message);
    res.status(500).json({ error: 'An error occurred while fetching order customizations' });
  }
});

// GET categories
router.get('/customize-categories', async (req, res) => {
  try {
    // Get a connection from the pool
    const connection = await pool.getConnection();

    // Query to fetch categories with isIngredient = 'yes' and level > 0
    const sql = 'SELECT * FROM categories WHERE isIngredient = ? AND level > 0 ORDER BY level ASC';
    const [rows] = await connection.query(sql, ['yes']);

    // Release the connection
    connection.release();

    res.json(rows);
  } catch (error) {
    console.error('Error retrieving categories:', error.message);
    res.status(500).json({ error: 'An error occurred while fetching categories' });
  }
});



// GET order review by ReviewID with ingredient names as an array
router.get("/customizeuser-categories/:CategoryID", async (req, res) => {
  try {
    const { CategoryID } = req.params; // Extract ReviewID from the URL parameters

    // Get a connection from the pool
    const connection = await pool.getConnection();

    // SQL query to fetch the order review by ReviewID with ingredient information
    //  const query = `SELECT * from ingredients where CategoryID = ?;`;

    const query = `SELECT IngredientID,IngredientName,Price,Description, ImageURL,CategoryID FROM ingredients where CategoryID = ?`;

    // Execute the query with ReviewID as a parameter
    const [rows] = await connection.query(query, [CategoryID]);

    // Release the connection
    connection.release();

    // Return the modified JSON response
    res.json(rows);
  } catch (error) {
    console.error("Error retrieving order review:", error.message);
    res
      .status(500)
      .json({
        error:
          "An error occurred while fetching the order recustomizationsview",
      });
  }
});

// GET order review by ReviewID with ingredient names as an array
router.get('/customize-categories/:CategoryID', async (req, res) => {
  try {
    const { CategoryID } = req.params; // Extract ReviewID from the URL parameters

    // Get a connection from the pool
    const connection = await pool.getConnection();

    // SQL query to fetch the order review by ReviewID with ingredient information
    //  const query = `SELECT * from ingredients where CategoryID = ?;`;
      
    const query = `SELECT IngredientID,IngredientName,Price,Description,CONCAT("http://localhost:3600/ingredientImages/",ImageURL) as ImageURL,CategoryID FROM ingredients where CategoryID = ?`;

    // Execute the query with ReviewID as a parameter
    const [rows] = await connection.query(query, [CategoryID]);

    // Release the connection
    connection.release();

      // Return the modified JSON response
      res.json(rows);
  } catch (error) {
    console.error('Error retrieving order review:', error.message);
    res.status(500).json({ error: 'An error occurred while fetching the order recustomizationsview' });
  }
});


// POST order customizations
router.post('/ordercustomizations', async (req, res) => {
  try {
    const { ingredientID, customizeName, customizeImg } = req.body;

    // Get a connection from the pool
    const connection = await pool.getConnection();

    // Insert order customization data
    await connection.query('INSERT INTO `ordercustomizations`(`ingredientID`, `customizeName`, `customizeImg`) VALUES (?, ?, ?)', [ ingredientID, customizeName, customizeImg ]);

    // Release the connection
    connection.release();

    res.json({ message: 'Order customization added successfully' });
  } catch (error) {
    console.error('Error adding order customization:', error.message);
    res.status(500).json({ error: 'An error occurred while adding the order customization' });
  }
});


/* PUT (Update) order customizations
router.put('/ordercustomizations/:id', async (req, res) => {
  try {
    const orderCustomizationID = req.params.id;
    const { OrderID, IngredientID } = req.body;

    // Get a connection from the pool
    const connection = await pool.getConnection();

    // Update order customization data
    await connection.query(
      'UPDATE OrderCustomizations SET OrderID = ?, IngredientID = ? WHERE OrderCustomizationID = ?',
      [OrderID, IngredientID, orderCustomizationID]
    );

    // Release the connection
    connection.release();

    res.json({ message: 'Order customization updated successfully' });
  } catch (error) {
    console.error('Error updating order customization:', error.message);
    res.status(500).json({ error: 'An error occurred while updating the order customization' });
  }
});

*/

// DELETE order customizations
router.delete('/ordercustomizations/:id', async (req, res) => {
  try {
    const orderCustomizationID = req.params.id;

    // Get a connection from the pool
    const connection = await pool.getConnection();

    // Delete the order customization
    await connection.query('DELETE FROM OrderCustomizations WHERE OrderCustomizationID = ?', [orderCustomizationID]);

    // Release the connection
    connection.release();

    res.json({ message: 'Order customization deleted successfully' });
  } catch (error) {
    console.error('Error deleting order customization:', error.message);
    res.status(500).json({ error: 'An error occurred while deleting the order customization' });
  }
});

// // POST - create a ingredient image record
// router.post('/ordercustomizations/save-image',upload.single('image'), (req, res) => {

//   const imageUrl = req.file.filename;
//   console.log(imageUrl);
  
//   if(req.file.filename){
//     //res.send(imageUrl);
//     res.send({
//       message: 'Image Url',
//       data: imageUrl
//   });
//   }
// });

router.post("/ordercustomizations/save-image", (req, res) => {
  const { burgerName, capturedImage } = req.body;

  // Decode base64 image
  base64Img.img(capturedImage, 'ingredientImages', burgerName, (err, filepath) => {
    if (err) {
      console.error('Error decoding and saving image:', err);
      res.status(500).json({ error: 'Failed to save image' });
    } else {
      console.log('Image saved successfully:', filepath);
      res.json({ message: 'Image saved successfully' });
    }
  });
});

router.get('/ordercustomizations/:imagePath', (req, res) => {
  try {
    const imagePath = decodeURIComponent(req.params.imagePath);
    const imageFilePath = path.join(__dirname, '..','ingredientImages', imagePath);
    // Check if the file exists
    if (fs.existsSync(imageFilePath)) {
      // Read the image file synchronously
      const imageFileData = fs.readFileSync(imageFilePath);
      // Convert the binary data to a base64-encoded Data URL
      const dataUrl = `data:image/*;base64,${imageFileData.toString('base64')}`;
      // Send the Data URL as the response
      res.send(dataUrl);
    } else {
      // If the file doesn't exist, send a 404 Not Found response
      res.status(404).send('Not Found');
    }
  } catch (error) {
    console.error('Error handling image request:', error);
    // Handle the error and send an appropriate response
    res.status(500).send('Internal Server Error');
  }
});

module.exports = router;
