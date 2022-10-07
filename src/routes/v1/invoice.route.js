const express = require('express');
const auth = require('../../middlewares/auth');
const validate = require('../../middlewares/validate');
const invoiceValidation = require('../../validations/invoice.validation');
const invoiceController = require('../../controllers/invoice.controller');

const router = express.Router();

router.post('/createInvoice', auth(), validate(invoiceValidation.createInvoice), invoiceController.createInvoice);

router.get('/getInvoices', auth(), validate(invoiceValidation.getInvoices), invoiceController.getInvoices);

router.get('/getInvoice/:invoiceId', auth(), validate(invoiceValidation.getInvoice), invoiceController.getInvoice);

router.post('/updateInvoice/:invoiceId', auth(), validate(invoiceValidation.updateInvoice), invoiceController.updateInvoice);

router.post(
  '/deleteInvoice/:invoiceId',
  auth('manageUsers'),
  validate(invoiceValidation.deleteInvoice),
  invoiceController.deleteInvoice
);

module.exports = router;
