const epUtils = require('../utils/endpoint');
const billCore = require('../core/bill');
const validateRequest = require('../utils/validator').validateRequest;
const Joi = require('joi');

const getBill = epUtils.createJsonRoute((req) => {
  const schema = {
    bid: Joi.string().guid(),
  };

  validateRequest(req.params, schema);

  return billCore.getBill(req.params.bid);
});

const createBill = epUtils.createJsonRoute((req) => {
  const schema = {
    description: Joi.string().allow(''),
    data: Joi.array().items(Joi.object().keys({
      name: Joi.string().required(),
      amount: Joi.string().required()
    })),
    currency: Joi.string().required()
  };

  validateRequest(req.body, schema);

  return billCore.createBill(req.body);
});

const updateBill = epUtils.createJsonRoute((req) => {
  const schema = {
    bid: Joi.string().guid(),
    description: Joi.string().allow(''),
    data: Joi.array().items(Joi.object().keys({
      name: Joi.string().required(),
      amount: Joi.string().required()
    })),
    currency: Joi.string().required()
  };

  validateRequest(req.body, schema);

  return billCore.updateBill(req.body);
});

const deleteBill = epUtils.createJsonRoute((req) => {
  const schema = {
    bid: Joi.string().guid()
  };

  validateRequest(req.body, schema);

  return billCore.deleteBill(req.body);
});

module.exports = {
  getBill,
  createBill,
  updateBill,
  deleteBill
};
