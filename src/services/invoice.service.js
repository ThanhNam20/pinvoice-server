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

const generateHtmlInvoiceTemplate = () => {
  const html = `
  <!DOCTYPE html>
  <html lang="en">
    <head>
      <meta charset="UTF-8" />
      <meta http-equiv="X-UA-Compatible" content="IE=edge" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <title>Document</title>
      <style>
        /* http://meyerweb.com/eric/tools/css/reset/
    v2.0 | 20110126
    License: none (public domain)
  */

        html,
        body,
        div,
        span,
        applet,
        object,
        iframe,
        h1,
        h2,
        h3,
        h4,
        h5,
        h6,
        p,
        blockquote,
        pre,
        a,
        abbr,
        acronym,
        address,
        big,
        cite,
        code,
        del,
        dfn,
        em,
        img,
        ins,
        kbd,
        q,
        s,
        samp,
        small,
        strike,
        strong,
        sub,
        sup,
        tt,
        var,
        b,
        u,
        center,
        dl,
        dt,
        dd,
        ol,
        ul,
        li,
        fieldset,
        form,
        label,
        legend,
        table,
        caption,
        tbody,
        tfoot,
        thead,
        tr,
        th,
        td,
        article,
        aside,
        canvas,
        details,
        embed,
        figure,
        figcaption,
        footer,
        header,
        hgroup,
        menu,
        nav,
        output,
        ruby,
        section,
        summary,
        time,
        mark,
        audio,
        video {
          margin: 0;
          padding: 0;
          border: 0;
          font-size: 100%;
          font: inherit;
          vertical-align: baseline;
        }

        /* HTML5 display-role reset for older browsers */
        article,
        aside,
        details,
        figcaption,
        figure,
        footer,
        header,
        hgroup,
        menu,
        nav,
        section {
          display: block;
        }

        body {
          line-height: 1;
        }

        ol,
        ul {
          list-style: none;
        }

        blockquote,
        q {
          quotes: none;
        }

        blockquote:before,
        blockquote:after,
        q:before,
        q:after {
          content: "";
          content: none;
        }

        table {
          border-collapse: collapse;
          border-spacing: 0;
        }

        body {
          background: rgb(204, 204, 204);
        }

        page {
          background: white;
          display: block;
          margin: 0 auto;
          margin-bottom: 0.5cm;
          margin-top: 0.5cm;
          box-shadow: 0 0 0.5cm rgba(0, 0, 0, 0.5);
        }

        page[size="A4"] {
          width: 21cm;
          height: 29.7cm;
        }

        @media print {
          body,
          page {
            margin: 0;
            box-shadow: 0;
          }
        }
        .container {
          margin: 10px;
        }
        .header {
          display: flex;
          flex-direction: row;
          align-items: center;
          justify-content: space-between;
        }
        .header-image img {
          margin-top: 10px;
          margin-left: 20px;
          height: 100px;
          width: 100px;
        }
        .header-title {
          text-align: center;
          line-height: 20px;
          margin-left: 50px;
        }

        .header-invoice p {
          line-height: 25px;
          font-size: 14px;
        }

        .header-invoice p i {
          font-weight: bold;
        }

        .title-invoice {
          text-transform: uppercase;
          font-size: 18px;
          font-weight: 700;
        }
        .title-vat {
          text-align: center;
          font-size: 16px;
          font-style: italic;
        }
        .title-electric {
          padding-top: 5px;
          font-weight: bold;
          font-size: 14px;
        }
        .title-electric-english {
          font-style: italic;
          font-size: 14px;
        }

        .body-information {
        }

        .body-information p {
          font-weight: bold;
          line-height: 25px;
        }

        .body-information i {
          font-weight: normal;
        }

        table {
          border-collapse: collapse;
          width: 100%;
        }

        td,
        th {
          border: 1px solid #dddddd;
          text-align: center;
          height: 25px;
          padding-top: 5px;
        }

        .sign-placeholder {
          margin-top: 30px;
          display: flex;
          flex-direction: row;
          justify-content: space-around;
        }

        .table-information {
          margin-top: 10px;
        }
      </style>
    </head>
    <body>
      <page size="A4">
        <div class="container">
          <div class="header">
            <div class="header-image">
              <img src="../assets/logo.png" alt="" />
            </div>
            <div class="header-title">
              <p class="title-invoice">Hoá đơn giá trị gia tăng</p>
              <p class="title-vat">(VAT INVOICE)</p>
              <p class="title-electric">Bản thể hiện của hoá đơn điện tử</p>
              <p class="title-electric-english">(Electric invoice display)</p>
              <p>Ngày tháng năm</p>
            </div>
            <div class="header-invoice">
              <p>Mẫu số <i>(Form)</i>: 001122333</p>
              <p>Kí hiệu <i>(Serial)</i>: AB/18E</p>
              <p>Số <i>(No.)</i>: 090990009</p>
            </div>
          </div>
          <div class="body">
            <hr />
            <div class="body-information">
              <p>Đơn vị bán hàng <i>(Seller)</i>:</p>
              <p>Mã số thuế <i>(Tax code)</i>:</p>
              <p>Địa chỉ <i>(Address)</i>:</p>
              <p>Điện thoại <i>(Phone)</i>:</p>
              <p>Số tài khoản <i>(Account No.)</i>:</p>
            </div>
            <hr />
            <div class="body-information">
              <p>Họ tên người mua hàng <i>(Customer's Name)</i>:</p>
              <p>Tên đơn vị <i>(Company's Name)</i>:</p>
              <p>Mã số thuế <i>(Tax code)</i>:</p>
              <p>Địa chỉ <i>(Address)</i>:</p>
              <p>Điện thoại <i>(Phone)</i>:</p>
              <p>Hình thức thanh toán <i>(Payment method)</i>:</p>
              <p>Ghi chú <i>(Note)</i>:</p>
            </div>

            <div class="table-information">
              <table>
                <tr>
                  <th>STT</th>
                  <th>Tên hàng hoá, dịch vụ</th>
                  <th>Đơn vị tính</th>
                  <th>Số lượng</th>
                  <th>Đơn giá</th>
                  <th>Thành tiền</th>
                </tr>

                <tr>
                  <td>1</td>
                  <td>2</td>
                  <td>3</td>
                  <td>4</td>
                  <td>5</td>
                  <td>6 = 4 * 5</td>
                </tr>

                <tr>
                  <td>1</td>
                  <td>lorem</td>
                  <td>Germany</td>
                  <td>Maria Anders</td>
                  <td>Germany</td>
                  <td>Germany</td>
                </tr>
                <tr>
                  <td>1</td>
                  <td>Maria Anders</td>
                  <td>Germany</td>
                  <td>Maria Anders</td>
                  <td>Germany</td>
                  <td>Germany</td>
                </tr>

                <tr id="total-amount">
                  <td colspan="5"></td>
                  <td>Germany</td>
                </tr>
                <tr id="total-vat">
                  <td colspan="3">Thuế giá trị gia tăng</td>
                  <td colspan="2">Germany</td>
                  <td>Germany</td>
                </tr>

                <tr id="total-payment">
                  <td colspan="5">Thuế giá trị gia tăng</td>
                  <td>Germany</td>
                </tr>

                <tr id="total-payment-text">
                  <td colspan="6">Thuế giá trị gia tăng</td>
                </tr>
              </table>
            </div>
          </div>
          <div class="footer">
            <div class="sign-placeholder">
              <div class="buyer-sign">
                <p>Người mua hàng(Buyer)</p>
              </div>
              <div class="seller-sign">
                <p>Người bán hàng(Seller)</p>
              </div>
            </div>
          </div>
        </div>
      </page>
    </body>
  </html>
`;
  return html;
};

module.exports = {
  createInvoice,
  getInvoiceById,
  queryInvoices,
  deleteInvoiceById,
  updateInvoiceById,
  generateHtmlInvoiceTemplate,
};