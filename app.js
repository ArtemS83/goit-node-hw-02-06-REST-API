const express = require('express');
const logger = require('morgan');
const cors = require('cors');
const boolParser = require('express-query-boolean');
const helmet = require('helmet');
// ===========static========//
const path = require('path');
const fs = require('fs/promises');
const multer = require('multer');
const jimp = require('jimp');
// ============end========//
const limiter = require('./helpers/limiter');
const { HttpCode, Limit } = require('./helpers/constants');
const usersRouter = require('./routes/api/users');
const contactsRouter = require('./routes/api/contacts');

const app = express();
// ===============static========//
require('dotenv').config();

const UPLOAD_DIR = path.join(__dirname, process.env.UPLOAD_DIR);
const IMG_DIR = path.join(__dirname, 'public', 'avatars');

const storage = multer.diskStorage({
  destination: function (_req, _file, cb) {
    cb(null, UPLOAD_DIR);
  },
  filename: function (_req, file, cb) {
    // cb(null, file.fieldname + '-' + Date.now()); // здесь меняем имя файла под свое, какое хотим
    cb(null, file.originalname);
  },
});

const upload = multer({
  storage: storage,
  limits: { fileSize: Limit.MAX_SIZE_AVATARS_2MB },
  fileFilter: (_req, file, cb) => {
    if (file.mimetype.includes('image')) {
      cb(null, true);
      return;
    }
    cb(null, false);
  },
});

app.use(express.static(path.join(__dirname, 'public'))); // http://localhost:3000/avatars/photo.jpg
// app.use(express.static(path.join(__dirname, 'uploads'))); // http://localhost:3000/photo.jpg
app.post('/upload', upload.single('avatar'), async (req, res, next) => {
  // 'avatar'- name в инпуте формы name="avatar"
  // console.log('req.file', req.file);
  // console.log('req.body', req.body);
  if (req.file) {
    const { file } = req;
    const img = await jimp.read(file.path);
    await img
      .autocrop()
      .cover(
        250,
        250,
        jimp.VERTICAL_ALIGN_MIDDLE || jimp.HORIZONTAL_ALIGN_CENTER, // отцентровка по центру прсле обрезки на 250*250
      )
      .writeAsync(file.path);
    await fs.rename(file.path, path.join(IMG_DIR, file.originalname));
  }
  res.redirect('/');
});
// ===========end========//
const formatsLogger = app.get('env') === 'development' ? 'dev' : 'short';

app.use(helmet());
app.use(limiter);
app.use(logger(formatsLogger));
app.use(cors());
app.use(express.json({ limit: Limit.MAX_JSON_SIZE_15KB }));
app.use(boolParser());
app.use('/api/users', usersRouter);
app.use('/api/contacts', contactsRouter);

app.use((_req, res) => {
  res
    .status(HttpCode.NOT_FOUND)
    .json({ status: 'error', code: HttpCode.NOT_FOUND, message: 'Not found' });
});

app.use((err, _req, res, _next) => {
  const code = err.status || HttpCode.INTERNAL_SERVER_ERROR;
  const status = err.status ? 'error' : 'fail';
  res.status(code).json({ status, code, message: err.message });
});

module.exports = app;
