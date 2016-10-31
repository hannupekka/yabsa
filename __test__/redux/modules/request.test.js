import reducer, * as Request from 'redux/modules/request';
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

describe('reducer', () => {
  it('should return the initial state', () => {
    expect(
      reducer(undefined, {})
    ).toEqual(Request.initialState);
  });

  it('should handle FETCH_BILL and FETCH_BILL_SUCCESS', () => {
    const fetchAction = {
      type: FETCH_BILL,
      payload: {}
    };

    const expected = Request.initialState.set('requestCount', 1);

    expect(
      reducer(Request.initialState, fetchAction)
    ).toEqual(expected);

    const successAction = {
      type: FETCH_BILL_SUCCESS,
      payload: {}
    };

    expect(
      reducer(Request.initialState, successAction)
    ).toEqual(expected.set('requestCount', 0));
  });

  it('should handle FETCH_BILL and FETCH_BILL_FAILURE', () => {
    const fetchAction = {
      type: FETCH_BILL,
      payload: {}
    };

    const expected = Request.initialState.set('requestCount', 1);

    expect(
      reducer(Request.initialState, fetchAction)
    ).toEqual(expected);

    const successAction = {
      type: FETCH_BILL_FAILURE,
      payload: {}
    };

    expect(
      reducer(Request.initialState, successAction)
    ).toEqual(expected.set('requestCount', 0));
  });

  it('should handle CREATE_BILL and CREATE_BILL_SUCCESS', () => {
    const createAction = {
      type: CREATE_BILL,
      payload: {}
    };

    const expected = Request.initialState.set('requestCount', 1);

    expect(
      reducer(Request.initialState, createAction)
    ).toEqual(expected);

    const successAction = {
      type: CREATE_BILL_SUCCESS,
      payload: {}
    };

    expect(
      reducer(Request.initialState, successAction)
    ).toEqual(expected.set('requestCount', 0));
  });

  it('should handle CREATE_BILL and CREATE_BILL_FAILURE', () => {
    const createAction = {
      type: CREATE_BILL,
      payload: {}
    };

    const expected = Request.initialState.set('requestCount', 1);

    expect(
      reducer(Request.initialState, createAction)
    ).toEqual(expected);

    const successAction = {
      type: CREATE_BILL_FAILURE,
      payload: {}
    };

    expect(
      reducer(Request.initialState, successAction)
    ).toEqual(expected.set('requestCount', 0));
  });

  it('should handle UPDATE_BILL and UPDATE_BILL_SUCCESS', () => {
    const updateAction = {
      type: UPDATE_BILL,
      payload: {}
    };

    const expected = Request.initialState.set('requestCount', 1);

    expect(
      reducer(Request.initialState, updateAction)
    ).toEqual(expected);

    const successAction = {
      type: UPDATE_BILL_SUCCESS,
      payload: {}
    };

    expect(
      reducer(Request.initialState, successAction)
    ).toEqual(expected.set('requestCount', 0));
  });

  it('should handle UPDATE_BILL and UPDATE_BILL_FAILURE', () => {
    const updateAction = {
      type: UPDATE_BILL,
      payload: {}
    };

    const expected = Request.initialState.set('requestCount', 1);

    expect(
      reducer(Request.initialState, updateAction)
    ).toEqual(expected);

    const successAction = {
      type: UPDATE_BILL_FAILURE,
      payload: {}
    };

    expect(
      reducer(Request.initialState, successAction)
    ).toEqual(expected.set('requestCount', 0));
  });

  it('should handle DELETE_BILL and DELETE_BILL_SUCCESS', () => {
    const deleteAction = {
      type: DELETE_BILL,
      payload: {}
    };

    const expected = Request.initialState.set('requestCount', 1);

    expect(
      reducer(Request.initialState, deleteAction)
    ).toEqual(expected);

    const successAction = {
      type: DELETE_BILL_SUCCESS,
      payload: {}
    };

    expect(
      reducer(Request.initialState, successAction)
    ).toEqual(expected.set('requestCount', 0));
  });

  it('should handle DELETE_BILL and DELETE_BILL_FAILURE', () => {
    const deleteAction = {
      type: DELETE_BILL,
      payload: {}
    };

    const expected = Request.initialState.set('requestCount', 1);

    expect(
      reducer(Request.initialState, deleteAction)
    ).toEqual(expected);

    const successAction = {
      type: DELETE_BILL_FAILURE,
      payload: {}
    };

    expect(
      reducer(Request.initialState, successAction)
    ).toEqual(expected.set('requestCount', 0));
  });
});
