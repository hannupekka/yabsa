// Module imports.
const mongoose = require('mongoose');
const Guid = require('guid');

const Schema = mongoose.Schema;

// Mongoose schema for bills. Pretty self explanatory.
const BillSchema = new Schema({
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
