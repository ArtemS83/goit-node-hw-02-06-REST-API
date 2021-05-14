const express = require('express');
const router = express.Router();
const Contacts = require('../../model/contacts');
const {
  validateCreateContact,
  validateUpdateContact,
  validateObjectId,
  validateStatusFavoriteContact,
} = require('./validation');

router.get('/', async (_req, res, next) => {
  try {
    const contacts = await Contacts.listContacts();
    return res
      .status(200)
      .json({ status: 'success', code: 200, data: { contacts } });
  } catch (error) {
    next(error);
  }
});

router.get('/:contactId', validateObjectId, async (req, res, next) => {
  try {
    const contact = await Contacts.getContactById(req.params.contactId);
    console.log(contact); // toObject
    if (contact) {
      return res
        .status(200)
        .json({ status: 'success', code: 200, data: { contact } }); // toJSON
    }
    return res
      .status(404)
      .json({ status: 'error', code: 404, message: 'Not found' });
  } catch (error) {
    next(error);
  }
});

router.post('/', validateCreateContact, async (req, res, next) => {
  try {
    const contact = await Contacts.addContact(req.body);
    return res
      .status(201)
      .json({ status: 'success', code: 201, data: { contact } });
  } catch (error) {
    next(error);
  }
});

router.delete('/:contactId', validateObjectId, async (req, res, next) => {
  try {
    const contact = await Contacts.removeContact(req.params.contactId);
    if (contact) {
      return res
        .status(200)
        .json({ status: 'success', code: 200, message: 'contact deleted' });
    }
    return res
      .status(404)
      .json({ status: 'error', code: 404, message: 'Not found' });
  } catch (error) {
    next(error);
  }
});

router.put(
  '/:contactId',
  validateUpdateContact,
  validateObjectId,
  async (req, res, next) => {
    try {
      const contact = await Contacts.updateContact(
        req.params.contactId,
        req.body,
      );
      if (contact) {
        return res
          .status(200)
          .json({ status: 'success', code: 200, data: { contact } });
      }
      return res
        .status(404)
        .json({ status: 'error', code: 404, message: 'Not found' });
    } catch (error) {
      next(error);
    }
  },
);

router.patch(
  '/:contactId/favorite',
  validateStatusFavoriteContact,
  validateObjectId,
  async (req, res, next) => {
    try {
      if (!req.body.favorite) {
        return res.status(400).json({
          status: 'error',
          code: 400,
          message: 'missing field favorite',
        });
      }
      const contact = await Contacts.updateStatusContact(
        req.params.contactId,
        req.body,
      );
      if (contact) {
        return res
          .status(200)
          .json({ status: 'success', code: 200, data: { contact } });
      }

      return res
        .status(404)
        .json({ status: 'error', code: 404, message: 'Not found' });
    } catch (error) {
      next(error);
    }
  },
);

module.exports = router;
