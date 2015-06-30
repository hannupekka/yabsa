var shareBill = require('../src/js/functions.js');
var expect = require('chai').expect;

describe('Empty data', function() {
    it('should return empty results', function() {
        var data = [];
        var results = shareBill(data);
        expect(Object.keys(results)).to.have.length(3);
        expect(results.payments).to.exist;
        expect(results.payments).to.be.empty;
        expect(results.total).to.exist;
        expect(results.total).to.equal(0);
        expect(results.share).to.exist;
        expect(results.share).to.equal(0);
    });
});
