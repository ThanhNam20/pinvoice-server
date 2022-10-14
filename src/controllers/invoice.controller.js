const httpStatus = require('http-status');
const { invoiceService } = require('../services');
const catchAsync = require('../utils/catchAsync');
const pick = require('../utils/pick');
const ApiError = require('../utils/ApiError');
const { modelApiResponse } = require('../utils/common');

const createInvoice = catchAsync(async (req, res) => {
  const invoice = await invoiceService.createInvoice(req.body);
  invoiceService.generateHtmlInvoiceTemplate(invoice);
  res.status(httpStatus.CREATED).send(modelApiResponse('success', invoice, 'Create invoice successfully'));
});

const exportInvoiceWithClientSign = catchAsync(async (req, res) => {
  await invoiceService.exportInvoiceWithClientSign(req, res);
  res.status(httpStatus.CREATED).send(modelApiResponse('success', {}, 'Export invoice with sign successfully'));
});

const getInvoices = catchAsync(async (req, res) => {
  const filter = pick(req.query, ['name', 'role']);
  const options = pick(req.query, ['sortBy', 'limit', 'page']);
  const result = await invoiceService.queryInvoices(filter, options);
  res.status(httpStatus.ACCEPTED).send(result);
});

const getInvoice = catchAsync(async (req, res) => {
  const invoice = await invoiceService.getInvoiceById(req.params.invoiceId);
  if (!invoice) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Invoice not found');
  }
  res.status(httpStatus.ACCEPTED).send(invoice);
});

const updateInvoice = catchAsync(async (req, res) => {
  const invoice = await invoiceService.updateInvoiceById(req.params.invoiceId, req.body);
  res.status(httpStatus.ACCEPTED).send(invoice);
});

const deleteInvoice = catchAsync(async (req, res) => {
  await invoiceService.deleteInvoiceById(req.params.invoiceId);
  res.status(httpStatus.ACCEPTED).send({ result: 'Delete invoice successfully' });
});

module.exports = {
  createInvoice,
  getInvoices,
  getInvoice,
  updateInvoice,
  deleteInvoice,
  exportInvoiceWithClientSign,
};
