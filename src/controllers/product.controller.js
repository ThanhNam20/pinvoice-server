const httpStatus = require('http-status');
const { productService } = require('../services');
const catchAsync = require('../utils/catchAsync');
const pick = require('../utils/pick');
const ApiError = require('../utils/ApiError');
const { modelApiResponse } = require('../utils/common');

const createProduct = catchAsync(async (req, res) => {
  const product = await productService.createProduct(req.body);
  res.status(httpStatus.CREATED).send(modelApiResponse('success', product, 'Create product successfully'));
});

const getProducts = catchAsync(async (req, res) => {
  const filter = pick(req.query, ['name', 'role']);
  const options = pick(req.query, ['sortBy', 'limit', 'page']);
  const result = await productService.queryProducts(filter, options);
  res.status(httpStatus.CREATED).send(modelApiResponse('success', result, 'Successfully'));
});

const getProduct = catchAsync(async (req, res) => {
  const product = await productService.getProductById(req.params.productId);
  if (!product) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Product not found');
  }
  res.status(httpStatus.CREATED).send(modelApiResponse('success', product, 'Successfully'));
});

const updateProduct = catchAsync(async (req, res) => {
  const product = await productService.updateProductById(req.params.productId, req.body);
  res.status(httpStatus.CREATED).send(modelApiResponse('success', product, 'Update product successfully'));
});

const deleteProduct = catchAsync(async (req, res) => {
  await productService.deleteProductById(req.params.productId);
  res.status(httpStatus.ACCEPTED).send({ result: 'Delete product successfully' });
});

module.exports = {
  createProduct,
  getProducts,
  getProduct,
  updateProduct,
  deleteProduct,
};
