// @flow
import { fromJS } from 'immutable';
import {
  CREATE_BILL,
  CREATE_BILL_SUCCESS,
  CREATE_BILL_FAILURE,
  UPDATE_BILL,
  UPDATE_BILL_SUCCESS,
  UPDATE_BILL_FAILURE,
  DELETE_BILL,
  DELETE_BILL_SUCCESS,
  DELETE_BILL_FAILURE,
  FETCH_BILL,
  FETCH_BILL_SUCCESS,
  FETCH_BILL_FAILURE
} from 'redux/modules/payment';

// Reducer.
export const initialState = fromJS({
  requestCount: 0
});

export default function reducer(state: StateType = initialState, action: ActionType): StateType {
  switch (action.type) {
    case CREATE_BILL:
    case UPDATE_BILL:
    case FETCH_BILL:
    case DELETE_BILL:
      return state.set('requestCount', state.get('requestCount') + 1);
    case CREATE_BILL_SUCCESS:
    case CREATE_BILL_FAILURE:
    case UPDATE_BILL_SUCCESS:
    case UPDATE_BILL_FAILURE:
    case DELETE_BILL_SUCCESS:
    case DELETE_BILL_FAILURE:
    case FETCH_BILL_SUCCESS:
    case FETCH_BILL_FAILURE:
      return state.set('requestCount',
        state.get('requestCount') > 0
        ? state.get('requestCount') - 1
        : 0
      );
    default:
      return state;
  }
}
