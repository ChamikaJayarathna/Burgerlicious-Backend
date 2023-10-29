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

router.get('/:id', (req, res) => {

    let id = parseInt(req.params.id);
    database.query("select OrderID, users.Username, users.UserID, DATE_FORMAT(OrderDate, '%Y-%m-%d %H:%i:%s') AS OrderDate, TotalAmount, Status from orders inner join users on orders.UserID=users.UserID where orders.OrderID = ?", [id], (err, result) => {
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
            database.query("delete from orderreviews where orderID = ?", [id], (err2, result2) => {
                if (err2) {
                    console.log("Error deleting order review from orderreviews table");
                    console.log(err2);
                }
                if (result2) {
                    database.query("delete from orders where orderID = ?", [id], (err3, result3) => {
                        if (err2) {
                            console.log("Error deleting order from orders table");
                            console.log(err3);
                        }
                        if (result3) {
                            res.send({
                                message: 'Deleted order successfully',
        
                            });
                        }
                    });
                }
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

router.get('/getAllOrderItemsByOrderID/:id', (req, res) => {

    let id = parseInt(req.params.id);
    database.query("select * from ordercustomizations inner join ingredients on ingredients.IngredientID = ordercustomizations.IngredientID where orderID = ?", [id], (err, result) => {
        if (err) {
            console.log("Error Retrieving Order Items");
            console.log(err);
        }
        if (result) {
            res.send({
                message: 'Order Items Data Retrieved',
                data: result
            });
        }

    });
});

router.get('/getOrderForViewById/:id', (req, res) => {

    let id = parseInt(req.params.id);
    database.query("select OrderID, users.Username, users.Contact, users.Email , users.UserID, DATE_FORMAT(OrderDate, '%Y-%m-%d %H:%i:%s') AS OrderDate, TotalAmount, Status from orders inner join users on orders.UserID=users.UserID  where orderID = ?", [id], (err, result) => {
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

router.get('/users', (req, res) => {

    let query = 'select * from users';
    database.query(query, (err, result) => {
        if (err) {
            console.log("Error Retrieving users");
        }
        if (result) {
            res.send({
                message: 'All users data',
                data: result
            });
        }

    });
});

router.put('/updateOrderById/:id', (req, res) => {

    let id = parseInt(req.params.id);
    let TotalAmount=req.body.TotalAmount;
    let UserID=req.body.UserID;

    database.query("update orders set UserID=?, TotalAmount=? where orderID = ?", [UserID, TotalAmount,id], (err, result) => {
        if (err) {
            console.log("Error Updating Order");
            console.log(err);
        }
        if (result) {
            res.send({
                message: 'Order Data Updated',
                data: result
            });
        }

    });
});

router.get('/getOrderItemById/:id', (req, res) => {

    let id = parseInt(req.params.id);
    database.query("select * from ordercustomizations inner join ingredients on ingredients.IngredientID = ordercustomizations.IngredientID where OrderCustomizationID = ?", [id], (err, result) => {
        if (err) {
            console.log("Error Retrieving Order Item");
            console.log(err);
        }
        if (result) {
            res.send({
                message: 'Order Item Data Retrieved',
                data: result
            });
        }

    });
});

router.put('/updateOrderItemById/:id', (req, res) => {

    let id = parseInt(req.params.id);
    let Quantity=req.body.Quantity;
    let Subtotal=req.body.Subtotal;
    database.query("update ordercustomizations set Quantity =?, Subtotal =? where OrderCustomizationID = ?", [Quantity,Subtotal,id], (err, result) => {
        if (err) {
            console.log("Error Updating Order Items");
            console.log(err);
        }
        if (result) {
            res.send({
                message: 'Order Items Data Updated',
                data: result
            });
        }

    });
});

router.put('/updateOrderTotalAmount/:id', (req, res) => {

    let id = parseInt(req.params.id);
    let totalAmountCalculate=req.body.totalAmountCalculate;
    console.log(totalAmountCalculate);
    database.query("update orders set TotalAmount =? where OrderID = ?", [totalAmountCalculate,id], (err, result) => {
        if (err) {
            console.log("Error Updating Order TotalAmount");
            console.log(err);
        }
        if (result) {
            res.send({
                message: 'Order TotalAmount Data Updated',
                data: result
            });
        }

    });
});

module.exports = router;