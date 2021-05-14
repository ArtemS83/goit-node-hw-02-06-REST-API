const Joi = require('joi');
const mongoose = require('mongoose');

const schemaCreateContact = Joi.object({
  name: Joi.string().alphanum().min(2).max(30).required(),

  email: Joi.string().optional(),
  //   email: Joi.string().email({
  //     minDomainSegments: 6,
  //     tlds: { allow: ['com', 'net'] },
  //   }),

  phone: Joi.string().optional(),
  //   phone: Joi.string()
  //     .min(7)
  //     .max(14)
  //     .pattern(/^[0-9]+$/),
  favorite: Joi.boolean().optional(),
});

const schemaUpdateContact = Joi.object({
  name: Joi.string().alphanum().min(2).max(30).optional(),

  email: Joi.string().optional(),
  //   email: Joi.string().email({
  //     minDomainSegments: 6,
  //     tlds: { allow: ['com', 'net'] },
  //   }),
  phone: Joi.string().optional(),
  //   phone: Joi.string()
  //     .min(7)
  //     .max(14)
  //     .pattern(/^[0-9]+$/),
  favorite: Joi.boolean().optional(),
}).min(1);

const schemaStatusFavoriteContact = Joi.object({
  favorite: Joi.boolean().required(),
});

const validate = async (schema, body, next) => {
  try {
    await schema.validateAsync(body);
    next();
  } catch (err) {
    next({ status: 400, message: `Field: ${err.message.replace(/"/g, '')}` });
  }
};

const validateId = (id, next) => {
  if (mongoose.isValidObjectId(id)) {
    next();
    return;
  }

  next({ status: 400, message: 'Id is not valid' });
};

module.exports.validateCreateContact = (req, _res, next) => {
  return validate(schemaCreateContact, req.body, next);
};

module.exports.validateUpdateContact = (req, _res, next) => {
  return validate(schemaUpdateContact, req.body, next);
};

module.exports.validateObjectId = (req, _res, next) => {
  return validateId(req.params.contactId, next);
};

module.exports.validateStatusFavoriteContact = (req, _res, next) => {
  return validate(schemaStatusFavoriteContact, req.body, next);
};
