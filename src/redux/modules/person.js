// @flow
import { fromJS } from 'immutable';
import cuid from 'cuid';
import assign from 'lodash/assign';

const defaultPerson = {
  id: cuid(),
  name: '',
  amount: ''
};

export const ADD_PERSON = 'yabsa/person/ADD_PERSON';
export const UPDATE_NAME = 'yabsa/person/UPDATE_NAME';
export const UPDATE_AMOUNT = 'yabsa/person/UPDATE_AMOUNT';

export const addPerson = (id?: string): ActionType => ({
  type: ADD_PERSON,
  payload: {
    id: id || cuid()
  }
});

export const updateName = (id: string, value: string): ActionType => ({
  type: UPDATE_NAME,
  payload: {
    id,
    value
  }
});

export const updateAmount = (id: string, value: string): ActionType => ({
  type: UPDATE_AMOUNT,
  payload: {
    id,
    value
  }
});

const initialId = cuid();
export const initialState = fromJS({
  persons: {
    [initialId]: {
      id: initialId,
      name: '',
      amount: ''
    }
  }
});

export default function reducer(state: StateType = initialState, action: ActionType): StateType {
  switch (action.type) {
    case ADD_PERSON:
      return state.setIn(['persons', action.payload.id],
        fromJS(assign({}, defaultPerson, action.payload)));
    case UPDATE_NAME:
      return state.setIn(['persons', action.payload.id, 'name'], action.payload.value);
    case UPDATE_AMOUNT:
      return state.setIn(['persons', action.payload.id, 'amount'], action.payload.value);
    default:
      return state;
  }
}
