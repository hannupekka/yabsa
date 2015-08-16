// Require modules.
var Joi = require('joi');
var Bill = require('../models/bill.js');

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
            // Validate payload against schema.
            payload: {
                data: schema,
            }
        },
        // Handler.
        handler: function (request, reply) {
            // Create new bill.
            Bill.create({payments: request.payload.data}, function(error, bill) {
                // Return error code.
                if(error) {
                    reply(error).code(500);
                    return;
                }

                // Reply with created bill data.
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
            // Validate query param.
            params: {
                bid: Joi.string().guid()
            },
            // Validate payload against schema.
            payload: {
                data: schema,
            }
        },
        // Handler.
        handler: function (request, reply) {
            var bid = request.params.bid;

            // Find bill with matching bid.
            Bill.findOne({bid: bid}, function (error, bill) {
                // No matching bill found.
                if(!bill) {
                    reply(error).code(404);
                    return;
                }

                // Return error code.
                if(error) {
                    reply(error).code(500);
                    return;
                }

                // Update found bill payments.
                bill.payments = request.payload.data;

                // Save updated bill.
                bill.save(function (error) {
                    // Return error code.
                    if(error) {
                        reply(error).code(500);
                        return;
                    }

                    // Reply with updated data.
                    reply(bill).code(200);
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
            // Validate query param.
            params: {
                bid: Joi.string().guid()
            }
        },
        // Handler.
        handler: function (request, reply) {
            var bid = request.params.bid;

            // Find bill with matching bid.
            Bill.findOne({bid: bid}, function (error, bill) {
                // No matching bill found.
                if(!bill) {
                    reply(error).code(404);
                    return;
                }

                // Return error code.
                if(error) {
                    reply(error).code(500);
                    return;
                }

                // Remove bill.
                bill.remove(function(error) {
                    // Return error code.
                    if(error) {
                        reply(error).code(500);
                        return;
                    }

                    // Reply with OK.
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
            // Validate query param.
            params: {
                bid: Joi.string().guid()
            }
        },
        // Handler.
        handler: function (request, reply) {
            var bid = request.params.bid;

            // Find bill with matching bid.
            Bill.findOne({bid: bid}, function (error, bill) {
                // No matching bill found.
                if(!bill) {
                    reply(error).code(404);
                    return;
                }

                // Return error code.
                if(error) {
                    reply(error).code(500);
                    return;
                }

                // Reply with payment data.
                reply({data: bill.payments}).code(200);
            });
        }
    }
}];
