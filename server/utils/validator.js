const Joi = require('joi');

const validateRequest = (values, schema) => {
  Joi.validate(values, schema, (err) => {
    if (err) {
      const error = new Error(err.message);
      error.status = 400;
      throw error;
    }
  });
};

module.exports = {
  validateRequest
};
