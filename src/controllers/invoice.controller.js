const httpStatus = require('http-status');
const fs = require('fs');
const html_to_pdf = require('html-pdf-node');
const { invoiceService } = require('../services');
const catchAsync = require('../utils/catchAsync');
const pick = require('../utils/pick');
const ApiError = require('../utils/ApiError');

const createInvoice = catchAsync(async (req, res) => {
  const invoice = await invoiceService.createInvoice(req.body);
  res.status(httpStatus.CREATED).send(invoice);
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
  await invoiceService.deleteinvoiceById(req.params.invoiceId);
  res.status(httpStatus.ACCEPTED).send({ result: 'Delete invoice successfully' });
});

const createPDFInvoiceWithoutSign = catchAsync(async (req, res) => {
  const pdfInvoiceBuffer = invoiceService.generateHtmlInvoiceTemplate();
  const options = { format: 'A4', args: ['--no-sandbox', '--disable-setuid-sandbox'] };
  const file = { content: pdfInvoiceBuffer };
  html_to_pdf.generatePdf(file, options).then((pdfBuffer) => {
    const randomNumber = Math.floor(Math.random() * 5000);
    const pdfName = `./exports/exported_file_${randomNumber}.pdf`;
    fs.writeFileSync(pdfName, pdfBuffer);
    res.status(httpStatus.ACCEPTED).send({ result: 'Create pdf invoice successfully' });
  });
});

module.exports = {
  createInvoice,
  getInvoices,
  getInvoice,
  updateInvoice,
  deleteInvoice,
  createPDFInvoiceWithoutSign,
};
