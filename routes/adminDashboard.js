const express = require('express');
const {database} = require('../config/helpers');

const router = express.Router();


router.get('/usersCount', (req, res) => {

    let query = 'select count(*) as noOfUsers from users';


    database.query(query, (err, result) => {
        if (err) {
            console.log("Error Retrieving User Count");
        }
        if (result) {
            res.send({
                message: 'User count data',
                data: result[0].noOfUsers
            });
        }

    });
});

router.get('/ordersCount', (req, res) => {

    let query = 'select count(*) as noOfOrders from orders';


    database.query(query, (err, result) => {
        if (err) {
            console.log("Error Retrieving Order Count");
        }
        if (result) {
            res.send({
                message: 'Order count data',
                data: result[0].noOfOrders
            });
        }

    });
});

router.get('/feedbackCount', (req, res) => {

    let query = 'select count(*) as noOfFeedbacks from orderreviews';


    database.query(query, (err, result) => {
        if (err) {
            console.log("Error Retrieving Feedback Count");
        }
        if (result) {
            res.send({
                message: 'Feedback count data',
                data: result[0].noOfFeedbacks
            });
        }

    });
});

router.get('/ingredientCount', (req, res) => {

    let query = 'select count(*) as noOfIngredients from ingredients';


    database.query(query, (err, result) => {
        if (err) {
            console.log("Error Retrieving Ingredient Count");
        }
        if (result) {
            res.send({
                message: 'Ingredient count data',
                data: result[0].noOfIngredients
            });
        }

    });
});


router.get('/getRatingChartInfo', (req, res) => {

    let query = 'SELECT count(*) as count, Rating FROM `orderreviews` group by Rating;';


    database.query(query, (err, result) => {
        if (err) {
            console.log("Error Retrieving Rating Analyze");
        }
        if (result) {
            console.log(result);
            res.send({
                message: 'Rating Analyze data',
                data: result
            });
        }

    });
});


router.get('/getRevenuePerYear', (req, res) => {

    let query = 'select year(orderDate) as year, sum(totalAmount) as totalAmount from orders group by year(orderDate)';


    database.query(query, (err, result) => {
        if (err) {
            console.log("Error Retrieving Revenue Per Year Analyze");
        }
        if (result) {
            console.log(result);
            res.send({
                message: 'Revenue Per Year Analyze data',
                data: result
            });
        }

    });
});


router.get('/getStatusCountByStatus/:status', (req, res) => {

    let status=req.params.status;

    let query = 'select count(*) as count from orders where Status=? group by Status';


    database.query(query,[status], (err, result) => {
        if (err) {
            console.log("Error Status Count");
        }
        if (result) {
            console.log(result);
            res.send({
                message: 'Status Count',
                data: result
            });
        }

    });
});

router.get('/getStatusExceptCompletedCount', (req, res) => {

    let query = 'select count(*) as count from orders where Status in ("Received","Preparing Food","Order Ready")';


    database.query(query, (err, result) => {
        if (err) {
            console.log("Error Status Except Completed Count");
        }
        if (result) {
            console.log(result);
            res.send({
                message: 'Status Count  Except Completed',
                data: result
            });
        }

    });
});



module.exports = router;