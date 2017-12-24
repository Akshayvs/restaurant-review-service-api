'use strict'

const express = require('express');
const http = require('http');
const mysql = require('mysql');
const bodyParser = require('body-parser');
const sqlConfig = require('./config/default').mySqlConfig;
const serviceStatus = require('./lib/routes/service-status');
const users = require('./lib/routes/users');
const restaurants = require('./lib/routes/restaurants');
const ratings = require('./lib/routes/rating');

var pool = mysql.createPool(sqlConfig);

pool.getConnection(function(error, connection) {
    if (error) {
        console.log('Cannot Connect to Database. Error : ', JSON.stringify(error, null, 2));
        process.exit();

    } else {
        console.log('SUCCESS: Connected to Database as ProcessId ' + connection.threadId);
        connection.release();

        initializeService();
    }
});

function initializeService() {
    // Initializing a REST API
    const app = express();
    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({extended: true}));

    //Attaching routes to the API
    serviceStatus.init(app);
    users.init(app, pool);
    restaurants.init(app, pool);
    ratings.init(app, pool);

    const portNumber = 3000;
    app.set('port', portNumber);
    const server = http.createServer(app);

    server.listen(portNumber, function() {
        console.log('Restaurant-Review-API started. Listening on port ' + portNumber);
        console.log(`Test check : http://localhost:${portNumber}/service/service-status`);
    });
}
