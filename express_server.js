const express = require("express");
const app = express();
const PORT = 8080; // default port 8080

const cookieParser = require("cookie-parser");
app.use(cookieParser());

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));

app.set("view engine", "ejs");

function generateRandomString() {
  let result = '';
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  const charactersLength = characters.length;
  for (let i = 0; i < 6; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength))
  }
  return result;
}

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com",
};

const users = {}

const emailExists = function(email) {
  for (user in users) {
   if(users[user].email === email) {
     return true
   }
  }
}

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
  const templateVars = { 
    greeting: 'Hello World!',
    user: users[req.cookies["user_id"]],
  };
  res.render("hello_world", templateVars);
});

app.get("/urls", (req, res) => {
  const templateVars = { 
    urls: urlDatabase,
    user: users[req.cookies["user_id"]],
   };
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  const templateVars = { 
    user: users[req.cookies["user_id"]],
  };
  res.render("urls_new", templateVars)
});

app.get("/urls/:shortURL", (req, res) => {
  const templateVars = { 
    shortURL: req.params.shortURL, 
    longURL: urlDatabase[req.params.shortURL],
    user: users[req.cookies["user_id"]],
  };
  res.render("urls_show", templateVars);
});

app.post("/urls", (req, res) => {
  const newShortUrl = generateRandomString()
  urlDatabase[newShortUrl] = "http://" + req.body["longURL"];
  const templateVars = { 
    shortURL: newShortUrl, 
    longURL: "http://" + req.body["longURL"],
    user: users[req.cookies["user_id"]],
  }
  const newLongURL = urlDatabase[newShortUrl]
  res.redirect(`/urls/${newShortUrl}`);
})

app.get("/u/:shortURL", (req, res) => {
  res.redirect(urlDatabase[req.params.shortURL])
});

app.post("/urls/:shortURL/delete", (req, res) => {
  const shortURL = req.params.shortURL
  delete urlDatabase[shortURL];
  res.redirect("/urls")
});

app.post("/urls/:shortURL", (req, res) => {
  const longURL = `http://${req.body.longURL}`
  const templateVars = { 
    shortURL: req.params.shortURL, 
    longURL: longURL,
    user: users[req.cookies["user_id"]],
  }
  const shortURL = req.params.shortURL
  urlDatabase[shortURL] = longURL
  res.redirect("/urls")
})

app.post("/login", (req, res) => {
  // res.cookie('username', req.body.username)
  res.redirect("/urls")
})

app.post("/logout", (req, res) => {
  res.clearCookie('user_id')
  res.redirect("/urls")
})

app.get("/register", (req, res) => {
  res.render("register")
})

app.post("/register", (req, res) => {
  // console.log(req.body)
  const userRandomId = generateRandomString()
  res.cookie('user_id', userRandomId)
  const user_email = req.body.email
  const user_password = req.body.password
  if (!(user_email) || !(user_password)) {
    return res.status(400).send("email/password cannot be empty")
  }
  if (emailExists(user_email) === true) {
    return res.status(400).send("email already exists")
  }
  users[userRandomId] = {}
  users[userRandomId].id = userRandomId
  users[userRandomId].email = user_email
  users[userRandomId].password = user_password
  res.redirect("/urls")
})

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
