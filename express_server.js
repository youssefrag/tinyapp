const express = require("express");
const app = express();
const PORT = 8000; // default port 8080

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
  res.render("hello_world");
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
  const SHORTURL = req.params.shortURL
  const LONGURL = urlDatabase[req.params.shortURL].longURL
  const templateVars = { 
    shortURL: SHORTURL, 
    longURL: LONGURL,
    user: users[req.cookies["user_id"]],
  };
  res.render("urls_show", templateVars);
});

app.post("/urls", (req, res) => {
  let currentUser = req.cookies.user_id
  if(!currentUser) {
    res.redirect("/login")
  }
  const newShortUrl = generateRandomString()
  const newLongURL = "http://" + req.body["longURL"];
  urlDatabase[newShortUrl] = {}
  urlDatabase[newShortUrl].longURL = newLongURL
  urlDatabase[newShortUrl].userID = currentUser
  const templateVars = { 
    shortURL: newShortUrl, 
    longURL: "http://" + req.body["longURL"],
    user: users[req.cookies["user_id"]],
  }
  // const newLongURL = urlDatabase[newShortUrl]
  res.redirect(`/urls/${newShortUrl}`);
})

app.get("/u/:shortURL", (req, res) => {
  res.redirect(urlDatabase[req.params.shortURL].longURL)
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
  urlDatabase[shortURL].longURL = longURL
  res.redirect("/urls")
})

app.post("/logout", (req, res) => {
  res.clearCookie('user_id')
  res.redirect("/urls")
})

app.get("/register", (req, res) => {
  const templateVars = { 
    user: users[req.cookies["user_id"]],
  };
  res.render("register", templateVars)
})

app.post("/register", (req, res) => {
  const userRandomId = generateRandomString()
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
  res.cookie('user_id', userRandomId)
  res.redirect("/urls")
})

app.get("/login", (req, res) => {
  const templateVars = { 
    user: users[req.cookies["user_id"]],
  };
  res.render("login", templateVars)
})

app.post("/login", (req,res) => {
  const user_email = req.body.email
  const user_password = req.body.password
  if (!(emailExists(user_email) === true)) {
    return res.status(403).send("email has not been registered")
  }
  let matchingId
  for (id in users) {
    if (users[id].email === user_email) {
      matchingId = id
    }
  }
  let correctPassword = users[matchingId].password
  if (!(user_password === correctPassword)) {
    return res.status(403).send("The password entered is incorrect")
  }
  res.cookie('user_id', matchingId)
  res.redirect("/urls")
})

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});