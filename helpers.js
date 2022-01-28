const getUserByEmail = function(email, users) {
  for (let user in users) {
    if (users[user].email === email) {
      return user;
    }
  }
};

const emailExists = function(email, users) {
  for (let user in users) {
    if (users[user].email === email) {
      return true;
    }
  }
  return false;
};

module.exports = { getUserByEmail, emailExists };
