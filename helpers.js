const getUserByEmail = (email, database) => {
  for (let user in database) {
    if (email === database[user].email) {
      return user;
    }
  }
  return undefined;
};

const generateRandomString = () => {
  let out = '';
  let base = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  for (let i = 0; i < 6; i++) out += base.charAt(Math.floor(Math.random() * base.length));
  return out;
};

module.exports = { getUserByEmail, generateRandomString };