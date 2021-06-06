// const path = require('path'); //
const jwt = require('jsonwebtoken');
const cloudinary = require('cloudinary').v2;
const { promisify } = require('util'); // пакет node, парсит колбеки

require('dotenv').config();
const Users = require('../model/users');
const { HttpCode } = require('../helpers/constants');
// const UploadAvatar = require('../services/upload-avatars-local');
const UploadAvatar = require('../services/upload-avatars-cloud');
const JWT_SECRET_KEY = process.env.JWT_SECRET_KEY;

// const AVATARS_OF_USERS = path.join('public', process.env.AVATARS_OF_USERS);

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECRET,
});

const signup = async (req, res, next) => {
  try {
    const user = await Users.findByEmail(req.body.email);
    if (user) {
      return res.status(HttpCode.CONFLICT).json({
        status: 'error',
        code: HttpCode.CONFLICT,
        message: 'Email in use',
      });
    }
    const newUser = await Users.create(req.body);
    const { id, name, email, subscription, avatarURL } = newUser;
    return res.status(HttpCode.CREATED).json({
      status: 'success ',
      code: HttpCode.CREATED,
      data: {
        user: {
          id,
          name,
          email,
          subscription,
          avatarURL,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await Users.findByEmail(email);
    const isValidPassword = await user?.validPassword(password); // .validPassword() static method schema userSchema

    if (!user || !isValidPassword) {
      return res.status(HttpCode.UNAUTHORIZED).json({
        status: 'error',
        code: HttpCode.UNAUTHORIZED,
        message: 'Email or password is wrong',
      });
    }

    const payload = { id: user.id };
    const token = jwt.sign(payload, JWT_SECRET_KEY, { expiresIn: '3h' });
    await Users.updateToken(user.id, token);

    const { id, name, subscription, avatarURL } = user;
    return res.status(HttpCode.OK).json({
      status: 'success ',
      code: HttpCode.OK,
      data: {
        token,
        user: {
          id,
          name,
          email,
          subscription,
          avatarURL,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

const logout = async (req, res, next) => {
  try {
    const userId = req.user.id;
    await Users.updateToken(userId, null);
    return res.status(HttpCode.NO_CONTENT).json({});
  } catch (error) {
    next(error);
  }
};

const current = async (req, res, next) => {
  try {
    //  const userId = req.user.id;
    // const { name, email, subscription } = await Users.findById(userId);
    const { name, email, subscription, avatarURL } = req.user;
    return res.status(HttpCode.OK).json({
      status: 'success ',
      code: HttpCode.OK,
      data: {
        name,
        email,
        subscription,
        avatarURL,
      },
    });
  } catch (error) {
    next(error);
  }
};

const subscription = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const contact = await Users.updateSubscription(userId, req.body);
    const { name, email, subscription, avatarURL } = contact;
    return res.status(HttpCode.OK).json({
      status: 'success ',
      code: HttpCode.OK,
      data: {
        name,
        email,
        subscription,
        avatarURL,
      },
    });
  } catch (error) {
    next(error);
  }
};

const avatars = async (req, res, next) => {
  try {
    const userId = req.user.id;

    const uploadCloud = promisify(cloudinary.uploader.upload);

    const uploads = new UploadAvatar(uploadCloud);

    const { userImgId, avatarURL } = await uploads.saveAvatarToCloud(
      req.file.path,
      req.user.userImgId,
    );
    await Users.updateAvatar(userId, avatarURL, userImgId);
    // ============static===========
    // const uploads = new UploadAvatar(AVATARS_OF_USERS);
    // const avatarURL = await uploads.seveAvatarToStatic({

    //   idUser: userId,
    //   pathFile: req.file.path,
    //   name: req.file.filename,
    //   oldFile: req.user.avatarURL,
    // });
    // await Users.updateAvatar(userId, avatarURL);
    return res.status(HttpCode.OK).json({
      status: 'success ',
      code: HttpCode.OK,
      data: {
        avatarURL,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  signup,
  login,
  logout,
  current,
  subscription,
  avatars,
};
