var sortBy = require('lodash.sortby'),
    each = require('lodash.foreach'),
    reduce = require('lodash.reduce'),
    find = require('lodash.find'),
    remove = require('lodash.remove');

/**
 * @param {Array} Array of object with keys name and paid.
 * @return {Array} Array of objects with payment details.
 */
module.exports = function (data) {
    var sorted, total, share, payments;

    // Remove invalid persons.
    remove(data, function (person) {
        return !person.name || person.name.length === 0;
    });

    // Sort data by paid amount and then reverse.
    sorted = sortBy(data, 'paid').reverse();

    // Add ID for each person.
    each(sorted, function (person, idx) {
        person.id = idx;
        person.paid = Math.round(Number(person.paid * 100));
    });

    // Calculate total amount.
    total = reduce(sorted, function (total, person) {
        return total + person.paid;
    }, 0);

    // Calculate share per person.
    share = sorted.length > 0 ? Math.round(Number(total / sorted.length)) : 0;

    // Object for storing results.
    payments = {};

    // Loop through persons.
    each(sorted, function (person) {
        // Calcaulate how much person still has to pay (or receive, if the amount is negative).
        person.left = Math.round(share - person.paid);

        var target;

        // Loop until person has paid enough.
        while (person.left > 0) {
            payments[person.id] = payments[person.id] || {name: person.name, to: []};

            // Find the first person who is to receive money.
            target = find(sorted, function (p) {
                return p.left < 0;
            });

            // Payment receiver found.
            if (target) {
                /* Check if paying person has more money than receiver.
                 * If paying has more than receiver, the amount to pay equals the amount receiver is to get.
                 * If paying has less than receiver, the amount to pay is rest of payers debt.
                 */
                var amount = Math.abs(target.left) > person.left ? person.left : Math.abs(target.left);

                // Add to receiver, subtract from payer.
                target.left += amount;
                person.left -= amount;

                // Push details for returning.
                payments[person.id].to.push({
                    to: target.name,
                    amount: Number(amount / 100)
                });
            } else {
                // Could not find any person who still shoud receive money.
                // This happens when total won't divide equally.
                person.left = 0;
            }
        }
    });

    // Return payments and other details.
    return {payments: payments, total: Number(total / 100), share: Number(share / 100)};
};
