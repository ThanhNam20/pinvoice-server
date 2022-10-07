const httpStatus = require('http-status');
const { Invoice } = require('../models');
const ApiError = require('../utils/ApiError');

const createInvoice = async (invoiceBody) => {
  return Invoice.create(invoiceBody);
};

const queryInvoices = async (filter, options) => {
  const invoices = await Invoice.paginate(filter, options);
  return invoices;
};

const getInvoiceById = async (id) => {
  return Invoice.findById(id);
};

const updateInvoiceById = async (invoiceId, updateBody) => {
  const invoice = await getInvoiceById(invoiceId);
  if (!invoice) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Invoice not found');
  }
  Object.assign(invoice, updateBody);
  await invoice.save();
  return invoice;
};

const deleteInvoiceById = async (invoiceId) => {
  const invoice = await getInvoiceById(invoiceId);
  if (!invoice) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Invoice not found');
  }
  await invoice.remove();
  return invoice;
};

module.exports = {
  createInvoice,
  getInvoiceById,
  queryInvoices,
  deleteInvoiceById,
  updateInvoiceById,
};
