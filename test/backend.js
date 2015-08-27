var mongoose = require('mongoose'),
    Bill = require('../server/models/bill.js'),
    expect = require('chai').expect;

describe('Test Bill that', function () {
    before(function (done) {
        mongoose.connect('mongodb://localhost/yabsa_tests', done);
        // Clear all existing data.
        Bill.find({}).remove().exec();
    });

    it("valid can be saved", function (done) {
        var bill = {
            currency: 'EUR',
            paid: [
                {
                    name: "Bob",
                    paid: "20"
                }
            ]
        };
        new Bill(bill).save(done);
    });

    after(function () {
        mongoose.connection.close();
    });
});
