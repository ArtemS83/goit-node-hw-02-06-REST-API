const User = require('./schemas/user');

const findById = async id => {
  const result = await User.findById(id);
  return result;
};

const findByEmail = async email => {
  const result = await User.findOne({ email });
  return result;
};

const create = async options => {
  const user = new User(options);
  return await user.save();
};

const updateToken = async (id, token) => {
  const result = await User.findByIdAndUpdate(id, { token });
  return result;
};
// const updateToken = async (id, token) => {
//   return await User.updateOne({ _id: id }, { token });
// };

const updateSubscription = async (id, body) => {
  const result = await User.findByIdAndUpdate(id, { ...body }, { new: true });
  return result;
};

const updateAvatar = async (id, avatar, userImgId) => {
  const body = { avatarURL: avatar, userImgId };
  const result = await User.findByIdAndUpdate(id, { ...body });
  return result;
};

// =============== static=======
// const updateAvatar = async (id, avatar) => {
//   const body = { avatarURL: avatar };
//   return await User.findByIdAndUpdate(id, { ...body });
// };

module.exports = {
  findById,
  findByEmail,
  create,
  updateToken,
  updateSubscription,
  updateAvatar,
};
