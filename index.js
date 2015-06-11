var _ = require('lodash');
var data = [{
        name: 'andy',
        paid: 40
    }, {
        name: 'big bert',
        paid: 17.5
    }, {
        name: 'cheryl',
        paid: 20
    }, {
        name: 'damien',
        paid: 0
    }
];

/**
 * @param {Array} Array of object with keys name and paid.
 * @return {Array} Array of objects with payment details.
 */
var shareBill = function(data) {
    var sorted = _.sortBy(data, 'paid').reverse();
    _.each(sorted, function(person, idx) {
       person.id = idx;
    });
    var total = _.reduce(sorted, function(total, person) {
        return total + person.paid;
    }, 0);

    var share = total / sorted.length;

    var pays = {};
    _.each(sorted, function(person) {
        person.left = Number(share - person.paid);
        while (person.left > 0) {
            pays[person.id] = pays[person.id] || {name: person.name, to: []};

            var target = _.find(sorted, function(p) {
               return p.left < 0;
            });

            if (target) {
                var amount = Math.abs(target.left) > person.left ? person.left : Math.abs(target.left);
                target.left += amount;
                person.left -= amount;
                pays[person.id].to.push({
                    to: target.name,
                    amount: amount
                });
            }
        }
    });

    return pays;
};
_.each(shareBill(data), function(payment) {
   console.log(payment);
});