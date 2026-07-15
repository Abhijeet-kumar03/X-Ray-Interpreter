'use strict';

const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');

const isVercel = process.env.VERCEL || process.env.NOW_BUILD_TRIGGER;
const UPLOAD_DIR = isVercel
  ? path.join('/tmp', 'uploads')
  : path.join(__dirname, '../../uploads');

// Ensure upload directory exists
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, UPLOAD_DIR);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const uniqueName = `xray-${uuidv4()}${ext}`;
    cb(null, uniqueName);
  }
});

function fileFilter(req, file, cb) {
  const allowedTypes = /jpeg|jpg|png|webp|dicom|dcm/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = /image\/(jpeg|jpg|png|webp)/.test(file.mimetype);

  if (extname && mimetype) {
    return cb(null, true);
  }
  cb(new Error('Only medical image formats are accepted: JPEG, PNG, WebP, DICOM'));
}

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE) || 10 * 1024 * 1024, // 10MB
    files: 1
  }
});

module.exports = { upload };
