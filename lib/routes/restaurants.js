'use strict';

const express = require('express');
const _ = require('lodash');
const validator = require('validator');
const handleError = require('../utils/errorHandler');
const restaurantValidator = require('../utils/restaurant-validator');
const existanceChecker = require('../utils/existance-checker');

let connectionPool;

const restaurants = {
    init: function (BaseApp, pool) {
        const baseRoute = express.Router();
        BaseApp.use('/restaurants', baseRoute);
        connectionPool = pool;
        restaurants.getAllRestaurants(baseRoute);
        restaurants.createRestaurant(baseRoute);
        restaurants.getRestaurantsByName(baseRoute);
        restaurants.getRestaurantsByCity(baseRoute);
        restaurants.getRestaurantsByCategory(baseRoute);
        restaurants.updateRestaurant(baseRoute);
        restaurants.getRestaurant(baseRoute);
    },

    getRestaurant: function (baseRoute) {
        baseRoute.get('/query', function (REQUEST, RESPONSE) {
            const query = REQUEST.query;
            const queryArray = [];

            if (query.name || query.city || query.category || query.totalScore || query.zip) {
                if (query.name) {
                    if (!validator.isAlpha(query.name, 'en-US')) {
                        return handleError('Restaurant name must include letters only', '404', RESPONSE);
                    }
                    queryArray.push(`Restaurants.name= '${query.name}'`);
                }

                if (query.city) {
                    if (!validator.isAlpha(query.city, 'en-US')) {
                        return handleError('Restaurant city must include letters only', '404', RESPONSE);
                    }
                    queryArray.push(`Addresses.city= '${query.city}'`);
                }

                if (query.category) {
                    if (!validator.isAlpha(query.category, 'en-US')) {
                        return handleError('Restaurant category must include letters only', '404', RESPONSE);
                    }
                    queryArray.push(`Restaurants.category= '${query.category}'`);
                }

                if (query.totalScore) {
                    if (!/[+-]?([0-5]*[.])?[0-5]+/.test(query.totalScore)) {
                        return handleError('Rating must be in the range of 0.0 to 5.0', '404', RESPONSE);
                    }
                    queryArray.push(`Rating.total_score= '${query.totalScore}'`);
                }

                if (query.zip) {
                    if (!(validator.isPostalCode(query.zip.toString(), 'US'))) {
                        return handleError('Invalid Zip. Zip must be exactly 5 numbers', '404', RESPONSE);
                    }
                    queryArray.push(`Addresses.zip= '${query.zip}'`);
                }

                connectionPool.getConnection(function (e, connection) {
                    let args = queryArray.toString().replace(',', ' AND ').replace(',', ' AND ').replace(',', ' AND ');

                    let sqlQuery = `SELECT * FROM Rating INNER JOIN Restaurants 
                    ON Rating.address =Restaurants.address 
                    INNER JOIN Addresses ON Rating.address=Addresses.address
                    WHERE ${args}`;

                    connection.query(sqlQuery, function (error, result) {
                        if (error) handleError('Error while querying data from  Database', error, RESPONSE);

                        return RESPONSE.send(result);
                    });
                });
            } else {
                return handleError('Missing query string parameters', '404', RESPONSE);
            }
        });
    },

    getAllRestaurants: function (baseRoute) {
        baseRoute.get('/allrestaurants', function (request, response) {
            connectionPool.getConnection(function (error, connection) {
                connection.query(`SELECT * FROM Restaurants INNER JOIN Addresses ON Restaurants.address=Addresses.address`, function (error, result) {
                    if (error) {
                        handleError('Error while querying data from ');
                    }
                    connection.release();
                    return response.status(200).send(result);
                });
            });
        });
    },

    getRestaurantsByName: function (baseRoute) {
        baseRoute.get('/byname', function (request, response) {
            const query = request.query.name;
            // Regex allows only comma separated alphabets
            if (query && /^\w+(,\w+)*$/.test(query)) {

                let names = (_.uniq(query.split(','))).map(function (value) {
                    return '\'' + value + '\'';
                }).toString();

                connectionPool.getConnection(function (error, connection) {

                    let sqlQuery = `SELECT * FROM Restaurants INNER JOIN Addresses 
                    ON Restaurants.address=Addresses.address 
                    WHERE Restaurants.name IN (${names})`;

                    connection.query(sqlQuery, function (error, result) {
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

    getRestaurantsByCity: function (baseRoute) {
        baseRoute.get('/bycity', function (request, response) {
            const query = request.query.city;
            // Regex allows only comma separated alphabets
            if (query && /^\w+(,\w+)*$/.test(query)) {
                let city = (_.uniq(query.split(','))).map(function (value) {
                    return '\'' + value + '\'';
                }).toString();
                connectionPool.getConnection(function (error, connection) {

                    let sqlQuery = `SELECT * FROM Restaurants INNER JOIN Addresses 
                    ON Restaurants.address=Addresses.address 
                    WHERE Addresses.city IN (${city})`;

                    connection.query(sqlQuery, function (error, result) {
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

    getRestaurantsByCategory: function (baseRoute) {
        baseRoute.get('/bycategory', function (request, response) {
            const query = request.query.category;
            // Regex allows only comma separated alphabets
            if (query && /^\w+(,\w+)*$/.test(query)) {
                let city = (_.uniq(query.split(','))).map(function (value) {
                    return '\'' + value + '\'';
                }).toString();
                connectionPool.getConnection(function (error, connection) {

                    let sqlQuery = `SELECT * FROM Restaurants INNER JOIN Addresses 
                    ON Restaurants.address=Addresses.address 
                    WHERE Restaurants.category IN (${city})`;

                    connection.query(sqlQuery, function (error, result) {
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

    createRestaurant: function (baseRoute) {
        /*
        Input Validation
        Check if Restaurants table contains the given input address (address is the primary key in Restaurants and Addresses tables)
        If no addres not found , then Insert the values in Restaurants and Addresses tables.
        Fetch the newly saved value from the database and return it to the user as a confirmation
        */

        baseRoute.post('/create', function (request, response) {
            const payload = request.body;

            const name = payload.name;
            const category = payload.category;
            const address = payload.address;
            const state = payload.state;
            const city = payload.city;
            const zip = payload.zip;

            const validityCheck = restaurantValidator(name, category, address, state, city, zip);
            if (validityCheck === true) {
                connectionPool.getConnection(function (error, connection) {

                    existanceChecker.doesRestaurantExist(address, connection, function (error, result) {
                        if (error) {
                            return handleError(error.message, error.error, response);
                        }
                        else if (result.length !== 0) {
                            return handleError('Entry already exists for this address', result, response);
                        } else {
                            const restaurantValues = {
                                name: name,
                                category: category,
                                address: address
                            };
                            connection.query(`INSERT INTO Restaurants SET ?`, restaurantValues, function (e, res) {
                                if (e) {
                                    return handleError(' Error while Inserting in the Restaurants Database', e, response);
                                }
                                const addressValues = {
                                    address: address,
                                    state: state,
                                    city: city,
                                    zip: zip
                                };
                                connection.query(`INSERT INTO Addresses SET ?`, addressValues, function (e) {
                                    if (e) {
                                        return handleError(' Error while Inserting in the Addresses Database', e, response);
                                    }

                                    let sqlQuery = `SELECT * FROM Restaurants INNER JOIN Addresses 
                                    ON Restaurants.address=Addresses.address 
                                    WHERE Restaurants.address = '${address}'`;

                                    connection.query(sqlQuery, function (err, res) {
                                        if (e) {
                                            return handleError(' Error while Inserting in the Database', e, response);
                                        }
                                        return response.status(200).send({
                                            message: 'Restaurant successfully added',
                                            body: res
                                        });
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
    },

    updateRestaurant: function (baseRoute) {
        /*
        Input Validation for original values and new values.
        Check if Restaurants table contains the original input address (address is the primary key in Restaurants and Addresses tables)
        If the initial input address is present and the new input address is NOT present, THEN Update the values in Restaurants and Addresses tables.
        Fetch the newly saved value from the database and return it to the user as a confirmation
        */
        baseRoute.post('/update', function (request, response) {
            const payload = request.body;
            const original = payload.originalValue;
            const newValue = payload.newValue;

            const originalInputValidation = restaurantValidator(original.name, original.category, original.address, original.state, original.city, original.zip);
            const newValueInputValidation = restaurantValidator(newValue.name, newValue.category, newValue.address, newValue.state, newValue.city, newValue.zip);

            if (originalInputValidation === true) {
                if (newValueInputValidation === true) {
                    connectionPool.getConnection(function (err, connection) {
                        //Verify that the Restaurants table contains the original input address.

                        existanceChecker.doesRestaurantExist(original.address, connection, function (error, result) {
                            if (error) {
                                return handleError(error.message, error.error, response);
                            } else if (result.length === 0) {
                                return handleError('Original address value does not exist in the database', result, response);
                            } else {
                                const restaurantUpdate = {
                                    name: newValue.name,
                                    category: newValue.category,
                                    address: newValue.address
                                };
                                //Update the values in Restaurants table.
                                connection.query(`Update Restaurants SET ? WHERE address = '${original.address}'`, restaurantUpdate, function (e) {
                                    if (e) {
                                        return handleError('Error while updating data', '500', response);
                                    }
                                    const addressesUpdate = {
                                        address: newValue.address,
                                        state: newValue.state,
                                        city: newValue.city,
                                        zip: newValue.zip
                                    };
                                    //Update the values in Address table.
                                    connection.query(`Update Addresses SET ? WHERE address = '${original.address}'`, addressesUpdate, function (e) {
                                        if (e) {
                                            return handleError('Error while updating data', e, response);
                                        }
                                        //Fetch the newly saved value from the database and return it

                                        let sqlQuery = `SELECT * FROM Restaurants INNER JOIN Addresses 
                                        ON Restaurants.address=Addresses.address 
                                        WHERE Restaurants.address = '${newValue.address}'`;

                                        connection.query(sqlQuery, function (err, res) {
                                            if (e) {
                                                return handleError('Error while updating data', e, response);
                                            }
                                            return response.status(200).send({
                                                message: 'Restaurant successfully updated',
                                                body: res
                                            });
                                        });
                                    });
                                });
                            }
                        });
                    });
                } else {
                    return handleError('New Value : ' + newValueInputValidation, '404', response);
                }
            } else {
                return handleError('Original Value : ' + originalInputValidation, '404', response);
            }
        });
    }
};

module.exports = restaurants;
