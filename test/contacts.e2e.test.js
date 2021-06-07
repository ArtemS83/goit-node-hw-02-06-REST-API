const request = require('supertest');
const jwt = require('jsonwebtoken');
require('dotenv').config();
const { newContact, newUser } = require('./data/data');
const app = require('../app');
const db = require('../model/db');
const Contact = require('../model/schemas/contact');
const User = require('../model/schemas/user');
const Users = require('../model/users');
const { HttpCode } = require('../helpers/constants');

describe('E2E test the routes api/contacts', () => {
  let user, token;

  beforeAll(async () => {
    await db;
    await User.deleteOne({ email: newUser.email });
    user = await Users.create(newUser);
    const JWT_SECRET_KEY = process.env.JWT_SECRET_KEY;
    const issueToken = (payload, secret) => jwt.sign(payload, secret);
    token = issueToken({ id: user._id }, JWT_SECRET_KEY);
    await Users.updateToken(user._id, token);
  });
  beforeEach(async () => {
    await User.deleteMany();
  });
  afterAll(async () => {
    const mongo = await db;
    await User.deleteOne({ email: newUser.email });
    await mongo.disconnect();
  });

  describe('should handle GET request', () => {
    it('should response 200 status for get all contacts', async () => {
      const res = await request(app)
        .get('/api/contacts')
        .set('Authorization', `Bearer ${token}`);
      expect(res.status).toEqual(HttpCode.OK);
      expect(res.body).toBeDefined();
      expect(res.body.data.contacts).toBeInstanceOf(Array);
    });
  });
  describe('should handle POST request', () => {});
  describe('should handle PUT request', () => {});
  describe('should handle DELETE request', () => {});
  describe('should handle PATCH request', () => {});
});
