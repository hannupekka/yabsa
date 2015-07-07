var shareBill = require('../src/js/functions.js');
var expect = require('chai').expect;

describe('Empty data', function() {
    it('should return empty results', function() {
        var data = [];
        var results = shareBill(data);
        var expected = {payments: {}, total: 0, share: 0};
        expect(results).to.deep.equal(expected);
    });
});
