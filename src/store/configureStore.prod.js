// @flow
import { createStore, applyMiddleware } from 'redux';
import thunkMiddleware from 'redux-thunk';
import { apiMiddleware } from 'redux-api-middleware';
import { browserHistory } from 'react-router';
import { routerMiddleware } from 'react-router-redux';
import rootReducer from 'redux/modules/index';

// Middleware you want to use in production:
const enhancer = applyMiddleware(thunkMiddleware, apiMiddleware, routerMiddleware(browserHistory));

module.exports = function configureStore(initialState?: Object) {
  // Note: only Redux >= 3.1.0 supports passing enhancer as third argument.
  // See https://github.com/rackt/redux/releases/tag/v3.1.0
  return createStore(rootReducer, initialState, enhancer);
};
