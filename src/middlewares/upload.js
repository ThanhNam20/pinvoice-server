const util = require('util');
const multer = require('multer');

const maxSize = 2 * 1024 * 1024;

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, `./client_certificates`);
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname);
  },
});

const uploadFile = multer({
  storage,
  limits: { fileSize: maxSize },
}).single('file');

const uploadFileMiddleware = util.promisify(uploadFile);
module.exports = uploadFileMiddleware;
