'use strict';

const express = require('express');
let connectionPool;


const restaurants = {
    init: function (BaseApp, pool) {
        const baseRoute = express.Router();
        BaseApp.use('/restaurants', baseRoute);
        connectionPool = pool;
        restaurants.getrestaurants(baseRoute);
    },

    getrestaurants: function (baseRoute) {
        baseRoute.get('/getRestaurants', function (request, response, next) {
            connectionPool.getConnection(function (error, connection) {
                connection.query("SELECT * FROM Restaurants", function (error, result) {
                    console.log(' results = ', result);
                    console.log(' error = ', error);

                    response.status(200).send(result);
                    connection.release();
                });
            });
        });
    }
};
module.exports = restaurants;