const Joi = require('joi');
const { objectId } = require('./custom.validation');

const createInvoice = {
  body: Joi.object().keys({
    userId: Joi.string().required(),
    listProducts: Joi.array().required(),
    customerName: Joi.string().required(),
    customerAddress: Joi.string().required(),
    customerPhoneNumber: Joi.string().required(),
    customerTextCode: Joi.string().required(),
    customerAccountNumber: Joi.string().required(),
    paymentMethod: Joi.string().required(),
    totalPayment: Joi.string().required(),
  }),
};

const getInvoice = {
  params: Joi.object().keys({
    invoiceId: Joi.string().custom(objectId),
  }),
};

const getInvoices = {
  query: Joi.object().keys({
    sortBy: Joi.string(),
    limit: Joi.number().integer(),
    page: Joi.number().integer(),
  }),
};

const updateInvoice = {
  query: Joi.object().keys({
    listProducts: Joi.array().required(),
    customerName: Joi.string().required(),
    customerAddress: Joi.string().required(),
    customerPhoneNumber: Joi.string().required(),
    customerTextCode: Joi.string().required(),
    customerAccountNumber: Joi.string().required(),
    paymentMethod: Joi.string().required(),
    totalPayment: Joi.string().required(),
  }),
};

const deleteInvoice = {
  params: Joi.object().keys({
    invoiceId: Joi.string().custom(objectId),
  }),
};

module.exports = {
  createInvoice,
  deleteInvoice,
  updateInvoice,
  getInvoice,
  getInvoices,
};
