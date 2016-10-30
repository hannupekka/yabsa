// @flow
import { fromJS } from 'immutable';
import cuid from 'cuid';
import { assign } from 'lodash';

const defaultPerson = {
  id: cuid(),
  name: '',
  amount: ''
};

export const ADD_PERSON = 'yabsa/person/ADD_PERSON';
export const LOAD_PERSON = 'yabsa/person/LOAD_PERSON';
export const DELETE_PERSON = 'yabsa/person/DELETE_PERSON';
export const DELETE_PERSONS = 'yabsa/person/DELETE_PERSONS';
export const RESET_PERSONS = 'yabsa/person/RESET_PERSONS';
export const UPDATE_NAME = 'yabsa/person/UPDATE_NAME';
export const UPDATE_AMOUNT = 'yabsa/person/UPDATE_AMOUNT';

export const addPerson = (id?: string): ActionType => ({
  type: ADD_PERSON,
  payload: {
    id: (id && typeof id === 'string') ? id : cuid()
  }
});

type PersonProps = {
  id?: string,
  name: string,
  amount: string
}

export const loadPerson = ({ id, name, amount }: PersonProps): ActionType => ({
  type: LOAD_PERSON,
  payload: {
    id: (id && typeof id === 'string') ? id : cuid(),
    name,
    amount
  }
});

export const deletePerson = (id: string): ActionType => ({
  type: DELETE_PERSON,
  payload: {
    id
  }
});

export const deletePersons = (): ActionType => ({
  type: DELETE_PERSONS,
  payload: {}
});

export const resetPersons = (): ActionType => ({
  type: RESET_PERSONS,
  payload: {}
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
    case LOAD_PERSON:
      return state.setIn(['persons', action.payload.id],
        fromJS(assign({}, action.payload)));
    case DELETE_PERSON:
      return state.deleteIn(['persons', action.payload.id]);
    case DELETE_PERSONS:
      return state.set('persons', fromJS({}));
    case RESET_PERSONS:
      return initialState;
    case UPDATE_NAME:
      return state.setIn(['persons', action.payload.id, 'name'], action.payload.value);
    case UPDATE_AMOUNT:
      return state.setIn(['persons', action.payload.id, 'amount'], action.payload.value);
    default:
      return state;
  }
}
