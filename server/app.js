const path = require('path');
const express = require('express');
const compression = require('compression');
const bodyParser = require('body-parser');
const helmet = require('helmet');
const mongoose = require('mongoose');
const bluebird = require('bluebird');
const createRouter = require('./router');
const errorLogger = require('./middleware/errorLogger');
const errorResponder = require('./middleware/errorResponder');

module.exports = () => {
  const app = express();

  // Check environment.
  const PRODUCTION = process.env.NODE_ENV === 'production';

  // Connect to DB.
  mongoose.Promise = bluebird;
  mongoose.connect(PRODUCTION ? process.env.MONGOLAB_URI : 'mongodb://localhost/yabsa');

  // Middlewares
  app.use(bodyParser.json());
  app.use(compression());
  app.use(helmet());

  // Initialize API routes.
  const api = createRouter();
  app.use('/api', api);

  // Static files.
  app.use(express.static('dist/'));

  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../dist/index.html'));
  });

  // Error handling.
  app.use(errorLogger);
  app.use(errorResponder);

  return app;
};
