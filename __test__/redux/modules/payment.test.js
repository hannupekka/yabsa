import reducer, * as Payment from 'redux/modules/payment';
import cuid from 'cuid';
import { fromJS } from 'immutable';

const id = cuid();
const payments = fromJS({
  payments: {
    [id]: {
      from: 'bob',
      to: [
        {
          amount: 10,
          name: 'john'
        }
      ]
    }
  },
  share: 15,
  totalAmount: 30
});

describe('actions', () => {
  it('should create an action for setting payments', () => {
    const expected = {
      type: Payment.SET_PAYMENTS,
      payload: {
        payments
      }
    };

    expect(Payment.setPayments(payments)).toEqual(expected);
  });
});

describe('reducer', () => {
  it('should return the initial state', () => {
    expect(
      reducer(undefined, {})
    ).toEqual(Payment.initialState);
  });

  it('should handle SET_PAYMENTS', () => {
    const action = {
      type: Payment.SET_PAYMENTS,
      payload: {
        payments: payments.get('payments'),
        share: payments.get('share'),
        totalAmount: payments.get('totalAmount')
      }
    };

    const expected = Payment.initialState.merge({
      payments: payments.get('payments'),
      share: payments.get('share'),
      totalAmount: payments.get('totalAmount')
    });

    expect(
      reducer(Payment.initialState, action)
    ).toEqual(expected);
  });
});
