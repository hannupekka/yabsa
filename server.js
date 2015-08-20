// Require modules.
var Hapi = require('hapi');
var routes = require('./server/routes/routes.js');
var mongoose = require('mongoose');
var Inert = require('inert');

// Database configs and connection
var config = require('./server/config/db.js');
mongoose.connect(config.mongo.uri, config.mongo.options);

// Create server.
var server = new Hapi.Server();
server.connection({
    host: '0.0.0.0',
    port: process.env.PORT
});
server.register(Inert, function () {});

// Add routes.
server.route(routes);

// Start server.
server.start(function() {
    console.log('Listening for connections at ' + server.info.uri);
});
