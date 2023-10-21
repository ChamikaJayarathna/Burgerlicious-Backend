const express = require("express");
const router = express.Router();
const { database } = require("../config/helpers");

const multer = require('multer');
const fs = require('fs');

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'ingredientImages/');
  },
  filename: function (req, file, cb) {
    const uniqueFileName = Date.now() + '-' + file.originalname;
    cb(null, uniqueFileName);
  },
});

const upload = multer({ storage: storage });

router.get("/", (req, res) => {
  let query = "select * from ingredients";
  database.query(query, (err, result) => {
    if (err) {
      console.log("Error Retrieving Ingredients");
    }
    if (res) {
      res.send({
        message: "All ingredients data",
        data: result,
      });
    }
  });
});

//Delete - Delete the ingredient record
router.delete('/deleteIngredient/:id', (req, res) => {
  const ingredientID = parseInt(req.params.id);

  database.query("SELECT ImageURL FROM ingredients WHERE IngredientID = ?", [ingredientID], (err, result) => {
    if (err) {
      console.log("Error retrieving image URL for the ingredient");
      console.log(err);
      res.status(500).json({ error: "Failed to delete ingredient" });
    } else {
      const imageUrl = result[0].ImageURL;

      database.query("DELETE FROM ordercustomizations WHERE IngredientID = ?", [ingredientID], (err, result) => {
        if (err) {
          console.log("Error deleting related records from ordercustomizations table");
          console.log(err);
          res.status(500).json({ error: "Failed to delete related records" });
        } else {
          database.query("DELETE FROM ingredients WHERE IngredientID = ?", [ingredientID], (err, result) => {
            if (err) {
              console.log("Error deleting ingredient from ingredients table");
              console.log(err);
              res.status(500).json({ error: "Failed to delete ingredient" });
            } else {
              fs.unlink('ingredientImages/' + imageUrl, (err) => {
                if (err) {
                  console.log("Error deleting image file");
                  console.log(err);
                  res.status(500).json({ error: "Failed to delete image file" });
                } else {
                  res.json({ message: 'Deleted ingredient successfully' });
                }
              });
            }
          });
        }
      });
    }
  });
});


// POST - create a ingredient image record
router.post('/addIngredientImage',upload.single('image'), (req, res) => {

  const imageUrl = req.file.filename;
  console.log(imageUrl);
  
  if(req.file.filename){
    //res.send(imageUrl);
    res.send({
      message: 'Image Url',
      data: imageUrl
  });
  }
});

// POST - create a ingredient record
router.post('/addIngredient', (req, res) => {

  const { IngredientName, Price, Description, ImageURL, CategoryID } = req.body;

  const query = 'INSERT INTO ingredients (IngredientName, Price, Description, ImageURL, CategoryID) VALUES (?, ?, ?, ?, ?)';
  

  database.query(query, [IngredientName, Price, Description, ImageURL, CategoryID], (error, result) => {
    if (error) {
      console.log(error);
      res.status(500).json({ error });
      return;
    }
    res.json({ ingredientID: result.insertId });
  });
});


// PUT - Update Ingredient Image and Record
router.put('/updateIngredient/:id', upload.single('image'), (req, res) => {
  const ingredientID = parseInt(req.params.id);
  const { IngredientName, Price, Description, CategoryID } = req.body;
  const newImage = req.file;

  if (!newImage) {
    return res.status(400).json({ error: 'New image is required for update' });
  }

  database.query("SELECT ImageURL FROM ingredients WHERE IngredientID = ?", [ingredientID], (err, result) => {
    if (err) {
      console.log("Error checking if ingredient exists");
      console.log(err);
      return res.status(500).json({ error: "Failed to update ingredient" });
    }

    if (result.length === 0) {
      return res.status(404).json({ error: "Ingredient not found" });
    }

    const imageUrl = result[0].ImageURL;

    const updateImageQuery = 'UPDATE ingredients SET ImageURL = ? WHERE IngredientID = ?';
    database.query(updateImageQuery, [newImage.filename, ingredientID], (error, updateImageResult) => {
      if (error) {
        console.log("Error updating image URL");
        console.log(error);
        return res.status(500).json({ error });
      }

      fs.unlink('ingredientImages/' + imageUrl, (err) => {
        if (err) {
          console.log("Error deleting old image file");
          console.log(err);
        }
      });

      const updateRecordQuery = 'UPDATE ingredients SET IngredientName = ?, Price = ?, Description = ?, CategoryID = ? WHERE IngredientID = ?';
      database.query(updateRecordQuery, [IngredientName, Price, Description, CategoryID, ingredientID], (recordError, updateRecordResult) => {
        if (recordError) {
          console.log("Error updating ingredient record");
          console.log(recordError);
          return res.status(500).json({ error: recordError });
        }
        return res.json({ message: 'Updated ingredient successfully' });
      });
    });
  });
});


module.exports = router;