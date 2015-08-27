var shareBill = require('../client/src/js/functions.js'),
    expect = require('chai').expect;

describe('Empty data', function () {
    it('should return empty results', function () {
        var data = [],
            results = shareBill(data),
            expected = {
                payments: {},
                total: 0,
                share: 0
            };
        expect(results).to.deep.equal(expected);
    });
});
