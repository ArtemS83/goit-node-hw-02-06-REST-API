const Joi = require('joi');
const { HttpCode, Subscription } = require('../../../helpers/constants');

const schemaSignup = Joi.object({
  name: Joi.string().min(2).max(30).optional(),
  email: Joi.string().required(),
  //   email: Joi.string().email({
  //     minDomainSegments: 6,
  //     tlds: { allow: ['com', 'net', 'ua','ru'] },
  //   }).required(),
  password: Joi.string().min(7).required(),
  subscription: Joi.string()
    .valid(Subscription.STARTER, Subscription.PRO, Subscription.BUSINESS)
    .optional(),
});

const schemaLogin = Joi.object({
  email: Joi.string().required(),
  //   email: Joi.string().email({
  //     minDomainSegments: 6,
  //     tlds: { allow: ['com', 'net', 'ua','ru'] },
  //   }).required(),
  password: Joi.string().min(7).required(),
});

const schemaSubscription = Joi.object({
  subscription: Joi.string()
    .valid(Subscription.STARTER, Subscription.PRO, Subscription.BUSINESS)
    .required(),
});

const validate = async (schema, body, next) => {
  try {
    await schema.validateAsync(body);
    next();
  } catch (err) {
    next({
      status: HttpCode.BAD_REQUEST,
      message: `Field: ${err.message.replace(/"/g, '')}`,
    });
  }
};

module.exports.validateSignup = (req, _res, next) => {
  return validate(schemaSignup, req.body, next);
};
module.exports.validateLogin = (req, _res, next) => {
  return validate(schemaLogin, req.body, next);
};
module.exports.validateStatusSubscription = (req, _res, next) => {
  return validate(schemaSubscription, req.body, next);
};
