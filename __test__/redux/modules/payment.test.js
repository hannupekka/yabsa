import configureMockStore from 'redux-mock-store';
import thunkMiddleware from 'redux-thunk';
import { apiMiddleware } from 'redux-api-middleware';
import reducer, * as Payment from 'redux/modules/payment';
import nock from 'nock';
import { API_URL } from 'constants/config';
import cuid from 'cuid';
import { fromJS } from 'immutable';

const middlewares = [thunkMiddleware, apiMiddleware];
const mockStore = configureMockStore(middlewares);

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

  it('should create an action for resetting payments', () => {
    const expected = {
      type: Payment.RESET_PAYMENTS,
      payload: {}
    };

    expect(Payment.resetPayments()).toEqual(expected);
  });
});

describe('async actions', () => {
  afterEach(() => {
    nock.cleanAll();
  });

  it('should create an action for creating bill', () => {
    const data = {
      data: [
        {
          name: 'bob',
          paid: '10 20'
        },
        {
          name: 'bill',
          paid: '100'
        }
      ]
    };

    nock(API_URL)
      .post('/bill')
      .reply(200, { data });

    const expected = [
      {
        type: Payment.CREATE_BILL,
        payload: undefined,
        meta: undefined
      },
      {
        type: Payment.CREATE_BILL_SUCCESS,
        payload: {
          data
        },
        meta: undefined
      },
    ];

    const store = mockStore();
    return store.dispatch(Payment.createBill(fromJS(data)))
    .then(() => {
      expect(store.getActions()).toEqual(expected);
    });
  });

  it('should create an action for fetching bill', () => {
    const bid = '8518aac9-895b-5c61-8eec-f2cf1095fd03';
    const data = {
      data: [
        {
          name: 'bob',
          paid: '10 20'
        },
        {
          name: 'bill',
          paid: '100'
        }
      ],
      currency: 'EUR'
    };

    nock(API_URL)
      .get(`/bill/${bid}`)
      .reply(200, { data });

    const expected = [
      {
        type: Payment.FETCH_BILL,
        payload: undefined,
        meta: undefined
      },
      {
        type: Payment.FETCH_BILL_SUCCESS,
        payload: {
          data
        },
        meta: undefined
      },
    ];

    const store = mockStore();
    return store.dispatch(Payment.fetchBill(bid))
    .then(() => {
      expect(store.getActions()).toEqual(expected);
    });
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

  it('should handle RESET_PAYMENTS', () => {
    const action = {
      type: Payment.RESET_PAYMENTS,
      payload: {}
    };

    expect(
      reducer(Payment.initialState, action)
    ).toEqual(Payment.initialState);
  });
});
