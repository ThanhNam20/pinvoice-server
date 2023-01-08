const signer = require('node-signpdf').default;
const { PDFDocument, PDFName, PDFNumber, PDFHexString, PDFString } = require('pdf-lib');
const fs = require('fs');
const PDFArrayCustom = require('../utils/PDFArrayCustom');

class SignPDF {
  constructor(pdfFile, certFile, certificatePassword) {
    this.pdfDoc = fs.readFileSync(pdfFile);
    this.certificate = fs.readFileSync(certFile);
    this.certificatePassword = certificatePassword;
  }

  /**
   * @return Promise<Buffer>
   */
  async signPDF() {
    let newPDF = await this._addPlaceholder();
    newPDF = signer.sign(newPDF, this.certificate, {
      passphrase: this.certificatePassword,
    });

    return newPDF;
  }

  /**
   * @see https://github.com/Hopding/pdf-lib/issues/112#issuecomment-569085380
   * @returns {Promise<Buffer>}
   */
  async _addPlaceholder() {
    const loadedPdf = await PDFDocument.load(this.pdfDoc);
    const ByteRange = PDFArrayCustom.withContext(loadedPdf.context);
    const DEFAULT_BYTE_RANGE_PLACEHOLDER = '**********';
    const SIGNATURE_LENGTH = 9999;
    const pages = loadedPdf.getPages();

    ByteRange.push(PDFNumber.of(0));
    ByteRange.push(PDFName.of(DEFAULT_BYTE_RANGE_PLACEHOLDER));
    ByteRange.push(PDFName.of(DEFAULT_BYTE_RANGE_PLACEHOLDER));
    ByteRange.push(PDFName.of(DEFAULT_BYTE_RANGE_PLACEHOLDER));

    const signatureDict = loadedPdf.context.obj({
      Type: 'Sig',
      Filter: 'Adobe.PPKLite',
      SubFilter: 'adbe.pkcs7.detached',
      ByteRange,
      Contents: PDFHexString.of('A'.repeat(SIGNATURE_LENGTH)),
      Reason: PDFString.of('Tài liệu đã được kiểm định và kí số thành công!'),
      M: PDFString.fromDate(
        new Date().toLocaleString('en-US', {
          timeZone: 'Asia/Ho_Chi_Minh',
        })
      ),
    });

    const signatureDictRef = loadedPdf.context.register(signatureDict);

    const widgetDict = loadedPdf.context.obj({
      Type: 'Annot',
      Subtype: 'Widget',
      FT: 'Sig',
      Rect: [0, 0, 0, 0], // Signature rect size
      V: signatureDictRef,
      T: PDFString.of('test signature'),
      F: 4,
      P: pages[0].ref,
    });

    const widgetDictRef = loadedPdf.context.register(widgetDict);

    // Add signature widget to the first page
    pages[0].node.set(PDFName.of('Annots'), loadedPdf.context.obj([widgetDictRef]));

    // Add AcroForm to catalog(mục luc) của tree pdf
    loadedPdf.catalog.set(
      PDFName.of('AcroForm'),
      loadedPdf.context.obj({
        SigFlags: 3,
        Fields: [widgetDictRef],
      })
    );

    // Allows signatures on newer PDFs
    // @see https://github.com/Hopding/pdf-lib/issues/541
    const pdfBytes = await loadedPdf.save({ useObjectStreams: false });
    return SignPDF.unit8ToBuffer(pdfBytes);
  }

  /**
   * @param {Uint8Array} unit8
   */
  static unit8ToBuffer(unit8) {
    const buf = Buffer.alloc(unit8.byteLength);
    const view = new Uint8Array(unit8);

    // eslint-disable-next-line no-plusplus
    for (let i = 0; i < buf.length; ++i) {
      buf[i] = view[i];
    }
    return buf;
  }
}
module.exports = SignPDF;
