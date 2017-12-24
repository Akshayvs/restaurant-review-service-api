'use strict';

const express = require('express');
const _ = require('lodash');
const handleError = require('../utils/errorHandler');
const restaurantValidator = require('../utils/restaurant-validator');

let connectionPool;

const restaurants = {
    init: function(BaseApp, pool) {
        const baseRoute = express.Router();
        BaseApp.use('/restaurants', baseRoute);
        connectionPool = pool;
        restaurants.getAllRestaurants(baseRoute);
        restaurants.createRestaurant(baseRoute);
        restaurants.getRestaurantsByName(baseRoute);
        restaurants.getRestaurantsByCity(baseRoute);
        restaurants.getRestaurantsByCategory(baseRoute);
    },

    getAllRestaurants: function(baseRoute) {
        baseRoute.get('/allrestaurants', function(request, response) {

            connectionPool.getConnection(function(error, connection) {
                connection.query(`SELECT * FROM Restaurants INNER JOIN Addresses ON Restaurants.address=Addresses.address`, function(error, result) {
                    if (error) {
                        handleError('Error while querying data from ');
                    }
                    response.status(200).send(result);
                    connection.release();
                });
            });
        });
    },

    getRestaurantsByName: function(baseRoute) {
        baseRoute.get('/byname', function(request, response) {
            const query = request.query.name;

            // input validation for comma separated alphabets
            if (query && /^\w+(,\w+)*$/.test(query)) {

                let names = (_.uniq(query.split(','))).map(function(value) {
                    return '\'' + value + '\'';
                }).toString();

                connectionPool.getConnection(function(error, connection) {
                    let query = connection.query(`SELECT * FROM Restaurants INNER JOIN Addresses ON Restaurants.address=Addresses.address WHERE Restaurants.name IN (${names})`, function(error, result) {
                        console.log('QUERY = ', query.sql);
                        if (error) {
                            handleError('Error while querying data from  Database', error, response);
                        }
                        connection.release();
                        return response.status(200).send(result);
                    });
                });
            } else {
                return handleError('Query string parameter `name` is missing or is invalid. Only alphabets allowed', '404', response);
            }
        });
    },

    getRestaurantsByCity: function(baseRoute) {
        baseRoute.get('/bycity', function(request, response) {
            const query = request.query.city;

            // input validation for comma separated alphabets
            if (query && /^\w+(,\w+)*$/.test(query)) {

                let city = (_.uniq(query.split(','))).map(function(value) {
                    return '\'' + value + '\'';
                }).toString();

                connectionPool.getConnection(function(error, connection) {
                    let query = connection.query(`SELECT * FROM Restaurants INNER JOIN Addresses ON Restaurants.address=Addresses.address WHERE Addresses.city IN (${city})`, function(error, result) {
                        console.log('QUERY = ', query.sql);
                        if (error) {
                            handleError('Error while querying data from  Database', error, response);
                        }
                        connection.release();
                        return response.status(200).send(result);
                    });
                });
            } else {
                return handleError('Query string parameter `city` is missing or is invalid. Only alphabets allowed', '404', response);
            }
        });
    },

    getRestaurantsByCategory: function(baseRoute) {
        baseRoute.get('/bycategory', function(request, response) {
            const query = request.query.category;

            // input validation for comma separated alphabets
            if (query && /^\w+(,\w+)*$/.test(query)) {
                let city = (_.uniq(query.split(','))).map(function(value) {
                    return '\'' + value + '\'';
                }).toString();

                connectionPool.getConnection(function(error, connection) {
                    let query = connection.query(`SELECT * FROM Restaurants INNER JOIN Addresses ON Restaurants.address=Addresses.address WHERE Restaurants.category IN (${city})`, function(error, result) {
                        console.log('QUERY = ', query.sql);
                        if (error) {
                            handleError('Error while querying data from  Database', error, response);
                        }
                        connection.release();
                        return response.status(200).send(result);
                    });
                });
            } else {
                return handleError('Query string parameter `category` is missing or is invalid. Only alphabets allowed', '404', response);
            }
        });
    },

    createRestaurant: function(baseRoute) {
        /*
        Input Validation
        Check if Restaurants table contains the input address (address is the primary key in Restaurants and Addresses tables)
        Insert the values in Restaurants and Addresses tables.
        Fetch the newly saved value from the database and return it to the user as a confirmation
        */

        baseRoute.post('/create', function(request, response) {
            const payload = request.body;

            const name = payload.name;
            const category = payload.category;
            const address = payload.address;
            const state = payload.state;
            const city = payload.city;
            const zip = payload.zip;

            const validityCheck = restaurantValidator(name, category, address, state, city, zip);
            if (validityCheck === true) {
                connectionPool.getConnection(function(error, connection) {

                    connection.query(`SELECT * FROM Restaurants where Address = '${address}' `, function(e, result) {
                        if (e || result.length !== 0) {
                            return handleError('Restaurant exists at this address', '404', response);
                        } else {
                            const restaurantValues = {
                                name: name,
                                category: category,
                                address: address
                            };
                            connection.query(`INSERT into Restaurants SET ?`, restaurantValues, function(e, res) {
                                if (e) {
                                    return handleError(' Error while Inserting in the Database', e, response);
                                }
                                const addressValues = {
                                    address: address,
                                    state: state,
                                    city: city,
                                    zip: zip
                                };
                                connection.query(`INSERT into Addresses SET ?`, addressValues, function(e) {
                                    if (e) {
                                        return handleError(' Error while Inserting in the Database', e, response);
                                    }
                                    var query = connection.query(`SELECT * FROM Restaurants INNER JOIN Addresses ON Restaurants.address=Addresses.address WHERE Restaurants.address = '${address}'`, function(err, res) {

                                        console.log(query.sql);
                                        if (e) {
                                            return handleError(' Error while Inserting in the Database', e, response);
                                        }
                                        return response.status(200).send(res);
                                    });
                                });
                            });
                        }
                    });
                });
            } else {
                return handleError(validityCheck, '404', response);
            }
        });
    }
};
module.exports = restaurants;
