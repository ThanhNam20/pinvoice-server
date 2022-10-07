const Joi = require('joi');
const { objectId } = require('./custom.validation');

const createProduct = {
  body: Joi.object().keys({
    productName: Joi.string().required(),
    productQuantity: Joi.number().required(),
    productUnit: Joi.string().required(),
    productPrice: Joi.string().required(),
  }),
};

const getProduct = {
  params: Joi.object().keys({
    productId: Joi.string().custom(objectId),
  }),
};

const getProducts = {
  query: Joi.object().keys({
    productName: Joi.string(),
    sortBy: Joi.string(),
    limit: Joi.number().integer(),
    page: Joi.number().integer(),
  }),
};

const updateProduct = {
  query: Joi.object().keys({
    productName: Joi.string(),
    productQuantity: Joi.number(),
    productUnit: Joi.string(),
    productPrice: Joi.string(),
  }),
};

const deleteProduct = {
  params: Joi.object().keys({
    productId: Joi.string().custom(objectId),
  }),
};

module.exports = {
  createProduct,
  getProduct,
  getProducts,
  deleteProduct,
  updateProduct,
};
