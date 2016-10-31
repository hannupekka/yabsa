// @flow
import { combineReducers } from 'redux';
import { routerReducer } from 'react-router-redux';
import request from 'redux/modules/request';
import person from 'redux/modules/person';
import payment from 'redux/modules/payment';

const rootReducer = combineReducers({
  person,
  payment,
  request,
  routing: routerReducer
});

export default rootReducer;
