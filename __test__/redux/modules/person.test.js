import reducer, * as Person from 'redux/modules/person';
import { fromJS } from 'immutable';
import cuid from 'cuid';

describe('actions', () => {
  it('should create an action for adding person', () => {
    const id = cuid();
    const expected = {
      type: Person.ADD_PERSON,
      payload: {
        id
      }
    };

    expect(Person.addPerson(id)).toEqual(expected);
  });

  it('should create an action for updating person name', () => {
    const id = cuid();
    const expected = {
      type: Person.UPDATE_NAME,
      payload: {
        id,
        value: 'foobar'
      }
    };

    expect(Person.updateName(id, 'foobar')).toEqual(expected);
  });

  it('should create an action for updating person amount', () => {
    const id = cuid();
    const expected = {
      type: Person.UPDATE_AMOUNT,
      payload: {
        id,
        value: '10'
      }
    };

    expect(Person.updateAmount(id, '10')).toEqual(expected);
  });
});

describe('reducer', () => {
  it('should return the initial state', () => {
    expect(
      reducer(undefined, {})
    ).toEqual(Person.initialState);
  });

  it('should handle ADD_PERSON', () => {
    const id = cuid();
    const action = {
      type: Person.ADD_PERSON,
      payload: {
        id
      }
    };

    const expected = Person.initialState.setIn(['persons', id],
      fromJS({
        id,
        name: '',
        amount: ''
      })
    );

    expect(
      reducer(Person.initialState, action)
    ).toEqual(expected);
  });

  it('should handle UPDATE_NAME', () => {
    const id = Person.initialState.get('persons').first().get('id');
    const action = {
      type: Person.UPDATE_NAME,
      payload: {
        id,
        value: 'foobar'
      }
    };

    const expected = Person.initialState.setIn(['persons', id, 'name'], 'foobar');

    expect(
      reducer(Person.initialState, action)
    ).toEqual(expected);
  });

  it('should handle UPDATE_AMOUNT', () => {
    const id = Person.initialState.get('persons').first().get('id');
    const action = {
      type: Person.UPDATE_AMOUNT,
      payload: {
        id,
        value: '10'
      }
    };

    const expected = Person.initialState.setIn(['persons', id, 'amount'], '10');

    expect(
      reducer(Person.initialState, action)
    ).toEqual(expected);
  });
});
