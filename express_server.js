const express = require("express");
const app = express();
const PORT = 9876; // default port 8080
const bcrypt = require('bcryptjs')

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
    b6UTxQ: {
        longURL: "https://www.tsn.ca",
        userID: "aJ48lW"
    },
    i3BoGr: {
        longURL: "https://www.google.ca",
        userID: "aJ48lW"
    },
    q038dN: {
        longURL: "http://www.facebook.com",
        userID: "17ecfc",
    }
};

const users = {}

const emailExists = function(email) {
  for (user in users) {
   if(users[user].email === email) {
     return true
   }
  }
}

const urlsForUser = function(id) {
  let id_dataBase = {}
  for (shortURL in urlDatabase) {
    if (urlDatabase[shortURL].userID === id) {
      id_dataBase[shortURL] = {}
      id_dataBase[shortURL].userID = urlDatabase[shortURL].userID
      id_dataBase[shortURL].longURL = urlDatabase[shortURL].longURL
    }
  }
  return id_dataBase
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
  const userID = req.cookies["user_id"]
  const userURLS = urlsForUser(userID, urlDatabase)
  const templateVars = { 
    urls: urlDatabase,
    user: users[req.cookies["user_id"]],
    urls_id : urlsForUser(req.cookies["user_id"])
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
  const currentUser = req.cookies.user_id
  if (currentUser && req.cookies.user_id === urlDatabase[shortURL].userID) {
    res.redirect("/urls")
  } else {
    res.send("This URL can only be deleted by the user who added it")
  }
  // JPZPdl
});

app.post("/urls/:shortURL", (req, res) => {
  const longURL = `http://${req.body.longURL}`
  const templateVars = { 
    shortURL: req.params.shortURL, 
    longURL: longURL,
    user: users[req.cookies["user_id"]],
  }
  const shortURL = req.params.shortURL
  const currentUser = req.cookies.user_id
  if (currentUser === urlDatabase[shortURL].userID) {
    urlDatabase[shortURL].longURL = longURL
    res.redirect("/urls")
  } else {
    res.send("This URL can only be edited by the user who added it")
  }
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
  hashedPassword = bcrypt.hashSync(user_password, 10)
  users[userRandomId] = {}
  users[userRandomId].id = userRandomId
  users[userRandomId].email = user_email
  users[userRandomId].password = hashedPassword
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
  if (!(bcrypt.compareSync(user_password, correctPassword))) {
  // if (!(user_password === correctPassword)) {
    return res.status(403).send("The password entered is incorrect")
  }
  res.cookie('user_id', matchingId)
  res.redirect("/urls")
})

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

urlsForUser("aJ48lW")