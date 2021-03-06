// @flow
import { fromJS } from 'immutable';
import prepareApiMiddlewareRequest from 'utils/request';
import { API_URL } from 'constants/config';

export const UPDATE_DESCRIPTION = 'yabsa/payment/UPDATE_DESCRIPTION';
export const SET_PAYMENTS = 'yabsa/payment/SET_PAYMENTS';
export const RESET_PAYMENTS = 'yabsa/payment/RESET_PAYMENTS';
export const CREATE_BILL = 'yabsa/payment/CREATE_BILL';
export const CREATE_BILL_SUCCESS = 'yabsa/payment/CREATE_BILL_SUCCESS';
export const CREATE_BILL_FAILURE = 'yabsa/payment/CREATE_BILL_FAILURE';
export const UPDATE_BILL = 'yabsa/payment/UPDATE_BILL';
export const UPDATE_BILL_SUCCESS = 'yabsa/payment/UPDATE_BILL_SUCCESS';
export const UPDATE_BILL_FAILURE = 'yabsa/payment/UPDATE_BILL_FAILURE';
export const DELETE_BILL = 'yabsa/payment/DELETE_BILL';
export const DELETE_BILL_SUCCESS = 'yabsa/payment/DELETE_BILL_SUCCESS';
export const DELETE_BILL_FAILURE = 'yabsa/payment/DELETE_BILL_FAILURE';
export const FETCH_BILL = 'yabsa/payment/FETCH_BILL';
export const FETCH_BILL_SUCCESS = 'yabsa/payment/FETCH_BILL_SUCCESS';
export const FETCH_BILL_FAILURE = 'yabsa/payment/FETCH_BILL_FAILURE';

export const updateDescription = (description: string): ActionType => ({
  type: UPDATE_DESCRIPTION,
  payload: {
    description
  }
});

export const setPayments = (payments: Map, share: number, totalAmount: number): ActionType => ({
  type: SET_PAYMENTS,
  payload: {
    payments,
    share,
    totalAmount
  }
});

export const resetPayments = (): ActionType => ({
  type: RESET_PAYMENTS,
  payload: {}
});

export const createBill = (description: string, persons: Map): ApiMiddlewareRequestType => {
  return prepareApiMiddlewareRequest({
    endpoint: `${API_URL}/bill`,
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      description,
      data: persons.map(person => person.delete('id')).toArray(),
      currency: 'EUR'
    }),
    types: [
      CREATE_BILL,
      CREATE_BILL_SUCCESS,
      CREATE_BILL_FAILURE
    ]
  });
};

export const updateBill =
  (bid: string, description: string, persons: Map): ApiMiddlewareRequestType => {
    return prepareApiMiddlewareRequest({
      endpoint: `${API_URL}/bill`,
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        bid,
        description,
        data: persons.map(person => person.delete('id')).toArray(),
        currency: 'EUR'
      }),
      types: [
        UPDATE_BILL,
        UPDATE_BILL_SUCCESS,
        UPDATE_BILL_FAILURE
      ]
    });
  };

export const deleteBill = (bid: string): ApiMiddlewareRequestType => {
  return prepareApiMiddlewareRequest({
    endpoint: `${API_URL}/bill`,
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ bid }),
    types: [
      DELETE_BILL,
      DELETE_BILL_SUCCESS,
      DELETE_BILL_FAILURE
    ]
  });
};

export const fetchBill = (bid: string): ApiMiddlewareRequestType => {
  return prepareApiMiddlewareRequest({
    endpoint: `${API_URL}/bill/${bid}`,
    method: 'GET',
    types: [
      FETCH_BILL,
      FETCH_BILL_SUCCESS,
      FETCH_BILL_FAILURE
    ]
  });
};

export const initialState = fromJS({
  description: '',
  payments: {},
  share: 0,
  totalAmount: 0
});

export default function reducer(state: StateType = initialState, action: ActionType): StateType {
  switch (action.type) {
    case UPDATE_DESCRIPTION:
      return state.set('description', action.payload.description);
    case SET_PAYMENTS:
      return state.merge({
        payments: action.payload.payments,
        share: action.payload.share,
        totalAmount: action.payload.totalAmount
      });
    case RESET_PAYMENTS:
      return initialState;
    default:
      return state;
  }
}
