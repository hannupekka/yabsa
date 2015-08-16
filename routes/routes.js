// Require modules.
var Joi = require('joi');
var Bill = require('../models/bill.js');
var _merge = require('lodash.merge');

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
            Bill.create({payments: request.payload.data}, function(error, bill) {
                if(error) { reply(error).code(500); return; }

                reply(bill).code(200);
            });
        }
    }
}, {
    // Updating existing one.
    method: 'PUT',
    path: '/bill/{bid}',
    config: {
        validate: {
            params: {
                bid: Joi.string().guid()
            },
            payload: {
                data: schema,
            }
        },
        handler: function (request, reply) {
            var bid = request.params.bid;
            Bill.findOne({bid: bid}, function (error, bill) {
                if(!bill) { reply(error).code(404); return;}
                if(error) { reply(error).code(500); return;}

                var updated = _merge(bill, request.payload.data);
                updated.payments = request.payload.data;
                updated.save(function (error) {
                    if(error) { reply(error).code(500); return;}
                    reply(updated).code(200);
                });
            });
        }
    }
}, {
    // Deleting one.
    method: 'DELETE',
    path: '/bill/{bid}',
    config: {
        validate: {
            params: {
                bid: Joi.string().guid()
            }
        },
        handler: function (request, reply) {
            var bid = request.params.bid;
            Bill.findOne({bid: bid}, function (error, bill) {
                if(!bill) { reply(error).code(404); return;}
                if(error) { reply(error).code(500); return;}
                bill.remove(function(error) {
                    if(error) { reply(error).code(500); }
                    reply().code(200);
                });
            });
        }
    }
}, {
    // Get one.
    method: 'GET',
    path: '/bill/{bid}',
    config: {
        validate: {
            params: {
                bid: Joi.string().guid()
            }
        },
        handler: function (request, reply) {
            var bid = request.params.bid;
            Bill.findOne({bid: bid}, function (error, bill) {
                if(!bill) { reply(error).code(404); return;}
                if(error) { reply(error).code(500); return;}
                reply({data: bill.payments}).code(200);
            });
        }
    }
}];
