const db = require('./db');
const { uuid } = require('uuidv4');

const listContacts = async () => {
  return db.get('contacts').value();
};

const getContactById = async contactId => {
  return db.get('contacts').find({ id: contactId }).value();
};

const removeContact = async contactId => {
  const [record] = db.get('contacts').remove({ id: contactId }).write();
  return record;
};

const addContact = async body => {
  const id = uuid();
  const record = {
    id,
    ...body,
  };
  db.get('contacts').push(record).write();
  return record;
};

const updateContact = async (contactId, body) => {
  const record = db
    .get('contacts')
    .find({ id: contactId })
    .assign(body)
    .value();

  db.write();

  return record.id ? record : null;
};

module.exports = {
  listContacts,
  getContactById,
  removeContact,
  addContact,
  updateContact,
};
