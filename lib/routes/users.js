'use strict';

const express = require('express');
const _ = require('lodash');
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
                            return users.sendError(error, ' Error While Reading from Users Database', response);
                        }
                        connection.release();
                        return response.status(200).send(result);
                    });
                });
            } else {
                return users.sendError('Malformed Request', "Check query string parameter", response);
            }
        });
    },

    createUser: function (baseRoute) {
        baseRoute.post('/create', function (req, res) {
            const payload = req.body;
            const firstName = payload.firstName;
            const lastName = payload.lastName;
            const phone = payload.phone;

            if ((firstName && lastName && phone ) &&
                (typeof firstName === 'string' && typeof lastName === 'string' && typeof phone === 'number')) {

                if (firstName.length < 20 && lastName.length < 20 && phone.toString().length === 10) {

                    connectionPool.getConnection(function (error, connection) {
                        const values = {
                            first_name: firstName,
                            last_name: lastName,
                            phone: phone
                        };
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
                } else {
                    res.status(400).send("Check Input Type");
                }
            } else {
                res.status(400).send("Bad Request");
            }
        });
    },

    updateUser: function (baseRoute) {
        baseRoute.post()

    },

    sendError(error, message, res) {
        return res.status(404).send({
            message: message,
            error: error
        });
    }
};
module.exports = users;