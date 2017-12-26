'use strict';

const express = require('express');
const _ = require('lodash');
const validator = require('validator');
const moment = require('moment');

const ratingValidator = require('../utils/rating-validator');
const handleError = require('../utils/errorHandler');
const existanceChecker = require('../utils/existance-checker');

let connectionPool;

const rating = {
    init: function(BaseApp, pool) {
        const baseRoute = express.Router();
        BaseApp.use('/rating', baseRoute);
        connectionPool = pool;
        rating.postRating(baseRoute);
        rating.getRatingsByUser(baseRoute);
        rating.getRatingByRestaurant(baseRoute);
        rating.updateRating(baseRoute);
    },

    postRating: function(baseRoute) {
        //STEPS:
        //1. Input validation
        //2. Validate the reviewer by checking if the user exists in the Users table
        //3. Validate the restaurant by checking if the restaurant exist in Restaurants table
        //4. validate if the user has not reviewed this restaurant address before
        //5. Check if the last review date of restaurant is more than a month old.
        //6.  INSERT Into Ratings.

        baseRoute.post('/submitRating', function(REQUEST, RESPONSE) {
            const userPhone = REQUEST.body.userPhone;
            const restaurantName = REQUEST.body.restaurantName;
            const address = REQUEST.body.address;
            const cost = REQUEST.body.cost;
            const food = REQUEST.body.food;
            const cleanliness = REQUEST.body.cleanliness;
            const service = REQUEST.body.service;
            const comment = REQUEST.body.comment;

            const ratingValidity = ratingValidator(userPhone, restaurantName, address, cost, food, cleanliness, service, comment);

            if (ratingValidity === true) {

                connectionPool.getConnection(function(error, connection) {
                    if (error) return handleError('cannot connect to database', error, RESPONSE);

                    return rating._ratingConstraintsValidator(userPhone, address, restaurantName, connection, RESPONSE, function() {
                        const payload = {
                            cost: cost,
                            food: food,
                            cleanliness: cleanliness,
                            service: service,
                            total_score: (cost + food + cleanliness + service) / 4,
                            address: address,
                            userphone: userPhone
                        };
                        const sql = `INSERT INTO Rating SET ?`;
                        connection.query(sql, payload, function(err, result) {
                            if (err) {
                                return handleError('Error getting Ratings details', err, RESPONSE);
                            }
                            RESPONSE.send({
                                message: 'Rating successfully added',
                                response: result
                            });
                        });
                    });
                });
            } else {
                return handleError(ratingValidity, '404', RESPONSE);
            }
        });
    },

    updateRating: function(baseRoute) {
        // validate originalRating payload
        // validate updateRating payload
        // Query database to check if original rating exists. if it does not, return appropriate error
        // Update the the rating, send back the response.

        baseRoute.post('/updateRating', function(REQUEST, RESPONSE) {
            const payload = REQUEST.body;
            const original = payload.originalRating;
            const update = payload.updateRating;
            if (!(original && update)) {
                return handleError(' Bad Request', 404, RESPONSE);
            }

            const originalRatingInputValidator = ratingValidator(original.userPhone, original.restaurantName, original.address, original.cost, original.food, original.cleanliness, original.service, original.comment);
            const newRatingInputValidatoe = ratingValidator(9999999999, 'Default', 'Default', update.cost, update.food, update.cleanliness, update.service, update.comment);

            if (originalRatingInputValidator != true) {
                return handleError(' Failed to verify Original Payload', originalRatingInputValidator, RESPONSE);
            }
            if (newRatingInputValidatoe != true) {
                return handleError(' Failed to verify Update Payload', newRatingInputValidatoe, RESPONSE);
            }

            connectionPool.getConnection(function(error, connection) {
                if (error) return handleError('Cannot connect to Database', error, RESPONSE);

                let sqlQuery = `SELECT * from Rating
                                WHERE userphone = '${original.userPhone}' AND
                                address = '${original.address}' AND
                                cost = '${original.cost}' AND
                                food = '${original.food}' AND
                                cleanliness = '${original.cleanliness}' AND
                                service = '${original.service}'`;

                connection.query(sqlQuery, function(error, result) {
                    if (error) return handleError('Error in verifying original rating', error, RESPONSE);

                    if (result.length > 0) {
                        let updateRating = {
                            cost: update.cost,
                            food: update.food,
                            cleanliness: update.cleanliness,
                            service: update.service,
                            total_score: (update.cost + update.food + update.cleanliness + update.service) / 4
                        };

                        let sqlQuery = `UPDATE Rating 
                                SET ?
                                WHERE userphone = '${original.userPhone}' AND
                                address = '${original.address}' AND
                                cost = '${original.cost}' AND
                                food = '${original.food}' AND
                                cleanliness = '${original.cleanliness}' AND
                                service = '${original.service}'`;

                        connection.query(sqlQuery, updateRating, function(error, result) {
                            if (error) return handleError('Error while updating rating rating', error, RESPONSE);

                            return RESPONSE.send({
                                message: ' Update Successful',
                                result: result
                            });
                        });
                    } else {
                        return handleError('Original Rating does not exist in the database', result, RESPONSE);
                    }
                });
            });
        });
    },

    getRatingsByUser: function(baseRoute) {
        // retreive user ratings by any permutation and combination of firstname, lastname and phone.

        baseRoute.get('/byuser', function(REQUEST, RESPONSE) {
            const query = REQUEST.query;
            const queryArray = [];

            if (query.firstname || query.lastname || query.phone) {
                if (query.firstname) {
                    if (!validator.isAlpha(query.firstname, 'en-US')) {
                        return handleError('firstname must include letters only', '404', RESPONSE);
                    }
                    queryArray.push(`Users.first_name= '${query.firstname}'`);
                }

                if (query.lastname) {
                    if (!validator.isAlpha(query.lastname, 'en-US')) {
                        return handleError('lastname must include letters only', '404', RESPONSE);
                    }
                    queryArray.push(`Users.last_name= '${query.lastname}'`);
                }

                if (query.phone) {
                    if (!validator.isMobilePhone(query.phone, 'en-US')) {
                        return handleError('Invalid Phone number provided', '404', RESPONSE);
                    }
                    queryArray.push(`Users.phone= '${query.phone}'`);
                }

                let args = queryArray.toString().replace(',', ' AND ').replace(',', ' AND ');

                connectionPool.getConnection(function(e, connection) {

                    let sqlQuery = `SELECT * FROM Rating INNER JOIN Users 
                    ON Rating.userphone=Users.phone INNER JOIN Restaurants 
                    ON Rating.address=Restaurants.address 
                    WHERE ${args}`;

                    connection.query(sqlQuery, function(error, result) {
                        if (error) return handleError(' error while querying data', error, RESPONSE);
                        return RESPONSE.send(result);
                    });
                });
            } else {
                return handleError('Missing query string parameters', '404', RESPONSE);
            }
        });
    },

    getRatingByRestaurant: function(baseRoute) {
        baseRoute.get('/byrestaurant', function(REQUEST, RESPONSE) {

            const restaurant = REQUEST.query.name;

            if (restaurant && /^[a-zA-Z]*$/.test(restaurant)) {

                connectionPool.getConnection(function(error, connection) {
                    if (error) return handleError('cannot connect to database', error, RESPONSE);

                    const sqlQuery = `SELECT * from Rating INNER JOIN Restaurants 
                    ON Rating.address = Restaurants.address 
                    WHERE Restaurants.name = '${restaurant}'`;

                    connection.query(sqlQuery, function(err, result) {

                        let sum = 0;
                        result.forEach(function(value) {
                            sum = sum + value.total_score;
                        });

                        result.push({
                            TOTAL_AVERAGE_RATING: sum / result.length
                        });
                        RESPONSE.send(result);
                    });
                });
            } else {
                return handleError(`Missing or Invalid query string parameter 'name'. Only Alphabets are allowed`, '404', RESPONSE);
            }
        });
    },

    _ratingConstraintsValidator: function(userPhone, address, restaurantName, connection, RESPONSE, callback) {

        existanceChecker.doesUserExists(userPhone, connection, function(error, result) {
            if (error) {
                return handleError('Error getting User details', error, RESPONSE);
            } else if (result.length === 0) {
                return handleError('User Does Not Exist', '500', RESPONSE);
            } else {
                existanceChecker.doesRestaurantExist(address, connection, function(error, result) {
                    if (error) {
                        return handleError('Error getting Restaurant details', error, RESPONSE);
                    } else if (result.length === 0) {
                        return handleError('Restaurant Does Not Exist', '500', RESPONSE);
                    } else {
                        //validate if the user has not reviewed this restaurant address before
                        connection.query(`SELECT * FROM Rating WHERE address = '${address}' AND userphone = '${userPhone}'`, function(err, result) {
                            if (err) {
                                return handleError('Error getting Ratings details', err, RESPONSE);
                            } else if (result.length !== 0) {
                                handleError(`User has previously rated this restaurant location`, result, RESPONSE);
                            } else {

                                const OneMonthFromNow = moment().subtract(1, 'months').format('YYYY-MM-DD');
                                // check if a review was posted by the current user for the restaurant for any location in the last one month

                                const sql = `SELECT * FROM Rating INNER JOIN Restaurants 
                                            ON Rating.address = Restaurants.address 
                                            WHERE Restaurants.name = '${restaurantName}' AND 
                                            Rating.userphone= '${userPhone}' and Rating.date >'${OneMonthFromNow}'`;

                                connection.query(sql, function(err, results) {
                                    if (error) return handleError('cannot connect to database', error, RESPONSE);
                                    if (results.length !== 0) return handleError(`A review was submitted by this user in the last One month for Restaurant : ${restaurantName}`, results, RESPONSE);

                                    else {
                                        callback();
                                    }
                                });
                            }
                        });
                    }
                });
            }
        });
    }
};

module.exports = rating;
