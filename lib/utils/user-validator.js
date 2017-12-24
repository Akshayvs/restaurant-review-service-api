'use strict';

const userValidator = function (firstName, lastName, phone) {
    if (typeof firstName === 'string' && typeof lastName === 'string' && typeof phone === 'number') {
        if (firstName.length < 20 && lastName.length < 20 && phone.toString().length === 10) {
            return true;
        }
        else return 'FirstName and LastName should not exceed 20 letters and Phone should be exactly 10 digits';
    }
    else return 'Invalid Input Type';
};

module.exports = userValidator;