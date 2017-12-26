'use strict';

const express = require('express');
const _ = require('lodash');
const validator = require('validator');
const debug = require('debug')('restaurants');
const handleError = require('../utils/errorHandler');
const restaurantValidator = require('../utils/restaurant-validator');
const existanceChecker = require('../utils/existance-checker');

let connectionPool;

const restaurants = {
    init: function(BaseApp, pool) {
        debug('Restaurants route connected');
        const baseRoute = express.Router();
        BaseApp.use('/restaurants', baseRoute);
        connectionPool = pool;
        restaurants.getAllRestaurants(baseRoute);
        restaurants.createRestaurant(baseRoute);
        restaurants.updateRestaurant(baseRoute);
        restaurants.getRestaurant(baseRoute);
    },

    getRestaurant: function(baseRoute) {
        baseRoute.get('/query', function(REQUEST, RESPONSE) {
            debug('GET restaurants/query');
            const query = REQUEST.query;
            const queryArray = [];

            if (query.name || query.city || query.category || query.totalScore || query.zip) {
                if (query.name) {
                    if (!validator.isAlpha(query.name, 'en-US')) {
                        return handleError('Restaurant name must include letters only', 'Bad Request', RESPONSE);
                    }
                    queryArray.push(`Restaurants.name= '${query.name}'`);
                }

                if (query.city) {
                    if (!validator.isAlpha(query.city, 'en-US')) {
                        return handleError('Restaurant city must include letters only', 'Bad Request', RESPONSE);
                    }
                    queryArray.push(`Addresses.city= '${query.city}'`);
                }

                if (query.category) {
                    if (!validator.isAlpha(query.category, 'en-US')) {
                        return handleError('Restaurant category must include letters only', 'Bad Request', RESPONSE);
                    }
                    queryArray.push(`Restaurants.category= '${query.category}'`);
                }

                if (query.totalScore) {
                    if (!/[+-]?([0-5]*[.])?[0-5]+/.test(query.totalScore)) {
                        return handleError('Rating must be in the range of 0.0 to 5.0', 'Bad Request', RESPONSE);
                    }
                    queryArray.push(`Rating.total_score= '${query.totalScore}'`);
                }

                if (query.zip) {
                    if (!(validator.isPostalCode(query.zip.toString(), 'US'))) {
                        return handleError('Invalid Zip. Zip must be exactly 5 numbers', 'Bad Request', RESPONSE);
                    }
                    queryArray.push(`Addresses.zip= '${query.zip}'`);
                }

                // replacing all the commas with AND
                let args = queryArray.toString().replace(new RegExp(',', 'g'), ' AND ');

                let sqlQuery = `SELECT * FROM Rating INNER JOIN Restaurants 
                    ON Rating.address =Restaurants.address 
                    INNER JOIN Addresses ON Rating.address=Addresses.address
                    WHERE ${args}`;

                const dbQuery = connectionPool.query(sqlQuery, function(error, result) {
                    if (error) {
                        debug(`Error while querying data : ${error}`);
                        handleError('Error while querying data ', error, RESPONSE);
                    }

                    debug('SUCCESS: Response Sent');
                    return RESPONSE.send(result);
                });
                debug('SQL Query :', dbQuery.sql);
            } else {
                debug('Missing query string parameters in REQUEST =>', query);
                return handleError('Missing query string parameters', 'Bad Request', RESPONSE);
            }
        });
    },

    getAllRestaurants: function(baseRoute) {
        baseRoute.get('/allrestaurants', function(request, response) {
            debug('GET restaurants/allrestaurants');

            const dbQuery = connectionPool.query(`SELECT * FROM Restaurants INNER JOIN Addresses ON Restaurants.address=Addresses.address`, function(error, result) {
                if (error) {
                    debug(`Error while querying data : ${error}`);
                    handleError('Error while querying data');
                }
                debug('SUCCESS: Response sent');
                return response.status(200).send(result);
            });
            debug('SQL Query :', dbQuery.sql);
        });
    },

    createRestaurant: function(baseRoute) {
        /*
        Input Validation
        Check if Restaurants table contains the given input address (address is the primary key in Restaurants and Addresses tables)
        If no addres not found , then Insert the values in Restaurants and Addresses tables.
        Fetch the newly saved value from the database and return it to the user as a confirmation
        */

        baseRoute.post('/create', function(request, response) {
            debug('POST restaurants/create');
            const payload = request.body;

            const name = payload.name;
            const category = payload.category;
            const address = payload.address;
            const state = payload.state;
            const city = payload.city;
            const zip = payload.zip;

            const validityCheck = restaurantValidator(name, category, address, state, city, zip);
            if (validityCheck === true) {

                existanceChecker.doesRestaurantExist(address, connectionPool, function(error, result) {
                    if (error) {
                        debug(`Error while querying data : ${error}`);
                        return handleError(error.message, error.error, response);
                    } else if (result.length !== 0) {
                        return handleError('Entry already exists for this address', result, response);
                    } else {
                        const restaurantValues = {
                            name: name,
                            category: category,
                            address: address
                        };
                        const dbQuery = connectionPool.query(`INSERT INTO Restaurants SET ?`, restaurantValues, function(e, res) {
                            debug('SQL Query :', dbQuery.sql);
                            if (e) {
                                debug(`Error while Inserting in the Restaurants Database : ${error}`);
                                return handleError(' Error while Inserting in the Restaurants Database', e, response);
                            }
                            const addressValues = {
                                address: address,
                                state: state,
                                city: city,
                                zip: zip
                            };
                            const dbQuery2 = connectionPool.query(`INSERT INTO Addresses SET ?`, addressValues, function(e) {
                                debug('SQL Query :', dbQuery2.sql);
                                if (e) {
                                    debug(`Error while Inserting in the Addresses Database : ${error}`);
                                    return handleError(' Error while Inserting in the Addresses Database', e, response);
                                }

                                let sqlQuery = `SELECT * FROM Restaurants INNER JOIN Addresses 
                                    ON Restaurants.address=Addresses.address 
                                    WHERE Restaurants.address = '${address}'`;

                                const dbQuery3 = connectionPool.query(sqlQuery, function(error, res) {
                                    debug('SQL Query :', dbQuery3.sql);

                                    if (e) {
                                        debug(`Error while Querying database : ${error}`);
                                        return handleError(' Error while Querying database', e, response);
                                    }
                                    debug('SUCCESS: Restaurant Added');
                                    return response.status(200).send({
                                        message: 'Restaurant successfully added',
                                        body: res
                                    });
                                });
                            });
                        });
                    }
                });
            } else {
                debug(`Invalid Input : ${validityCheck}`);
                return handleError(validityCheck, 'Bad Request', response);
            }
        });
    },

    updateRestaurant: function(baseRoute) {
        /*
        Input Validation for original values and new values.
        Check if Restaurants table contains the original input address (address is the primary key in Restaurants and Addresses tables)
        If the initial input address is present and the new input address is NOT present, THEN Update the values in Restaurants and Addresses tables.
        Fetch the newly saved value from the database and return it to the user as a confirmation
        */
        baseRoute.post('/update', function(request, response) {
            debug('POST restaurants/update');
            const payload = request.body;
            const original = payload.originalValue;
            const newValue = payload.newValue;

            const originalInputValidation = restaurantValidator(original.name, original.category, original.address, original.state, original.city, original.zip);
            const newValueInputValidation = restaurantValidator(newValue.name, newValue.category, newValue.address, newValue.state, newValue.city, newValue.zip);

            if (originalInputValidation === true) {
                if (newValueInputValidation === true) {

                    //Verify that the Restaurants table contains the original input address.
                    existanceChecker.doesRestaurantExist(original.address, connectionPool, function(error, result) {
                        if (error) {
                            debug(`Error : ${error}`);
                            return handleError(error.message, error.error, response);
                        } else if (result.length === 0) {
                            debug(`Original address value does not exist in the database : ${result}`);
                            return handleError('Original address value does not exist in the database', result, response);
                        } else {
                            const restaurantUpdate = {
                                name: newValue.name,
                                category: newValue.category,
                                address: newValue.address
                            };
                            //Update the values in Restaurants table.
                            const dbQuery = connectionPool.query(`Update Restaurants SET ? WHERE address = '${original.address}'`, restaurantUpdate, function(e) {
                                debug('SQL Query :', dbQuery.sql);
                                if (e) {
                                    debug(`Error while updating data : ${e}`);
                                    return handleError('Error while updating data', e, response);
                                }
                                const addressesUpdate = {
                                    address: newValue.address,
                                    state: newValue.state,
                                    city: newValue.city,
                                    zip: newValue.zip
                                };
                                //Update the values in Address table.
                                const dbQuery2 = connectionPool.query(`Update Addresses SET ? WHERE address = '${original.address}'`, addressesUpdate, function(e) {
                                    debug('SQL Query :', dbQuery2.sql);
                                    if (e) {
                                        debug(`Error while updating data : ${e}`);
                                        return handleError('Error while updating data', e, response);
                                    }

                                    //Fetch the newly saved value from the database and return it
                                    let sqlQuery = `SELECT * FROM Restaurants INNER JOIN Addresses 
                                        ON Restaurants.address=Addresses.address 
                                        WHERE Restaurants.address = '${newValue.address}'`;

                                    const dbQuery3 = connectionPool.query(sqlQuery, function(error, res) {
                                        debug('SQL Query :', dbQuery3.sql);
                                        if (e) {
                                            debug(`Error while updating data : ${e}`);
                                            return handleError('Error while updating data', e, response);
                                        }

                                        debug('SUCCESS: Restaurant updated');
                                        return response.status(200).send({
                                            message: 'Restaurant successfully updated',
                                            body: res
                                        });
                                    });
                                });
                            });
                        }
                    });
                } else {
                    debug(`Error : ${newValueInputValidation}`);
                    return handleError('New Value : ' + newValueInputValidation, 'Bad Request', response);
                }
            } else {
                debug(`Error : ${originalInputValidation}`);
                return handleError('Original Value : ' + originalInputValidation, 'Bad Request', response);
            }
        });
    }
};

module.exports = restaurants;
