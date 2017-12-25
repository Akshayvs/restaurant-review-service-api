'use strict';

const existanceChecker = {

    doesUserExists(phone, connection, callback) {
        connection.query(`SELECT * FROM Users WHERE phone = '${phone}'`, function(error, result) {
            if (error) {
                const errorResponse = {
                    message: 'Error in connection to database',
                    error: error
                };
                callback(errorResponse, null);
            } else {
                callback(null, result);
            }
        });
    },

    doesRestaurantExist(address, connection, callback) {

        connection.query(`SELECT * from Restaurants WHERE address = '${address}'`, function(error, result) {
            if (error) {
                const errorResponse = {
                    message: 'Error in connection to database',
                    error: error
                };
                callback(errorResponse, null);
            } else {
                callback(null, result);
            }
        });
    }
};

module.exports = existanceChecker;
