const { assert } = require('chai');

const { getUserByEmail, emailExists } = require('../helpers.js');

const testUsers = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur"
  },
  "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk"
  }
};

describe('getUserByEmail', function() {
  it('should return a user with valid email', function() {
    const user = getUserByEmail("user@example.com", testUsers);
    const expectedUserID = "userRandomID";
    assert.equal(user, expectedUserID);
  });
  it('return undefined if email is not in user datavase', function() {
    const user = getUserByEmail("user1000@example.com", testUsers);
    assert.equal(user, undefined);
  });
});
describe('emailExists', function() {
  it('returns true when e-mail exists in user database.', function() {
    const email = "user2@example.com";
    assert.equal(emailExists(email, testUsers), true);
  });
  it('returns false when e-mail doesn\'t exists in user database.', function() {
    const email = "user1000@example.com";
    assert.equal(emailExists(email, testUsers), false);
  });
});