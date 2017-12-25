'use strict';

const mockery = require('mockery');
const expect = require('chai').expect;
const sinon = require('sinon');

describe('utils/user-validator', function() {
    let userValidator;
    let validatorMock;

    beforeEach(function() {
        mockery.enable({useCleanCache: true});
        mockery.registerAllowable('../../lib/utils/user-validator');

        validatorMock = {
            isAlpha: sinon.stub().returns(true),
            isMobilePhone: sinon.stub().returns(true)
        };

        mockery.registerMock('validator', validatorMock);
        userValidator = require('../../lib/utils/user-validator');
    });

    afterEach(function() {
        mockery.deregisterAll();
        mockery.disable();
    });

    it('should return `Invalid Input Type` if firstName is not a string', function() {
        const firstName = undefined;
        const lastname = 'Lastname';
        const phone = 12344432;

        const message = userValidator(firstName, lastname, phone);

        expect(message).to.eql('Invalid Input Type');
    });

    it('should return `Invalid Input Type` if lastname is not a string', function() {
        const firstName = 'firstname';
        const lastname = undefined;
        const phone = 12344432;

        const message = userValidator(firstName, lastname, phone);

        expect(message).to.eql('Invalid Input Type');
    });

    it('should return `Invalid Input Type` if phone is not a a number', function() {
        const firstName = 'firstName';
        const lastname = 'Lastname';
        const phone = 'phone';

        const message = userValidator(firstName, lastname, phone);

        expect(message).to.eql('Invalid Input Type');
    });

    it('should call validator.isAlpha exactly two times', function() {
        const firstName = 'firstName';
        const lastname = 'Lastname';
        const phone = 12345;

        userValidator(firstName, lastname, phone);

        expect(validatorMock.isAlpha.callCount).to.eql(2);
    });

    it('should call validator.isAlpha with the correct parameters', function() {
        const firstName = 'firstName';
        const lastname = 'Lastname';
        const phone = 12345;

        userValidator(firstName, lastname, phone);

        expect(validatorMock.isAlpha.args).to.eql([
            [firstName, 'en-US'],
            [lastname, 'en-US']
        ]);
    });

    it('should return `true` if all the checks pass', function() {
        const firstName = 'firstName';
        const lastname = 'Lastname';
        const phone = 1234567890;

        const message = userValidator(firstName, lastname, phone);

        expect(message).to.eql(true);
    });

    it('should return expected error message if firstName length check fails', function() {
        const firstName = 'asnasdasdsadasdasdasasdasdas';
        const lastname = 'Lastname';
        const phone = 1234567890;

        const message = userValidator(firstName, lastname, phone);

        expect(message).to.eql('First name must be less than 20 characters and only alphabets are acceptable');
    });

    it('should return expected error message if firstName check is failed by validator', function() {
        const firstName = 'FirstName';
        const lastname = 'Lastname';
        const phone = 1234567890;
        validatorMock.isAlpha.returns(false);

        const message = userValidator(firstName, lastname, phone);

        expect(message).to.eql('First name must be less than 20 characters and only alphabets are acceptable');
    });

    it('should return expected error message if lastname length check fails', function() {
        const firstName = 'first';
        const lastname = 'asnasdasdsadasdasdasasdasdas';
        const phone = 1234567890;

        const message = userValidator(firstName, lastname, phone);

        expect(message).to.eql('Last name must be less than 20 characters and only alphabets are acceptable');
    });

    it('should return expected error message if lastname check is failed by validator', function() {
        const firstName = 'FirstName';
        const lastname = 'Lastname';
        const phone = 1234567890;
        validatorMock.isAlpha.onCall(1).returns(false);

        const message = userValidator(firstName, lastname, phone);

        expect(message).to.eql('Last name must be less than 20 characters and only alphabets are acceptable');
    });

    it('should return expected error message if phone length check fails', function() {
        const firstName = 'first';
        const lastname = 'last';
        const phone = 123;

        const message = userValidator(firstName, lastname, phone);

        expect(message).to.eql('Phone number should be exactly 10 characters and only numbers are acceptable');
    });

    it('should return expected error message if phone check is failed by validator', function() {
        const firstName = 'FirstName';
        const lastname = 'Lastname';
        const phone = 1;
        validatorMock.isMobilePhone.returns(false);

        const message = userValidator(firstName, lastname, phone);

        expect(message).to.eql('Phone number should be exactly 10 characters and only numbers are acceptable');
    });
});
