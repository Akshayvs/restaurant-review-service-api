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
            response.send('service is running');
        });
    }
};
module.exports = serviceStatus;
