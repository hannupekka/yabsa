const express = require('express');
const bill = require('./endpoints/bill');


module.exports = () => {
  // eslint-disable-next-line new-cap
  const router = express.Router();

  // Routes.
  router.get('/bill/:bid', bill.getBill);
  router.post('/bill', bill.createBill);
  router.put('/bill', bill.updateBill);
  router.delete('/bill', bill.deleteBill);

  return router;
};
