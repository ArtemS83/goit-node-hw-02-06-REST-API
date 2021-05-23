const jwt = require('jsonwebtoken');
require('dotenv').config();
const Users = require('../model/users');
const { HttpCode } = require('../helpers/constants');
const JWT_SECRET_KEY = process.env.JWT_SECRET_KEY;

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
    const { id, name, email, subscription } = newUser;
    return res.status(HttpCode.CREATED).json({
      status: 'success ',
      code: HttpCode.CREATED,
      data: {
        user: {
          id,
          name,
          email,
          subscription,
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

    const { id, name, subscription } = user;
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
    const { name, email, subscription } = req.user;
    return res.status(HttpCode.OK).json({
      status: 'success ',
      code: HttpCode.OK,
      data: {
        name,
        email,
        subscription,
      },
    });
  } catch (error) {
    next(error);
  }
};

const subscription = async (req, res, next) => {
  const userId = req.user.id;
  try {
    const contact = await Users.updateSubscription(userId, req.body);
    const { name, email, subscription } = contact;
    return res.status(HttpCode.OK).json({
      status: 'success ',
      code: HttpCode.OK,
      data: {
        name,
        email,
        subscription,
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
};
