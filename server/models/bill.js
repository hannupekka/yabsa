'use strict';

// Module imports.
var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var Guid = require('guid');

// Mongoose schema for bills. Pretty self explanatory.
var BillSchema = new Schema({
    bid: {
        type: String,
        default: Guid.raw(),
        index: true
    },
    paid: {
        type: Array,
        required: true
    },
    currency: {
        type: String,
        required: true
    }
});

// Export schema so we can utilize it in other places.
module.exports = mongoose.model('Bill', BillSchema);