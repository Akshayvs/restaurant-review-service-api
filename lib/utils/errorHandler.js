'use strict';

const errorHandler = function (message, error, res) {
    return res.status(404).send({
        message: message,
        error: error
    });
};

module.exports = errorHandler;