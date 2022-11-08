const express = require('express');
const auth = require('../../middlewares/auth');
const validate = require('../../middlewares/validate');
const invoiceValidation = require('../../validations/invoice.validation');
const invoiceController = require('../../controllers/invoice.controller');

const router = express.Router();

router.post('/create-invoice', auth(), validate(invoiceValidation.createInvoice), invoiceController.createInvoice);

router.get('/getInvoices', auth(), validate(invoiceValidation.getInvoices), invoiceController.getInvoices);

router.get('/getInvoice/:invoiceId', auth(), validate(invoiceValidation.getInvoice), invoiceController.getInvoice);

router.post('/updateInvoice/:invoiceId', auth(), validate(invoiceValidation.updateInvoice), invoiceController.updateInvoice);

router.get(
  '/show-invoice/:invoiceId',
  auth(),
  validate(invoiceValidation.getInvoice),
  invoiceController.showInvoiceInBrowser
);

router.post(
  '/deleteInvoice/:invoiceId',
  auth('manageUsers'),
  validate(invoiceValidation.deleteInvoice),
  invoiceController.deleteInvoice
);

router.post('/export-invoice', auth(), invoiceController.exportInvoiceWithClientSign);

module.exports = router;
