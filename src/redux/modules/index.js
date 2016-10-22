// @flow
import { combineReducers } from 'redux';
import { routerReducer } from 'react-router-redux';
import person from 'redux/modules/person';

const rootReducer = combineReducers({
  person,
  routing: routerReducer
});

export default rootReducer;
