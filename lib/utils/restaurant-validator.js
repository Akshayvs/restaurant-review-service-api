'use strict';

const validator = require('validator');

const restaurantValidator = function(name, category, address, state, city, zip) {

    if (typeof name === 'string' && typeof category === 'string' && typeof address === 'string' &&
        typeof state === 'string' && typeof city === 'string' && typeof zip === 'number') {

        if (!(name.length < 20 && validator.isAlpha(name, 'en-US'))) {
            return 'Name must be less than 20 characters and only alphabets are acceptable';
        }
        if (!(category.length < 20 && validator.isAlpha(category, 'en-US'))) {
            return 'Category must be less than 20 characters and only alphabets are acceptable';
        }

        if (!(address.length < 30)) {
            return 'Address must be less than 35 characters.';
        }

        if (!(state.length < 20 && validator.isAlpha(state, 'en-US'))) {
            return 'State must be less than 20 characters and only alphabets are acceptable';
        }
        if (!(city.length < 20 && validator.isAlpha(city, 'en-US'))) {
            return 'City must be less than 20 characters and only alphabets are acceptable';
        }
        if (!(validator.isPostalCode(zip.toString(), 'US'))) {
            return 'Invalid Zip. Zip must be exactly 5 numbers';
        }
        return true;
    }
    return 'Invalid Input Type';
};

module.exports = restaurantValidator;
