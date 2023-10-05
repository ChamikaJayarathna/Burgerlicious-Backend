const express = require('express');
const router = express.Router();
const {database} = require('../config/helpers');

router.get('/', (req, res) => {

    let query = "SELECT OrderID, UserID, DATE_FORMAT(OrderDate, '%Y-%m-%d %H:%i:%s') AS OrderDate, TotalAmount, Status from orders";
    database.query(query, (err, result) => {
        if (err) {
            console.log("Error Retrieving Orders");
        }
        if (res) {
            res.send({
                message: 'All orders data',
                data: result
            });
        }

    });
});

router.post('/addOrder', (req, res) => {
    let UserID = req.body.UserID;
    let TotalAmount = req.body.TotalAmount;
    let Status = 'Received'; //always when added the order, status will be received 

    database.query("insert into orders (Status,UserID,TotalAmount,OrderDate) values (?,?,?,NOW())", [Status, UserID, TotalAmount], (err, result) => {

        if (err) {

            console.log(err);

        }
        res.send({
            message: 'Order Inserted',
            data: result
        });

    });


});


router.get('/ingredients', (req, res) => {

    let query = 'select * from ingredients';
    database.query(query, (err, result) => {
        if (err) {
            console.log("Error Retrieving ingredients");
        }
        if (res) {
            res.send({
                message: 'All ingredients data',
                data: result
            });
        }

    });
});

router.get('/ingredients/:id', (req, res) => {

    let id = parseInt(req.params.id);
    database.query("select * from ingredients where IngredientID = ?", [id], (err, result) => {
        if (err) {
            console.log("Error Retrieving ingredient");
            console.log(err);
        }
        if (res) {
            res.send({
                message: 'ingredient Data Retrieved',
                data: result
            });
        }

    });
});

router.post('/addOrderCustomizations', (req, res) => {
    let orderId = req.body.orderId;
    let data = req.body.data;

    for (let i=0;i<data.length;i++) {

        let product = data[i];
        database.query("insert into ordercustomizations (OrderID,Quantity,Subtotal,IngredientID) values (?,?,?,?)", [parseInt(orderId), product.Quantity, product.Subtotal, parseInt(product.IngredientID)], (err, result) => {

            if (err) {
                console.log(err);
            }

        });
    }

    res.send({
        message: 'OrderCustomizations Inserted'
    });


});



module.exports = router;