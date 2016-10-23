// @flow
import { fromJS } from 'immutable';

export const SET_PAYMENTS = 'yabsa/payment/SET_PAYMENTS';

export const setPayments = (payments: Map, share: number, totalAmount: number): ActionType => ({
  type: SET_PAYMENTS,
  payload: {
    payments,
    share,
    totalAmount
  }
});

export const initialState = fromJS({
  payments: {},
  share: 0,
  totalAmount: 0
});

export default function reducer(state: StateType = initialState, action: ActionType): StateType {
  switch (action.type) {
    case SET_PAYMENTS:
      return state.merge({
        payments: action.payload.payments,
        share: action.payload.share,
        totalAmount: action.payload.totalAmount
      });
    default:
      return state;
  }
}
