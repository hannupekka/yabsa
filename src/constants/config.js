// @flow
const PRODUCTION = process.env.NODE_ENV === 'production';

module.exports = {
  API_URL: PRODUCTION ? '/api' : 'http://localhost:5000/api'
};
