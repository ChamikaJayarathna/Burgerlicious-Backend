const express = require("express");
const router = express.Router();
const { database } = require("../config/helpers");

const multer = require('multer');

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

  database.query("DELETE FROM ordercustomizations WHERE IngredientID = ?", [ingredientID], (err, result) => {
    if (err) {
      console.log("Error deleting related records from ordercustomizations table");
      console.log(err);
      res.status(500).json({ error: "Failed to delete related records" });
    } 
    else {
      database.query("DELETE FROM ingredients WHERE IngredientID = ?", [ingredientID], (err2, result2) => {
        if (err2) {
          console.log("Error deleting ingredient from ingredients table");
          console.log(err2);
          res.status(500).json({ error: "Failed to delete ingredient" });
        } else {
          res.json({ message: 'Deleted ingredient successfully' });
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





module.exports = router;