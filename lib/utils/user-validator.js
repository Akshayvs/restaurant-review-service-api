'use strict';

const validator = require('validator');

const userValidator = function (firstName, lastName, phone) {
    if (typeof firstName === 'string' && typeof lastName === 'string' && typeof phone === 'number') {
        if (!(firstName.length < 20 && validator.isAlpha(firstName, 'en-US'))) {
            return 'First name must be less than 20 characters and only alphabets are acceptable';
        }
        if (!(lastName.length < 20 && validator.isAlpha(lastName, 'en-US'))) {
            return 'Last name must be less than 20 characters and only alphabets are acceptable';
        }
        if (!(phone.toString().length === 10 && validator.isMobilePhone(phone.toString(), 'en-US'))) {
            return 'Phone number should be exactly 10 characters and only numbers are acceptable';
        }
        return true;
    }
    return 'Invalid Input Type';
};

module.exports = userValidator;