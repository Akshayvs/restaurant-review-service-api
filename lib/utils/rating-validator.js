'use strict';

const validator = require('validator');

const ratingValidator = function (userPhone, restaurantName, address, cost, food, cleanliness, service, comment) {

    if (typeof userPhone === 'number' && typeof restaurantName === 'string' && typeof restaurantName === 'string' && typeof address === 'string' &&
        typeof cost === 'number' && typeof food === 'number' && typeof cleanliness === 'number' && typeof service === 'number' && (typeof  comment === 'string' || typeof  comment === 'undefined')) {

        if (!(validator.isMobilePhone(userPhone.toString(), 'en-US'))) {
            return 'Phone number should be exactly 10 characters and only numbers are acceptable';
        }
        if (!(restaurantName.length < 20 && validator.isAlpha(restaurantName, 'en-US'))) {
            return 'Restaurant name must be less than 20 characters and only alphabets are acceptable';
        }
        if (!(address.length < 30)) {
            return 'Address must be less than 35 characters.';
        }
        if (!/^[1-5]$/.test(cost)) {
            return 'Cost Rating must be in the range of 1 to 5'
        }
        if (!/^[1-5]$/.test(food)) {
            return 'Food Rating must be in the range of 1 to 5'
        }
        if (!/^[1-5]$/.test(cleanliness)) {
            return 'Cleanliness rating must be in the range of 1 to 5'
        }
        if (!/^[1-5]$/.test(service)) {
            return 'Service rating be in the range of 1 to 5'
        }

        const averageTotalRating = (cost + food + cleanliness + service) / 4;

        if (averageTotalRating === 1 && !comment) {
            return ' The average rating is One. Please also provide a comment'
        }

        return true;
    }
    return 'Invalid Input Type';
};

module.exports = ratingValidator;