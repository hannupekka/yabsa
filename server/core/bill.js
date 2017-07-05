const Bill = require('../models/bill');

const getBill = bid => Bill.findOne({ bid })
  .then(bill => {
    if (!bill) {
      const error = new Error(bid);
      error.status = 404;
      throw error;
    }

    return bill;
  })
  .catch(err => {
    throw err;
  });

const createBill = ({ description, data, currency }) => Bill.create({ description, data, currency })
  .then(bill => bill)
  .catch(err => {
    throw err;
  });

const updateBill = ({ bid, description, data, currency }) => Bill.update({ bid }, {
  description,
  data,
  currency
})
  .then(result => {
    if (result.n === 0) {
      const error = new Error(bid);
      error.status = 404;
      throw error;
    }

    return {
      bid,
      description,
      data,
      currency
    };
  })
  .catch(err => {
    throw err;
  });

const deleteBill = ({ bid }) => Bill.remove({ bid })
  .then(({ result }) => {
    if (result.n === 0) {
      const error = new Error(bid);
      error.status = 404;
      throw error;
    }

    return { bid };
  })
  .catch(err => {
    throw err;
  });

module.exports = {
  getBill,
  createBill,
  updateBill,
  deleteBill
};
