'use strict';

const express = require('express');

const serviceStatus = {
    init: function(BaseApp) {
        const baseRoute = express.Router();
        BaseApp.use('/service', baseRoute);
        serviceStatus.status(baseRoute);
    },
    status: function(baseRoute) {
        baseRoute.get('/service-status', function(request, response, next) {
            const responsePayload = {
                message: 'service is running on localhost:3000. Please go to the following url for more instructions',
                URL: 'https://github.com/Akshayvs/restaurant-review-service-api'

            };
            response.send(responsePayload);
        });
    }
};
module.exports = serviceStatus;
