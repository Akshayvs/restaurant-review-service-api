'use strict';

const errorHandler = function(message, error, res) {
    return res.status(400).send({
        message: message,
        error: error
    });
};

module.exports = errorHandler;
