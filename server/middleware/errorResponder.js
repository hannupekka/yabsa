const http = require('http');

// eslint-disable-next-line no-unused-vars
module.exports = (err, req, res, next) => {
  const status = err.status ? err.status : 500;
  const httpMessage = http.STATUS_CODES[status];

  let message;
  if (status < 500) {
    message = `${httpMessage}: ${err.message}`;
  } else {
    message = httpMessage;
  }

  const response = { message };
  if (err.data) {
    response.errors = err.data;
  }

  res.status(status);
  res.send(response);
};
