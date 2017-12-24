'use strict';

const express = require('express');
const _ = require('lodash');

const handleError = require('../utils/errorHandler');
let connectionPool;

const rating = {
    init: function(BaseApp, pool) {
        const baseRoute = express.Router();
        BaseApp.use('/rating', baseRoute);
        connectionPool = pool;
        rating.postRating(baseRoute);
    },

    postRating: function(baseRoute) {
        baseRoute.post('/submitRating', function(request, response) {

            response.send(200);
        });
    }
};

module.exports = rating;
