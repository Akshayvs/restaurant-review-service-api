'use strict';

const express = require('express');
let connectionPool;


const users = {
    init: function (BaseApp, pool) {
        const baseRoute = express.Router();
        BaseApp.use('/users', baseRoute);
        connectionPool = pool;
        users.getUsers(baseRoute);
        users.createUser(baseRoute);
    },

    getUsers: function (baseRoute) {
        baseRoute.get('/getusers', function (request, response, next) {
            connectionPool.getConnection(function (error, connection) {
                connection.query("SELECT * FROM Users", function (error, result) {
                    response.status(200).send(result);
                    connection.release();
                });
            });
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
                            if (error){
                                connection.release();
                                return users.sendError(error, res);
                            }
                            connection.query(`SELECT * FROM Users WHERE first_name = '${firstName}' and last_name = '${lastName}' and phone = '${phone}'`, function (error, result) {
                                if (error) {
                                    connection.release();
                                    return users.sendError(error, res);

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

    sendError( error, res){
        return res.status(404).send({
            message: " failed to store user in database",
            error: error
        });
    }

};
module.exports = users;