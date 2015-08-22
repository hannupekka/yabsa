// Require modules.
var Joi = require('joi');
var Bill = require('../models/bill.js');

// Schema for payments.
var schema = Joi.array().items(Joi.object().keys({
    name: Joi.string().required(),
    paid: Joi.string().required()
}));

// API base path.
var BASE_PATH = '/api/v1'

// Routes.
module.exports = [
    {
        // Serving index.html.
        method: 'GET',
        path: '/{param*}',
        handler: {
            directory: {
                path: 'public/',
                redirectToSlash: true,
                index: true
            }
        }
    }, {
        // Saving new.
        method: 'POST',
        path: BASE_PATH + '/bill',
        config: {
            validate: {
                // Validate payload against schema.
                payload: {
                    data: schema,
                    currency: Joi.string().required()
                }
            },
            // Handler.
            handler: function (request, reply) {
                // Create new bill.
                Bill.create({paid: request.payload.data, currency: request.payload.currency}, function(error, bill) {
                    // Return error code.
                    if (error) {
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
        path: BASE_PATH + '/bill/{bid}',
        config: {
            validate: {
                // Validate query param.
                params: {
                    bid: Joi.string().guid()
                },
                // Validate payload against schema.
                payload: {
                    data: schema,
                    currency: Joi.string().required()
                }
            },
            // Handler.
            handler: function (request, reply) {
                var bid = request.params.bid;

                // Find bill with matching bid.
                Bill.findOne({bid: bid}, function (error, bill) {
                    // No matching bill found.
                    if (!bill) {
                        reply(error).code(404);
                        return;
                    }

                    // Return error code.
                    if (error) {
                        reply(error).code(500);
                        return;
                    }

                    // Update found bill payments.
                    bill.paid = request.payload.data;
                    bill.currency = request.payload.currency;

                    // Save updated bill.
                    bill.save(function (error) {
                        // Return error code.
                        if (error) {
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
        path: BASE_PATH + '/bill/{bid}',
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
                    if (!bill) {
                        reply(error).code(404);
                        return;
                    }

                    // Return error code.
                    if (error) {
                        reply(error).code(500);
                        return;
                    }

                    // Remove bill.
                    bill.remove(function(error) {
                        // Return error code.
                        if (error) {
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
        path: BASE_PATH + '/bill/{bid}',
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
                    if (!bill) {
                        reply(error).code(404);
                        return;
                    }

                    // Return error code.
                    if (error) {
                        reply(error).code(500);
                        return;
                    }

                    // Reply with payment data.
                    reply({data: bill.paid, currency: bill.currency}).code(200);
                });
            }
        }
    }
];
