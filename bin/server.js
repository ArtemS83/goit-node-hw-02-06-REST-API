const app = require('../app');
const db = require('../model/db');
// ================static=====
const path = require('path');
const fs = require('fs/promises');

// require('dotenv').config();

// const UPLOAD_DIR = path.join(__dirname, process.env.UPLOAD_DIR); // создает папку uploads в папке bin
const UPLOAD_DIR = process.env.UPLOAD_DIR; // создает папку uploads в корне проекта
const IMG_DIR = path.join('public', 'avatars'); // создает папку avatars в корне проекта в папке public

const isAccessible = path => {
  return fs
    .access(path)
    .then(() => true)
    .catch(() => false);
};

const createFolderIsNotExist = async folder => {
  if (!(await isAccessible(folder))) {
    await fs.mkdir(folder);
  }
};
// =============end==========
const PORT = process.env.PORT || 3000;

db.then(() => {
  app.listen(PORT, async () => {
    await createFolderIsNotExist(UPLOAD_DIR); // ====static=====
    await createFolderIsNotExist(IMG_DIR); // ====static=====
    console.log(`Server running. Use our API on port: ${PORT}`);
  });
}).catch(err => {
  console.log(`Server not run. Error: ${err.message}`);
  process.exit(1);
});
