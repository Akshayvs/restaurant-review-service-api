'use strict';

const express = require('express');
const _ = require('lodash');

const ratingValidator = require('../utils/rating-validator');
const handleError = require('../utils/errorHandler');
const existanceChecker = require('../utils/existance-checker');
const validator = require('validator');

let connectionPool;

const rating = {
    init: function(BaseApp, pool) {
        const baseRoute = express.Router();
        BaseApp.use('/rating', baseRoute);
        connectionPool = pool;
        rating.postRating(baseRoute);
        rating.getRatingsByUser(baseRoute);
        rating.getRatingByRestaurant(baseRoute);
    },

    postRating: function(baseRoute) {
        //STEPS:
        //Input validation
        //Validate the reviewer by checking if the user exists in the Users table
        //Validate the restaurant by checking if the restaurant exist in Restaurants table
        //validate if the user has not reviewed this restaurant address before
        //Check if the last review date of restaurant is more than a month old.

        baseRoute.post('/submitRating', function(request, response) {
            const userPhone = request.body.userPhone;
            const restaurantName = request.body.restaurantName;
            const address = request.body.address;
            const cost = request.body.cost;
            const food = request.body.food;
            const cleanliness = request.body.cleanliness;
            const service = request.body.service;
            const comment = request.body.comment;

            const ratingValidity = ratingValidator(userPhone, restaurantName, address, cost, food, cleanliness, service, comment);

            if (ratingValidity === true) {
                console.log('Reaching TRUE');

                connectionPool.getConnection(function(error, connection) {
                    if (error) return handleError('cannot connect to database', error, response);

                    //Validate the reviewer by checking if the user exists in the Users table
                    existanceChecker.doesUserExists(userPhone, connection, function(error, result) {
                        if (error) {
                            return handleError('Error getting User details', error, response);
                        } else if (result.length === 0) {
                            return handleError('User Does Not Exist', '500', response);
                        } else {
                            //Validate the restaurant by checking if the restaurant exist in Restaurants table
                            existanceChecker.doesRestaurantExist(address, connection, function(error, result) {
                                if (error) {
                                    return handleError('Error getting Restaurant details', error, response);
                                } else if (result.length === 0) {
                                    return handleError('Restaurant Does Not Exist', '500', response);
                                } else {
                                    //validate if the user has not reviewed this restaurant address before
                                    connection.query(`SELECT * FROM Rating WHERE address = '${address}' AND userphone = '${userPhone}'`, function(err, res) {
                                        if (err) {
                                            return handleError('Error getting Ratings details', err, response);
                                        } else if (res.length !== 0) {
                                            response.status(200).send(`User has previously rated this restaurant location`);
                                        } else {

                                        }
                                        console.log(' QUERY = ', query.sql);
                                        console.log(' error = ', err);
                                        console.log(' res = ', res);

                                    });

                                }
                            });
                        }
                    });
                });
            } else {
                return handleError(ratingValidity, '404', response);
            }
        });
    },

    getRatingsByUser: function(baseRoute) {
        // retreive user ratings by any permutation and combination of firstname, lastname and phone.

        baseRoute.get('/byuser', function(request, response) {
            const query = request.query;
            const queryArray = [];

            if (query.firstname || query.lastname || query.phone) {
                if (query.firstname) {
                    if (!validator.isAlpha(query.firstname, 'en-US')) {
                        return handleError('firstname must include letters only', '404', response);
                    }
                    queryArray.push(`Users.first_name= '${query.firstname}'`);
                }

                if (query.lastname) {
                    if (!validator.isAlpha(query.lastname, 'en-US')) {
                        return handleError('lastname must include letters only', '404', response);
                    }
                    queryArray.push(`Users.last_name= '${query.lastname}'`);
                }

                if (query.phone) {
                    if (!validator.isMobilePhone(query.phone, 'en-US')) {
                        return handleError('Invalid Phone number provided', '404', response);
                    }
                    queryArray.push(`Users.phone= '${query.phone}'`);
                }

                let args = queryArray.toString().replace(',', ' AND ').replace(',', ' AND ');

                connectionPool.getConnection(function(e, connection) {

                    let sqlQuery = `SELECT * FROM Rating INNER JOIN Users ON Rating.userphone=Users.phone INNER JOIN Restaurants ON Rating.address=Restaurants.address WHERE ${args}`;
                    connection.query(sqlQuery, function(error, result) {
                        if (error) return handleError(' error while querying data', error, response);
                        return response.send(result);
                    });
                });
            } else {
                return handleError('Missing query string parameters', '404', response);
            }
        });
    },

    getRatingByRestaurant: function(baseRoute) {
        baseRoute.get('/byrestaurant', function(request, response) {

            const restaurant = request.query.name;

            if (restaurant && /^[a-zA-Z]*$/.test(restaurant)) {

                connectionPool.getConnection(function(error, connection) {
                    if (error) return handleError('cannot connect to database', error, response);
                    const sqlQuery = `SELECT * from Rating INNER JOIN Restaurants ON Rating.address = Restaurants.address WHERE Restaurants.name = '${restaurant}'`;

                    connection.query(sqlQuery, function(err, result) {

                        let sum = 0;
                        result.forEach(function(value) {
                            sum = sum + value.total_score;
                        });

                        result.push({
                            TOTAL_AVERAGE_RATING: sum / result.length
                        });
                        response.send(result);
                    });
                });
            } else {
                return handleError(`Missing or Invalid query string parameter 'name'. Only Alphabets are allowed`, '404', response);
            }
        });
    }
};

module.exports = rating;
