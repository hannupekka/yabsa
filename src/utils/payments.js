// @flow
import { Map, fromJS } from 'immutable';
import { filter, sumBy, round } from 'lodash';

export default (data: Map<string, *>): Map<string, *> => {
  if (data.isEmpty()) {
    return fromJS({
      payments: {},
      share: 0,
      totalAmount: 0
    });
  }

  const sorted = data.map(person => {
    const personAmounts =
      filter(person.get('amount').split(' '), amount => parseFloat(amount));
    return Map({
      id: person.get('id'),
      name: person.get('name'),
      amount: round(sumBy(personAmounts, amount => Number(amount)), 3)
    });
  }).sortBy(person => person.get('amount')).reverse();

  const totalAmount = round(sorted.reduce((total, person) => total + person.get('amount'), 0), 3);
  const share = round((totalAmount / sorted.size), 3);

  let payments = Map({});
  let paymentsLeft = Map({});

  sorted.forEach(person => {
    const source = person.get('id');
    const left = share - person.get('amount');
    paymentsLeft = paymentsLeft.set(
      source,
      left < 0
        ? -round(Math.abs(left), 3)
        : round(left, 3)
    );

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
            amount: round(amount, 2)
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
    share: round(share, 2)
  });
};
