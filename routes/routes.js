// Require modules.
var Joi = require('joi');

// Schema for payments.
var schema = Joi.array().items(Joi.object().keys({
    name: Joi.string().required(),
    payments: Joi.string().required()
}));

// Routes.
module.exports = [{
    // Saving new.
    method: 'POST',
    path: '/bill',
    config: {
        validate: {
            payload: {
                data: schema,
            }
        },
        handler: function (request, reply) {
            reply(request.payload.data);
        }
    }
}, {
    // Updating existing one.
    method: 'PUT',
    path: '/bill',
    config: {
        validate: {
            payload: {
                id: Joi.string().guid(),
                data: schema,
            }
        },
        handler: function (request, reply) {
            reply(request.payload.data);
        }
    }
}, {
    // Deleting one.
    method: 'DELETE',
    path: '/bill',
    config: {
        validate: {
            payload: {
                id: Joi.string().guid(),
            }
        },
        handler: function (request, reply) {
            reply(request.payload.data);
        }
    }
}, {
    // Get one.
    method: 'GET',
    path: '/bill',
    config: {
        validate: {
            payload: {
                id: Joi.string().guid(),
            }
        },
        handler: function (request, reply) {
            reply(request.payload.data);
        }
    }
}]