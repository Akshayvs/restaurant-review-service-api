'use strict';

const express = require('express');
const _ = require('lodash');
const userInputValidator = require('../user-validator');
let connectionPool;

const users = {
    init: function (BaseApp, pool) {
        const baseRoute = express.Router();
        BaseApp.use('/users', baseRoute);
        connectionPool = pool;
        users.getAllUsers(baseRoute);
        users.createUser(baseRoute);
        users.getUsers(baseRoute);
        users.updateUser(baseRoute);
    },

    getAllUsers: function (baseRoute) {
        baseRoute.get('/allusers', function (request, response, next) {
            connectionPool.getConnection(function (error, connection) {
                connection.query("SELECT * FROM Users", function (error, result) {
                    response.status(200).send(result);
                    connection.release();
                });
            });
        });
    },

    getUsers: function (baseRoute) {
        baseRoute.get('/getUsers', function (request, response, next) {
            const query = request.query.phone;

            // server side input validation. Only comma separated Numbers allowed
            if (query && /^[0-9]+(,[0-9]+)*$/.test(query)) {

                // REST : Eliminating duplicates to improve response latency
                let phoneNumbers = _.uniq(query.split(',').map(Number)).toString();

                connectionPool.getConnection(function (error, connection) {
                    connection.query(`SELECT * FROM Users WHERE phone IN ( ${ phoneNumbers} )`, function (error, result) {
                        if (error) {
                            connection.release();
                            return users.sendError(' Error While Reading from Users Database', error, response);
                        }
                        connection.release();
                        return response.status(200).send(result);
                    });
                });
            } else {
                return users.sendError("Check query string parameter", 'Malformed Request', response);
            }
        });
    },

    /*
    input validation
    check if the user already exists
    create user
    Query the new value to confirm that it is persisted in the DB.
    Return the new value to the user
    */
    createUser: function (baseRoute) {
        baseRoute.post('/create', function (req, res) {
            const payload = req.body;
            const firstName = payload.firstName;
            const lastName = payload.lastName;
            const phone = payload.phone;

            if (firstName && lastName && phone) {
                const isValidMessage = userInputValidator(firstName, lastName, phone);

                if (isValidMessage === true) {
                    connectionPool.getConnection(function (error, connection) {
                        const values = {
                            first_name: firstName,
                            last_name: lastName,
                            phone: phone
                        };
                        connection.query(`Select * FROM Users Where phone = '${phone}'`, values, function (error, result) {
                            if (error || result.length !== 0) {
                                connection.release();
                                return users.sendError(error, 'Phone number already in use or Error while connecting to Database', res);
                            }
                            // Insert
                            connection.query("INSERT into Users SET ?", values, function (error, result) {
                                if (error) {
                                    connection.release();
                                    return users.sendError(error, 'Failed to store user in database', res);
                                }
                                connection.query(`SELECT * FROM Users WHERE first_name = '${firstName}' and last_name = '${lastName}' and phone = '${phone}'`, function (error, result) {
                                    if (error) {
                                        connection.release();
                                        return users.sendError(error, 'Failed to store user in database', res);

                                    } else {
                                        const responsePayload = {
                                            message: 'SUCCESS',
                                            value: result
                                        };
                                        connection.release();
                                        return res.status(200).send(responsePayload);
                                    }
                                })
                            });
                        });
                    });
                } else {
                    users.sendError(isValidMessage, '404', res);
                }
            } else {
                return users.sendError('Bad Request', '404', res);
            }
        });
    },

    updateUser: function (baseRoute) {
        baseRoute.post('/update', function (request, response) {
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
                        xw
                        connectionPool.getConnection(function (error, connection) {
                            // Check if Original is present in DB
                            connection.query(`SELECT * FROM Users WHERE first_name = '${originalValue.firstName}' and last_name = '${originalValue.lastName}' and phone = '${originalValue.phone}'`, function (error, result) {
                                console.log("RESULT = ", result);
                                if (error || result.length === 0) {
                                    connection.release();
                                    return users.sendError(error, 'Original User value Not Found', response);
                                }
                                // Update the Original Value with the new value
                                const params = {
                                    first_name: newValue.firstName,
                                    last_name: newValue.lastName,
                                    phone: newValue.phone
                                };
                                connection.query(`UPDATE Users SET ? WHERE phone = '${originalValue.phone}'`, params, function (error) {
                                    if (error) {
                                        connection.release();
                                        return users.sendError(error, 'Error while updating value', response);
                                    }
                                    // Query the new value to confirm that it is persisted in the DB.
                                    connection.query(`SELECT * FROM Users WHERE first_name = '${newValue.firstName}' and last_name = '${newValue.lastName}' and phone = '${newValue.phone}'`, function (error, result) {
                                        if (error || result.length === 0) {
                                            connection.release();
                                            return users.sendError(error, 'Cannot fetch Updated Value', response);
                                        }
                                        // Return the new value to the user
                                        return response.status(200).send(result);
                                    });
                                });
                            });
                        });
                    } else {
                        return users.sendError(`New Value : ${isNewValueValid}`, '404', response);
                    }
                } else {
                    return users.sendError(`Original Value : ${isOriginalValid}`, '404', response);
                }
            } else {
                return users.sendError('Bad Request', '404', res);
            }
        });
    },

    sendError(message, error, res) {
        return res.status(404).send({
            message: message,
            error: error
        });
    }
};
module.exports = users;