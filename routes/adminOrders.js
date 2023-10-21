const express = require('express');
const router = express.Router();
const { database } = require('../config/helpers');

router.get('/', (req, res) => {

    let query = "SELECT OrderID, UserID, DATE_FORMAT(OrderDate, '%Y-%m-%d %H:%i:%s') AS OrderDate, TotalAmount, Status from orders";
    database.query(query, (err, result) => {
        if (err) {
            console.log("Error Retrieving Orders");
        }
        if (result) {
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
        if (result) {
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
        if (result) {
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

    for (let i = 0; i < data.length; i++) {

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

router.delete('/deleteOrder/:id', (req, res) => {

    let id = parseInt(req.params.id);
    database.query("delete from orderCustomizations where orderID = ?", [id], (err, result) => {
        if (err) {
            console.log("Error deleting order from orderCustomizations table");
            console.log(err);
        }
        if (result) {
            database.query("delete from orders where orderID = ?", [id], (err2, result2) => {
                if (err2) {
                    console.log("Error deleting order from orders table");
                    console.log(err2);
                }
                if (result2) {
                    res.send({
                        message: 'Deleted order successfully',

                    });
                }
            });
        }

    });
});

router.get('/:id', (req, res) => {

    let id = parseInt(req.params.id);
    database.query("select OrderID, users.Username, DATE_FORMAT(OrderDate, '%Y-%m-%d %H:%i:%s') AS OrderDate, TotalAmount, Status from orders inner join users on orders.UserID=users.UserID where orderID = ?", [id], (err, result) => {
        if (err) {
            console.log("Error Retrieving Order");
            console.log(err);
        }
        if (result) {
            res.send({
                message: 'Order Data Retrieved',
                data: result
            });
        }

    });
});

router.put('/updateOrderStatusById/:id', (req, res) => {

    let id = parseInt(req.params.id);
    let Status = req.body.Status;
    database.query("update orders set Status = ? where orderID = ?", [Status,id], (err, result) => {
        if (err) {
            console.log("Error Updating Order Status");
            console.log(err);
        }
        if (result) {
            res.send({
                message: 'Updated Order Status',
            });
        }

    });
});


module.exports = router;