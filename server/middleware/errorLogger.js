/* eslint-disable no-console */
module.exports = (err, req, res, next) => {
  const status = err.status ? err.status : 500;

  if (status >= 400) {
    console.error('Request headers:');
    console.error(JSON.stringify(req.headers));
    console.error('Request parameters:');
    console.error(JSON.stringify(req.params));
  }

  if (process.env.NODE_ENV === 'development') {
    console.log(err.stack);
  }

  next(err);
};
