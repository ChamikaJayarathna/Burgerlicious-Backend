const express = require('express');
const router = express.Router();
const {database} = require('../config/helpers');

router.get('/', (req, res) => {

    let query = "select * from ingredients";
    database.query(query, (err, result) => {
        if (err) {
            console.log("Error Retrieving Ingredients");
        }
        if (res) {
            res.send({
                message: 'All ingredients data',
                data: result
            });
        }

    });
});

module.exports = router;