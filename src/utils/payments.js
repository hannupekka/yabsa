// @flow
import { Map, fromJS } from 'immutable';
import filter from 'lodash/filter';
import sumBy from 'lodash/sumby';
import round from 'lodash/round';

export default (data: Map<string, *>): Map<string, *> => {
  const sorted = data.map(person => {
    const personAmounts =
      filter(person.get('amount').split(' '), amount => parseFloat(amount));
    return Map({
      id: person.get('id'),
      name: person.get('name'),
      amount: round(sumBy(personAmounts, amount => Number(amount)), 2)
    });
  }).sortBy(person => person.get('amount')).reverse();

  const totalAmount = sorted.reduce((total, person) => total + person.get('amount'), 0);
  const share = round((totalAmount / sorted.size), 2);

  let payments = Map({});
  let paymentsLeft = Map({});

  sorted.forEach(person => {
    const source = person.get('id');
    paymentsLeft = paymentsLeft.set(source, round(share - person.get('amount'), 2));

    while (paymentsLeft.get(source) > 0) {
      if (!payments.get(source)) {
        payments = payments.set(source, fromJS({
          from: person.get('name'),
          to: []
        }));
      }

      const target = paymentsLeft.findKey(p => p < 0);
      if (target) {
        const amount = Math.abs(paymentsLeft.get(target, 0)) > paymentsLeft.get(source, 0)
          ? paymentsLeft.get(source)
          : Math.abs(paymentsLeft.get(target));

        paymentsLeft = paymentsLeft
          .update(target, value => value + amount)
          .update(source, value => value - amount);

        payments = payments.updateIn([source, 'to'], to => to.push(
          fromJS({
            name: sorted.getIn([target, 'name']),
            amount
          })
        ));
      } else {
        paymentsLeft = paymentsLeft.set(source, 0);
      }
    }
  });

  return Map({
    payments,
    totalAmount,
    share
  });
};
