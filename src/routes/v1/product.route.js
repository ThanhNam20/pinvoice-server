const express = require('express');
const auth = require('../../middlewares/auth');
const validate = require('../../middlewares/validate');
const productValidation = require('../../validations/product.validation');
const productController = require('../../controllers/product.controller');

const router = express.Router();

router.post('/createProduct', auth(), validate(productValidation.createProduct), productController.createProduct);

router.get('/getProducts', auth(), validate(productValidation.getProducts), productController.getProducts);

router.get('/getProduct/:productId', auth(), validate(productValidation.getProduct), productController.getProduct);

router.post('/updateProduct/:productId', auth(), validate(productValidation.updateProduct), productController.updateProduct);

router.post('/deleteProduct/:productId', auth(), validate(productValidation.deleteProduct), productController.deleteProduct);

module.exports = router;
