const mongoose = require('mongoose');
const { toJSON, paginate } = require('./plugins');

const invoiceSchema = mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
      trim: true,
    },
    listProducts: {
      type: Array,
      required: true,
    },
    customerName: {
      type: String,
      required: true,
    },
    customerCompanyName: {
      type: String,
      required: false,
    },
    customerAddress: {
      type: String,
      required: true,
    },
    customerPhoneNumber: {
      type: String,
      required: true,
    },
    customerTextCode: {
      type: String,
      required: true,
    },
    customerAccountNumber: {
      type: String,
      required: true,
    },
    paymentMethod: {
      type: String,
      required: true,
    },
    note: {
      type: String,
      required: false,
    },
    totalPayment: {
      type: String,
      required: true,
    },
    invoiceNumber: {
      type: String,
      required: false,
      default: '',
    },
    createdDate: {
      type: String,
      required: true,
    },
    releaseDate: {
      type: String,
      required: false,
      default: '',
    },
    isRelease: {
      type: Boolean,
      required: true,
      default: false,
    },
    customerEmail: {
      type: String,
      required: true,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// add plugin that converts mongoose to json
invoiceSchema.plugin(toJSON);
invoiceSchema.plugin(paginate);

/**
 * @typedef Invoice
 */
const Invoice = mongoose.model('Invoice', invoiceSchema);

module.exports = Invoice;
