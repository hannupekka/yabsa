// Require modules.
var Hapi = require('hapi');
var routes = require('./routes/routes.js');

// Create server.
var server = new Hapi.Server();
server.connection({
    host: '0.0.0.0',
    port: process.env.PORT
});

// Add routes.
server.route(routes);

// Start server.
server.start(function() {
    console.log('Listening for connections at ' + server.info.uri);
});
