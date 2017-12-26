'use strict';

const express = require('express');
const _ = require('lodash');
const debug = require('debug')('users');
const userInputValidator = require('../utils/user-validator');
const handleError = require('../utils/errorHandler');
let connectionPool;

const users = {
    init: function(BaseApp, pool) {
        debug('Users route connected');
        const baseRoute = express.Router();
        BaseApp.use('/users', baseRoute);
        connectionPool = pool;
        users.getAllUsers(baseRoute);
        users.createUser(baseRoute);
        users.getUsers(baseRoute);
        users.updateUser(baseRoute);
    },

    getAllUsers: function(baseRoute) {
        baseRoute.get('/allusers', function(request, response) {
            debug('GET users/allusers');

            const dbQuery = connectionPool.query('SELECT * FROM Users', function(error, result) {
                if (error) {
                    debug('Error = ', error);
                    handleError('Failed to query database', error, response);
                }
                debug(`SUCCESS: Response Sent`);
                return response.status(200).send(result);
            });
            debug('SQL Query :', dbQuery.sql);

        });
    },

    getUsers: function(baseRoute) {
        baseRoute.get('/getUsers', function(request, response) {
            debug('GET users/getusers');

            const query = request.query.phone;
            // server side input validation. Only comma separated Numbers allowed
            if (query && /^[0-9]+(,[0-9]+)*$/.test(query)) {

                // REST : Eliminating duplicates to improve response latency
                let phoneNumbers = _.uniq(query.split(',').map(Number)).toString();

                const dbQuery = connectionPool.query(`SELECT * FROM Users WHERE phone IN ( ${ phoneNumbers} )`, function(error, result) {
                    if (error) {
                        debug('Error = ', error);
                        return handleError('Failed to query database', error, response);
                    }
                    return response.status(200).send(result);
                });
                debug('SQL Query :', dbQuery.sql);
            } else {
                debug(`Error = Check query string parameter => ${query}`);
                return handleError('Check query string parameter', 'Malformed Request', response);
            }
        });
    },

    createUser: function(baseRoute) {
        /*
        input validation
        check if the user already exists, if user does not exist
        create user
        Query the new value to confirm that it is persisted in the DB.
        Return the new value to the user
        */

        baseRoute.post('/create', function(req, res) {
            debug('POST users/create');
            const payload = req.body;
            const firstName = payload.firstName;
            const lastName = payload.lastName;
            const phone = payload.phone;

            const isValidMessage = userInputValidator(firstName, lastName, phone);

            if (isValidMessage === true) {

                const values = {
                    first_name: firstName,
                    last_name: lastName,
                    phone: phone
                };

                const dbQuery = connectionPool.query(`SELECT * FROM Users Where phone = '${phone}'`, function(error, result) {
                        debug('SQL Query :', dbQuery.sql);

                        if (error || result.length !== 0) {
                            return handleError('Phone number already in use or Error while connecting to Database', error, res);
                        }
                        // Insert
                        const dbQuery2 = connectionPool.query('INSERT INTO Users SET ?', values, function(error) {
                            debug('SQL Query :', dbQuery2.sql);

                            if (error) {
                                return handleError('Failed to store user in database', error, res);
                            }
                            let sqlQuery = `SELECT * FROM Users 
                                    WHERE first_name = '${firstName}' 
                                    AND last_name = '${lastName}' 
                                    AND phone = '${phone}'`;

                            const dbQuery = connectionPool.query(sqlQuery, function(error, result) {
                                debug('SQL Query :', dbQuery.sql);
                                if (error) {
                                    return handleError('Failed to store user in database', error, res);

                                } else {
                                    const responsePayload = {
                                        message: 'SUCCESS',
                                        value: result
                                    };
                                    debug(`SUCCESS: User Created`);
                                    return res.status(200).send(responsePayload);
                                }
                            });
                        });
                    }
                );
            } else {
                debug(`Failed to verify input. Error = ${isValidMessage}`);
                handleError(`Failed to verify input`, isValidMessage, res);
            }
        });
    },

    updateUser: function(baseRoute) {
        /*
        input validation
        Check if Original is present in DB
        Update the Original Value with the new value
        Query the new value to confirm that it is persisted in the DB.
        Return the new value to the user
        */

        baseRoute.post('/update', function(request, response) {
            debug('POST users/update');

            const payload = request.body;
            const originalValue = payload.originalValue;
            const newValue = payload.newValue;

            //Input Validation
            if ((originalValue.firstName && originalValue.lastName && originalValue.phone) &&
                (newValue.firstName && newValue.lastName && newValue.phone)) {

                const isOriginalValid = userInputValidator(originalValue.firstName, originalValue.lastName, originalValue.phone);
                const isNewValueValid = userInputValidator(newValue.firstName, newValue.lastName, newValue.phone);

                if (isOriginalValid === true) {
                    if (isNewValueValid === true) {
                        // Check if Original is present in DB
                        // Update the Original Value with the new value
                        // Query the new value to confirm that it is persisted in the DB.
                        // Return the new value to the user

                        let sqlQuery = `SELECT * FROM Users 
                            WHERE first_name = '${originalValue.firstName}' 
                            AND last_name = '${originalValue.lastName}' 
                            AND phone = '${originalValue.phone}'`;

                        const dbQuery = connectionPool.query(sqlQuery, function(error, result) {
                            debug('SQL Query :', dbQuery.sql);
                            if (error || result.length === 0) {
                                return handleError('Original User value Not Found', error, response);
                            }
                            // Update the Original Value with the new value
                            const params = {
                                first_name: newValue.firstName,
                                last_name: newValue.lastName,
                                phone: newValue.phone
                            };

                            let sqlQuery = `UPDATE Users 
                                SET ? 
                                WHERE phone = '${originalValue.phone}'`;

                            const dbQuery2 = connectionPool.query(sqlQuery, params, function(error) {
                                debug('SQL Query :', dbQuery2.sql);
                                if (error) {

                                    return handleError('Error while updating value', error, response);
                                }
                                // Query the new value to confirm that it is persisted in the DB.
                                connectionPool.query(`SELECT * FROM Users WHERE first_name = '${newValue.firstName}' and last_name = '${newValue.lastName}' and phone = '${newValue.phone}'`, function(error, result) {
                                    if (error || result.length === 0) {
                                        return handleError('Cannot fetch Updated Value', error, response);
                                    }
                                    // Return the new value to the user
                                    debug(`SUCCESS: User Updated`);
                                    return response.status(200).send(result);
                                });
                            });
                        });
                    } else {
                        debug(`Bad Request : ${ isNewValueValid}`);
                        return handleError(`New Value : ${isNewValueValid}`, 'Bad Request', response);
                    }
                } else {
                    debug(`Bad Request : ${ isOriginalValid}`);
                    return handleError(`Original Value : ${isOriginalValid}`, 'Bad Request', response);
                }
            } else {
                debug('Bad Request');
                return handleError('Bad Request', 'Bad Request', response);
            }
        });
    }
};

module.exports = users;
