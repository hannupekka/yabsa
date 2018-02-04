const app = require('./app')();

// Check environment.
const PRODUCTION = process.env.NODE_ENV === 'production';

// Config
const PORT = PRODUCTION ? process.env.PORT || 8080 : 5001;

app.listen(PORT, '0.0.0.0', () => {
  // eslint-disable-next-line no-console
  console.log(`Express server listening on port ${PORT} in ${app.get('env')} mode`);
});
