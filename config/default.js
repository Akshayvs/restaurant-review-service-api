'use strict';

// This is the configuration file. As a good security practice, any configuration values should NOT be checked out on GIT.
// We are passing the datbase config values as Environment variables while running the app.
// If an environment variable is missing, it will default to the below values.

module.exports = {
    mySqlConfig: {
        host: process.env.HOST || 'localhost',
        user: process.env.USER || 'ak93',
        password: process.env.PASS || 'ak93',
        database: 'restaurant-rating-system'
    }
};

// if you are having trouble running the app by passing the environment variables,
// Comment out the above code, uncomment the below code and update the config based on your database login credentials

// module.exports = {
//     mySqlConfig: {
//         host: 'localhost',
//         user: 'ak93',
//         password: 'ak93',
//         database: 'restaurant-rating-system'
//     }
// };