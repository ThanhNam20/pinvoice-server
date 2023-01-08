const httpStatus = require('http-status');
const fs = require('fs');
// eslint-disable-next-line camelcase
const html_to_pdf = require('html-pdf-node');
const path = require('path');
const SignPDF = require('./signpdf.service');
const { Invoice } = require('../models');
const ApiError = require('../utils/ApiError');
const { userService } = require('.');
const uploadFile = require('../middlewares/upload');
const { invoiceNumberGenerator } = require('../utils/common');

const createInvoice = async (invoiceBody) => {
  const invoiceData = { ...invoiceBody, createdDate: new Date().toUTCString() };
  return Invoice.create(invoiceData);
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

const generateHtmlInvoiceTemplate = async (invoiceData) => {
  const userCreateInvoiceData = await userService.getUserById(invoiceData.userId);
  let listProductHtml = ``;
  let totalAmount = 0;
  let totalPayment = 0;
  invoiceData.listProducts.forEach((product, index) => {
    listProductHtml += `
    <tr>
      <td>${index + 1}</td>
      <td>${product.productName}</td>
      <td>${product.productUnit}</td>
      <td>${product.productQuantity}</td>
      <td>${product.productPrice}</td>
      <td>${product.productPrice * product.productQuantity}</td>
    </tr>
    `;
    totalAmount += product.productPrice * product.productQuantity;
  });

  totalPayment = (totalAmount / 100) * 90;

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

      .valid-signature-container {
        display: flex;
        flex-direction: column;
        align-items: center;
      }

      .valid-signature {
        height: 100px;
        width: 300px;
        margin-top: 10px;
        border: 1px solid red;
        display: flex;
        flex-direction: column;
        justify-content: space-around;
        margin-left: 10p;
        padding-left: 10px;
        position: relative;
      }
      .valid-signature p {
        color: red;
      }

      .valid-icon {
        position: absolute;
        bottom: 150px;
      }
    </style>
  </head>
  <body>
    <page size="A4">
      <div class="container">
        <div class="header">
          <div class="header-image">
            <?xml version="1.0" encoding="UTF-8" standalone="no"?>
            <!DOCTYPE svg PUBLIC "-//W3C//DTD SVG 1.1//EN" "http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd">
            <svg
              version="1.1"
              id="Layer_1"
              xmlns="http://www.w3.org/2000/svg"
              xmlns:xlink="http://www.w3.org/1999/xlink"
              x="0px"
              y="0px"
              width="120px"
              height="120px"
              viewBox="0 0 1000 1000"
              enable-background="new 0 0 1000 1000"
              xml:space="preserve"
            >
              <image
                id="image0"
                width="1000"
                height="1000"
                x="0"
                y="0"
                xlink:href="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAA+gAAAPoCAYAAABNo9TkAAAJJmlDQ1BpY2MAAEiJlZVnUJNZF8fv
8zzphUASQodQQ5EqJYCUEFoo0quoQOidUEVsiLgCK4qINEWQRQEXXJUia0UUC4uCAhZ0gywCyrpx
FVFBWXDfGZ33HT+8/5l7z2/+c+bec8/5cAEgiINlwct7YlK6wNvJjhkYFMwE3yiMn5bC8fR0A9/V
uxEArcR7ut/P+a4IEZFp/OW4uLxy+SmCdACg7GXWzEpPWeGjy0wPj//CZ1dYsFzgMt9Y4eh/eexL
zr8s+pLj681dfhUKABwp+hsO/4b/c++KVDiC9NioyGymT3JUelaYIJKZttIJHpfL9BQkR8UmRH5T
8P+V/B2lR2anr0RucsomQWx0TDrzfw41MjA0BF9n8cbrS48hRv9/z2dFX73kegDYcwAg+7564ZUA
dO4CQPrRV09tua+UfAA67vAzBJn/eqiVDQ0IgALoQAYoAlWgCXSBETADlsAWOAAX4AF8QRDYAPgg
BiQCAcgCuWAHKABFYB84CKpALWgATaAVnAad4Dy4Aq6D2+AuGAaPgRBMgpdABN6BBQiCsBAZokEy
kBKkDulARhAbsoYcIDfIGwqCQqFoKAnKgHKhnVARVApVQXVQE/QLdA66At2EBqGH0Dg0A/0NfYQR
mATTYQVYA9aH2TAHdoV94fVwNJwK58D58F64Aq6HT8Id8BX4NjwMC+GX8BwCECLCQJQRXYSNcBEP
JBiJQgTIVqQQKUfqkVakG+lD7iFCZBb5gMKgaCgmShdliXJG+aH4qFTUVlQxqgp1AtWB6kXdQ42j
RKjPaDJaHq2DtkDz0IHoaHQWugBdjm5Et6OvoYfRk+h3GAyGgWFhzDDOmCBMHGYzphhzGNOGuYwZ
xExg5rBYrAxWB2uF9cCGYdOxBdhK7EnsJewQdhL7HkfEKeGMcI64YFwSLg9XjmvGXcQN4aZwC3hx
vDreAu+Bj8BvwpfgG/Dd+Dv4SfwCQYLAIlgRfAlxhB2ECkIr4RphjPCGSCSqEM2JXsRY4nZiBfEU
8QZxnPiBRCVpk7ikEFIGaS/pOOky6SHpDZlM1iDbkoPJ6eS95CbyVfJT8nsxmpieGE8sQmybWLVY
h9iQ2CsKnqJO4VA2UHIo5ZQzlDuUWXG8uIY4VzxMfKt4tfg58VHxOQmahKGEh0SiRLFEs8RNiWkq
lqpBdaBGUPOpx6hXqRM0hKZK49L4tJ20Bto12iQdQ2fRefQ4ehH9Z/oAXSRJlTSW9JfMlqyWvCAp
ZCAMDQaPkcAoYZxmjDA+SilIcaQipfZItUoNSc1Ly0nbSkdKF0q3SQ9Lf5RhyjjIxMvsl+mUeSKL
ktWW9ZLNkj0ie012Vo4uZynHlyuUOy33SB6W15b3lt8sf0y+X35OQVHBSSFFoVLhqsKsIkPRVjFO
sUzxouKMEk3JWilWqUzpktILpiSTw0xgVjB7mSJleWVn5QzlOuUB5QUVloqfSp5Km8oTVYIqWzVK
tUy1R1WkpqTmrpar1qL2SB2vzlaPUT+k3qc+r8HSCNDYrdGpMc2SZvFYOawW1pgmWdNGM1WzXvO+
FkaLrRWvdVjrrjasbaIdo12tfUcH1jHVidU5rDO4Cr3KfFXSqvpVo7okXY5upm6L7rgeQ89NL0+v
U++Vvpp+sP5+/T79zwYmBgkGDQaPDamGLoZ5ht2GfxtpG/GNqo3uryavdly9bXXX6tfGOsaRxkeM
H5jQTNxNdpv0mHwyNTMVmLaazpipmYWa1ZiNsulsT3Yx+4Y52tzOfJv5efMPFqYW6RanLf6y1LWM
t2y2nF7DWhO5pmHNhJWKVZhVnZXQmmkdan3UWmijbBNmU2/zzFbVNsK20XaKo8WJ45zkvLIzsBPY
tdvNcy24W7iX7RF7J/tC+wEHqoOfQ5XDU0cVx2jHFkeRk4nTZqfLzmhnV+f9zqM8BR6f18QTuZi5
bHHpdSW5+rhWuT5z03YTuHW7w+4u7gfcx9aqr01a2+kBPHgeBzyeeLI8Uz1/9cJ4eXpVez33NvTO
9e7zofls9Gn2eedr51vi+9hP0y/Dr8ef4h/i3+Q/H2AfUBogDNQP3BJ4O0g2KDaoKxgb7B/cGDy3
zmHdwXWTISYhBSEj61nrs9ff3CC7IWHDhY2UjWEbz4SiQwNCm0MXwzzC6sPmwnnhNeEiPpd/iP8y
wjaiLGIm0iqyNHIqyiqqNGo62ir6QPRMjE1MecxsLDe2KvZ1nHNcbdx8vEf88filhICEtkRcYmji
uSRqUnxSb7JicnbyYIpOSkGKMNUi9WCqSOAqaEyD0tandaXTlz/F/gzNjF0Z45nWmdWZ77P8s85k
S2QnZfdv0t60Z9NUjmPOT5tRm/mbe3KVc3fkjm/hbKnbCm0N39qzTXVb/rbJ7U7bT+wg7Ijf8Vue
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
cfTZjxevTfDQbl4CVJiADpxHQAcY31jV88P7i59M2N4OQIUJ6MALium7qba3R5jgDiTs8HBpNcao
nkdEfPbjxZEHyj0n5dkhAFxCQAfOknL1PNqdvoAOpGxrnE86fhJHD+4tTvzgf/TeKynfYAXgAobE
AWdJuQJjfyXwtR+8953liIh33v1iUOz7XovRjjWbRZgd6zl08JPFQURMsv88Xvnek1i8evzf/y//
47d+/le/WBjpLPXjJwvfevQwfvvKYvxk8aXjn4z2ufHVo4cLfxwR8f13v7j9/J/3stZWpN2Z1WQH
7U7/9uSXAaZBQAfOIqADVdL5F3e+3f2bv3tl9ZXvPSl7LWP7tx9evT7O511dOo5f+83HR9f/9qOv
ri4dvxoRf3vCpfz14u1SXx4txI//5dV7D+4tXo+Ifz/OPwJzNdL+uwUgCQI68Ixe1lqLMQYbzVFp
A+IaVgEaxMXf6+5zfz6o2tF3vay1EYlv52i4vXanv3vZB73z7heDH7z3nd2/+mJh88N/sRTXXj2+
9zf+7lfXqxbUH3+18OBocOW1UT7n6tJxXP/bjw5fX3n00sKVySrvozoaXIn+v1k8CeYnNxYOImJ7
nusAqBsBHXhe6hWOMkOgCtAFelnr9H+enhNwcOp9B+1Ov/Qzmgsn7dCkaZTf9e3Ih7ItHx0uXP/w
XyzFy988vt9669G3v7fyeK7BdVyffbz41bAf+1wwf3We6/yku3jU//Dqz7/85cIb8TSYDyJi+/vv
fiGcA0xIQAeel3RgMSCuMtbO+PfNiIhe1jqIPKzvVa3qTppOquhR/IxFRHz5y4U3en/6Unz851cP
/8bfefTSd68/uXZ16bjspZ6r/2+uvjHMx13/W49++Rt/66vjeQbzB/cW47MfL3Y//+TK608ex7V4
dp/8fkTc+v67Xzj+EmAKBHTga72stRJpt3AL5/WwWrxt9rJWN/I9q9sJVdappq+r6Kff+ejhwqu9
P30p/vJ/i6PvtR9/9Rt/+9GrqQX1h79cuP/l0cKFAf2Nf+fR6T3mM3dGKH9+8J6qOcAMOGYNOC3p
6nkYEFdHK5FXPX/Wy1o7xU0iGNk7734xiIhz96w/eRzX7v9o8dU/+6cvH330Zy/d//Jooewlf+2n
f3n13Gnrr3zvSfy9f/Sr+2/+7lfXZh3OjwZX4od/8tK99//JN45++CcvxaB/ZaUI58/bj4i3hXOA
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"
              />
            </svg>

            <!-- <img src="../assets/logo.png" alt="" /> -->
          </div>
          <div class="header-title">
            <p class="title-invoice">Hoá đơn giá trị gia tăng</p>
            <p class="title-vat">(VAT INVOICE)</p>
            <p class="title-electric">Bản thể hiện của hoá đơn điện tử</p>
            <p class="title-electric-english">(Electric invoice display)</p>
          </div>
          <div class="header-invoice">
            <p>Mẫu số <i>(Form)</i>: 000000</p>
            <p>Kí hiệu <i>(Serial)</i>: AB/18E</p>
            <p>Số <i>(No.)</i>: 000000</p>
          </div>
        </div>
        <div class="body">
          <hr />
          <div class="body-information">
            <p>
              Đơn vị bán hàng <i>(Seller)</i>:
              ${userCreateInvoiceData.organizationName}
            </p>
            <p>
              Mã số thuế <i>(Tax code)</i>: ${userCreateInvoiceData.textCode}
            </p>
            <p>Địa chỉ <i>(Address)</i>: ${userCreateInvoiceData.address}</p>
            <p>
              Điện thoại <i>(Phone)</i>: ${userCreateInvoiceData.phoneNumber}
            </p>
            <p>
              Số tài khoản <i>(Account No.)</i>:
              ${userCreateInvoiceData.accountNumber}
            </p>
          </div>
          <hr />
          <div class="body-information">
            <p>
              Họ tên người mua hàng <i>(Customer's Name)</i>:
              ${invoiceData.customerName}
            </p>
            <p>
              Tên đơn vị <i>(Company's Name)</i>: ${invoiceData.customerName}
            </p>
            <p>Mã số thuế <i>(Tax code)</i>: ${invoiceData.customerTextCode}</p>
            <p>Địa chỉ <i>(Address)</i>: ${invoiceData.customerAddress}</p>
            <p>Điện thoại <i>(Phone)</i>: ${invoiceData.customerPhoneNumber}</p>
            <p>
              Hình thức thanh toán <i>(Payment method)</i>:
              ${invoiceData.paymentMethod}
            </p>
            <p>Ghi chú <i>(Note)</i>: ${invoiceData.note}</p>
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
                <td></td>
                <td>2</td>
                <td>3</td>
                <td>4</td>
                <td>5</td>
                <td>6 = 4 * 5</td>
              </tr>

              ${listProductHtml}
              <tr id="total-amount">
                <td colspan="5">Cộng tiền hàng</td>
                <td>${totalAmount}</td>
              </tr>

              <tr id="total-payment">
                <td colspan="5">Thuế giá trị gia tăng</td>
                <td>10%</td>
              </tr>

              <tr id="total-payment">
                <td colspan="5">Tổng tiền thanh toán</td>
                <td>${totalPayment}</td>
              </tr>
            </table>
          </div>
        </div>
        <div class="footer">
          <div class="sign-placeholder">
            <div class="buyer-sign">
              <p>Người mua hàng <i>(Buyer)</i></p>
            </div>
            <div class="seller-sign">
              <div class="valid-signature-container">
                <p>Người bán hàng <i>(Seller)</i></p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </page>
  </body>
</html>
`;
  const options = { format: 'A4', args: ['--no-sandbox', '--disable-setuid-sandbox'] };
  const file = { content: html };
  html_to_pdf.generatePdf(file, options).then((pdfBuffer) => {
    const pdfName = `./exports-pdf-not-sign/${invoiceData.id}.pdf`;
    fs.writeFileSync(pdfName, pdfBuffer);
  });
};

const generateHtmlInvoiceTemplateWithSignFormat = async (invoiceData) => {
  const userCreateInvoiceData = await userService.getUserById(invoiceData.userId);
  let listProductHtml = ``;
  let totalAmount = 0;
  let totalPayment = 0;
  invoiceData.listProducts.forEach((product, index) => {
    listProductHtml += `
    <tr>
      <td>${index + 1}</td>
      <td>${product.productName}</td>
      <td>${product.productUnit}</td>
      <td>${product.productQuantity}</td>
      <td>${product.productPrice}</td>
      <td>${product.productPrice * product.productQuantity}</td>
    </tr>
    `;
    totalAmount += product.productPrice * product.productQuantity;
  });

  totalPayment = (totalAmount / 100) * 90;

  const dateObj = new Date();
  const month = dateObj.getUTCMonth() + 1; // months from 1-12
  const day = dateObj.getUTCDate();
  const year = dateObj.getUTCFullYear();

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

      .valid-signature-container {
        display: flex;
        flex-direction: column;
        align-items: center;
      }

      .valid-signature {
        height: 100px;
        width: 300px;
        margin-top: 10px;
        border: 1px solid red;
        display: flex;
        flex-direction: column;
        justify-content: space-around;
        margin-left: 10p;
        padding-left: 10px;
        position: relative;
      }
      .valid-signature p {
        color: red;
      }
      .valid-icon {
        position: absolute;
        left: 50%;
      }
    </style>
  </head>
  <body>
    <page size="A4">
      <div class="container">
        <div class="header">
          <div class="header-image">
            <?xml version="1.0" encoding="UTF-8" standalone="no"?>
            <!DOCTYPE svg PUBLIC "-//W3C//DTD SVG 1.1//EN" "http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd">
            <svg
              version="1.1"
              id="Layer_1"
              xmlns="http://www.w3.org/2000/svg"
              xmlns:xlink="http://www.w3.org/1999/xlink"
              x="0px"
              y="0px"
              width="120px"
              height="120px"
              viewBox="0 0 1000 1000"
              enable-background="new 0 0 1000 1000"
              xml:space="preserve"
            >
              <image
                id="image0"
                width="1000"
                height="1000"
                x="0"
                y="0"
                xlink:href="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAA+gAAAPoCAYAAABNo9TkAAAJJmlDQ1BpY2MAAEiJlZVnUJNZF8fv
8zzphUASQodQQ5EqJYCUEFoo0quoQOidUEVsiLgCK4qINEWQRQEXXJUia0UUC4uCAhZ0gywCyrpx
FVFBWXDfGZ33HT+8/5l7z2/+c+bec8/5cAEgiINlwct7YlK6wNvJjhkYFMwE3yiMn5bC8fR0A9/V
uxEArcR7ut/P+a4IEZFp/OW4uLxy+SmCdACg7GXWzEpPWeGjy0wPj//CZ1dYsFzgMt9Y4eh/eexL
zr8s+pLj681dfhUKABwp+hsO/4b/c++KVDiC9NioyGymT3JUelaYIJKZttIJHpfL9BQkR8UmRH5T
8P+V/B2lR2anr0RucsomQWx0TDrzfw41MjA0BF9n8cbrS48hRv9/z2dFX73kegDYcwAg+7564ZUA
dO4CQPrRV09tua+UfAA67vAzBJn/eqiVDQ0IgALoQAYoAlWgCXSBETADlsAWOAAX4AF8QRDYAPgg
BiQCAcgCuWAHKABFYB84CKpALWgATaAVnAad4Dy4Aq6D2+AuGAaPgRBMgpdABN6BBQiCsBAZokEy
kBKkDulARhAbsoYcIDfIGwqCQqFoKAnKgHKhnVARVApVQXVQE/QLdA66At2EBqGH0Dg0A/0NfYQR
mATTYQVYA9aH2TAHdoV94fVwNJwK58D58F64Aq6HT8Id8BX4NjwMC+GX8BwCECLCQJQRXYSNcBEP
JBiJQgTIVqQQKUfqkVakG+lD7iFCZBb5gMKgaCgmShdliXJG+aH4qFTUVlQxqgp1AtWB6kXdQ42j
RKjPaDJaHq2DtkDz0IHoaHQWugBdjm5Et6OvoYfRk+h3GAyGgWFhzDDOmCBMHGYzphhzGNOGuYwZ
xExg5rBYrAxWB2uF9cCGYdOxBdhK7EnsJewQdhL7HkfEKeGMcI64YFwSLg9XjmvGXcQN4aZwC3hx
vDreAu+Bj8BvwpfgG/Dd+Dv4SfwCQYLAIlgRfAlxhB2ECkIr4RphjPCGSCSqEM2JXsRY4nZiBfEU
8QZxnPiBRCVpk7ikEFIGaS/pOOky6SHpDZlM1iDbkoPJ6eS95CbyVfJT8nsxmpieGE8sQmybWLVY
h9iQ2CsKnqJO4VA2UHIo5ZQzlDuUWXG8uIY4VzxMfKt4tfg58VHxOQmahKGEh0SiRLFEs8RNiWkq
lqpBdaBGUPOpx6hXqRM0hKZK49L4tJ20Bto12iQdQ2fRefQ4ehH9Z/oAXSRJlTSW9JfMlqyWvCAp
ZCAMDQaPkcAoYZxmjDA+SilIcaQipfZItUoNSc1Ly0nbSkdKF0q3SQ9Lf5RhyjjIxMvsl+mUeSKL
ktWW9ZLNkj0ie012Vo4uZynHlyuUOy33SB6W15b3lt8sf0y+X35OQVHBSSFFoVLhqsKsIkPRVjFO
sUzxouKMEk3JWilWqUzpktILpiSTw0xgVjB7mSJleWVn5QzlOuUB5QUVloqfSp5Km8oTVYIqWzVK
tUy1R1WkpqTmrpar1qL2SB2vzlaPUT+k3qc+r8HSCNDYrdGpMc2SZvFYOawW1pgmWdNGM1WzXvO+
FkaLrRWvdVjrrjasbaIdo12tfUcH1jHVidU5rDO4Cr3KfFXSqvpVo7okXY5upm6L7rgeQ89NL0+v
U++Vvpp+sP5+/T79zwYmBgkGDQaPDamGLoZ5ht2GfxtpG/GNqo3uryavdly9bXXX6tfGOsaRxkeM
H5jQTNxNdpv0mHwyNTMVmLaazpipmYWa1ZiNsulsT3Yx+4Y52tzOfJv5efMPFqYW6RanLf6y1LWM
t2y2nF7DWhO5pmHNhJWKVZhVnZXQmmkdan3UWmijbBNmU2/zzFbVNsK20XaKo8WJ45zkvLIzsBPY
tdvNcy24W7iX7RF7J/tC+wEHqoOfQ5XDU0cVx2jHFkeRk4nTZqfLzmhnV+f9zqM8BR6f18QTuZi5
bHHpdSW5+rhWuT5z03YTuHW7w+4u7gfcx9aqr01a2+kBPHgeBzyeeLI8Uz1/9cJ4eXpVez33NvTO
9e7zofls9Gn2eedr51vi+9hP0y/Dr8ef4h/i3+Q/H2AfUBogDNQP3BJ4O0g2KDaoKxgb7B/cGDy3
zmHdwXWTISYhBSEj61nrs9ff3CC7IWHDhY2UjWEbz4SiQwNCm0MXwzzC6sPmwnnhNeEiPpd/iP8y
wjaiLGIm0iqyNHIqyiqqNGo62ir6QPRMjE1MecxsLDe2KvZ1nHNcbdx8vEf88filhICEtkRcYmji
uSRqUnxSb7JicnbyYIpOSkGKMNUi9WCqSOAqaEyD0tandaXTlz/F/gzNjF0Z45nWmdWZ77P8s85k
S2QnZfdv0t60Z9NUjmPOT5tRm/mbe3KVc3fkjm/hbKnbCm0N39qzTXVb/rbJ7U7bT+wg7Ijf8Vue
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
cfTZjxevTfDQbl4CVJiADpxHQAcY31jV88P7i59M2N4OQIUJ6MALium7qba3R5jgDiTs8HBpNcao
nkdEfPbjxZEHyj0n5dkhAFxCQAfOknL1PNqdvoAOpGxrnE86fhJHD+4tTvzgf/TeKynfYAXgAobE
AWdJuQJjfyXwtR+8953liIh33v1iUOz7XovRjjWbRZgd6zl08JPFQURMsv88Xvnek1i8evzf/y//
47d+/le/WBjpLPXjJwvfevQwfvvKYvxk8aXjn4z2ufHVo4cLfxwR8f13v7j9/J/3stZWpN2Z1WQH
7U7/9uSXAaZBQAfOIqADVdL5F3e+3f2bv3tl9ZXvPSl7LWP7tx9evT7O511dOo5f+83HR9f/9qOv
ri4dvxoRf3vCpfz14u1SXx4txI//5dV7D+4tXo+Ifz/OPwJzNdL+uwUgCQI68Ixe1lqLMQYbzVFp
A+IaVgEaxMXf6+5zfz6o2tF3vay1EYlv52i4vXanv3vZB73z7heDH7z3nd2/+mJh88N/sRTXXj2+
9zf+7lfXqxbUH3+18OBocOW1UT7n6tJxXP/bjw5fX3n00sKVySrvozoaXIn+v1k8CeYnNxYOImJ7
nusAqBsBHXhe6hWOMkOgCtAFelnr9H+enhNwcOp9B+1Ov/Qzmgsn7dCkaZTf9e3Ih7ItHx0uXP/w
XyzFy988vt9669G3v7fyeK7BdVyffbz41bAf+1wwf3We6/yku3jU//Dqz7/85cIb8TSYDyJi+/vv
fiGcA0xIQAeel3RgMSCuMtbO+PfNiIhe1jqIPKzvVa3qTppOquhR/IxFRHz5y4U3en/6Unz851cP
/8bfefTSd68/uXZ16bjspZ6r/2+uvjHMx13/W49++Rt/66vjeQbzB/cW47MfL3Y//+TK608ex7V4
dp/8fkTc+v67Xzj+EmAKBHTga72stRJpt3AL5/WwWrxt9rJWN/I9q9sJVdappq+r6Kff+ejhwqu9
P30p/vJ/i6PvtR9/9Rt/+9GrqQX1h79cuP/l0cKFAf2Nf+fR6T3mM3dGKH9+8J6qOcAMOGYNOC3p
6nkYEFdHK5FXPX/Wy1o7xU0iGNk7734xiIhz96w/eRzX7v9o8dU/+6cvH330Zy/d//Jooewlf+2n
f3n13Gnrr3zvSfy9f/Sr+2/+7lfXZh3OjwZX4od/8tK99//JN45++CcvxaB/ZaUI58/bj4i3hXOA
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"
              />
            </svg>

            <!-- <img src="../assets/logo.png" alt="" /> -->
          </div>
          <div class="header-title">
            <p class="title-invoice">Hoá đơn giá trị gia tăng</p>
            <p class="title-vat">(VAT INVOICE)</p>
            <p class="title-electric">Bản thể hiện của hoá đơn điện tử</p>
            <p class="title-electric-english">(Electric invoice display)</p>
            <p>Ngày ${day} tháng ${month} năm ${year}</p>
          </div>
          <div class="header-invoice">
            <p>Mẫu số <i>(Form)</i>: 000000</p>
            <p>Kí hiệu <i>(Serial)</i>: AB/18E</p>
            <p>Số <i>(No.)</i>: ${invoiceData.invoiceNumber}</p>
          </div>
        </div>
        <div class="body">
          <hr />
          <div class="body-information">
            <p>
              Đơn vị bán hàng <i>(Seller)</i>:
              ${userCreateInvoiceData.organizationName}
            </p>
            <p>
              Mã số thuế <i>(Tax code)</i>: ${userCreateInvoiceData.textCode}
            </p>
            <p>Địa chỉ <i>(Address)</i>: ${userCreateInvoiceData.address}</p>
            <p>
              Điện thoại <i>(Phone)</i>: ${userCreateInvoiceData.phoneNumber}
            </p>
            <p>
              Số tài khoản <i>(Account No.)</i>:
              ${userCreateInvoiceData.accountNumber}
            </p>
          </div>
          <hr />
          <div class="body-information">
            <p>
              Họ tên người mua hàng <i>(Customer's Name)</i>:
              ${invoiceData.customerName}
            </p>
            <p>
              Tên đơn vị <i>(Company's Name)</i>: ${invoiceData.customerName}
            </p>
            <p>Mã số thuế <i>(Tax code)</i>: ${invoiceData.customerTextCode}</p>
            <p>Địa chỉ <i>(Address)</i>: ${invoiceData.customerAddress}</p>
            <p>Điện thoại <i>(Phone)</i>: ${invoiceData.customerPhoneNumber}</p>
            <p>
              Hình thức thanh toán <i>(Payment method)</i>:
              ${invoiceData.paymentMethod}
            </p>
            <p>Ghi chú <i>(Note)</i>: ${invoiceData.note}</p>
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
                <td></td>
                <td>2</td>
                <td>3</td>
                <td>4</td>
                <td>5</td>
                <td>6 = 4 * 5</td>
              </tr>

              ${listProductHtml}
              <tr id="total-amount">
                <td colspan="5">Cộng tiền hàng</td>
                <td>${totalAmount}</td>
              </tr>

              <tr id="total-payment">
                <td colspan="5">Thuế giá trị gia tăng</td>
                <td>10%</td>
              </tr>

              <tr id="total-payment">
                <td colspan="5">Tổng tiền thanh toán</td>
                <td>${totalPayment}</td>
              </tr>
            </table>
          </div>
        </div>
        <div class="footer">
          <div class="sign-placeholder">
            <div class="buyer-sign">
              <p>Người mua hàng <i>(Buyer)</i></p>
            </div>
            <div class="seller-sign">
              <div class="valid-signature-container">
                <p>Người bán hàng <i>(Seller)</i></p>
                <i>(Đã được kí điên tử)</i>
                <div class="valid-signature">
                  <p>Signature Valid</p>
                  <p>Được kí bởi: ${userCreateInvoiceData.organizationName}</p>
                  <p>Ngày kí: ${`${day}/${month}/${year}`}</p>

                <div class="valid-icon">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 48 48"
                    width="48px"
                    height="48px"
                  >
                    <rect
                      width="37.9"
                      height="6"
                      x="9.4"
                      y="20.3"
                      fill="#3ddab4"
                      transform="rotate(-46.06 28.34 23.342)"
                    />
                    <rect
                      width="6"
                      height="17.9"
                      x="10"
                      y="21.8"
                      fill="#3ddab4"
                      transform="rotate(-46.188 12.962 30.729)"
                    />
                    <polygon
                      fill="#00b569"
                      points="21.5,34.8 17.2,30.6 13,34.9 17.3,39.1 20.1,36.2"
                    />
                  </svg>
                </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </page>
  </body>
</html>
`;
  const options = { format: 'A4', args: ['--no-sandbox', '--disable-setuid-sandbox'] };
  const file = { content: html };
  html_to_pdf.generatePdf(file, options).then((pdfBuffer) => {
    const pdfName = `./exports-pdf-with-sign/${invoiceData.id}.pdf`;
    fs.writeFileSync(pdfName, pdfBuffer);
  });
};

const exportInvoiceWithClientSign = async (req, res) => {
  try {
    await uploadFile(req, res);
    if (req.file === undefined) {
      return res.status(400).send({ message: 'Upload a file please!' });
    }
    if (req.body.invoiceId === '' || req.body.clientCertificatePassword === '') {
      return res.status(400).send({ message: 'invoiceId field or clientCertificatePassword field is not empty.' });
    }

    const invoice = await getInvoiceById(req.body.invoiceId);
    if (!invoice) {
      throw new ApiError(httpStatus.NOT_FOUND, 'Invoice not found');
    }

    const updateBody = {
      ...invoice,
      isRelease: true,
      releaseDate: new Date().toUTCString(),
      invoiceNumber: invoiceNumberGenerator(),
    };

    Object.assign(invoice, updateBody);

    // Gen invoice có chữ kí ở template để sau kí vào đấy
    await generateHtmlInvoiceTemplateWithSignFormat(invoice);
    await invoice.save();

    const pdfBuffer = new SignPDF(
      path.resolve(`exports-pdf-with-sign/${req.body.invoiceId}.pdf`),
      path.resolve(`client_certificates/${req.file.filename}`),
      req.body.clientCertificatePassword
    );
    const signedDocs = await pdfBuffer.signPDF();
    const pdfName = `./signed_invoices/${req.body.invoiceId}-sign.pdf`;
    fs.writeFileSync(pdfName, signedDocs);
  } catch (err) {
    res.status(500).send({
      message: `${err}`,
    });
  }
};

module.exports = {
  createInvoice,
  getInvoiceById,
  queryInvoices,
  deleteInvoiceById,
  updateInvoiceById,
  generateHtmlInvoiceTemplate,
  exportInvoiceWithClientSign,
  generateHtmlInvoiceTemplateWithSignFormat,
};
