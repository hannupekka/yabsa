// @flow
import { combineReducers } from 'redux';
import { routerReducer } from 'react-router-redux';
import person from 'redux/modules/person';
import payment from 'redux/modules/payment';

const rootReducer = combineReducers({
  person,
  payment,
  routing: routerReducer
});

export default rootReducer;
