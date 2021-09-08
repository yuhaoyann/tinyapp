const express = require("express");
const app = express();
const PORT = 8080;
var cookieParser = require('cookie-parser');

app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

const urlDatabase = {};

const users = {};

function generateRandomString() {
  let out = '';
  let base = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  for (let i = 0; i < 6; i++) out += base.charAt(Math.floor(Math.random()*base.length))
  return out;
}

function findUserByEmail(email) {
  for (let user in users) {
    if (email === users[user].email) {
      return user;
    }
  }
  return undefined;
}

// app.get("/", (req, res) => {
//   res.send("Hello!");
// });

// app.get("/hello", (req, res) => {
//   const templateVars = { greeting: 'Hello World' };
//   res.render("hello_world", templateVars);
// });

app.get("/urls", (req, res) => {
  let urlUserDatabase = {};
  for (url in urlDatabase) {
    if (urlDatabase[url].userID === req.cookies.user_id) {
      urlUserDatabase[url] = urlDatabase[url];
    }
  }
  const templateVars = { urls: urlUserDatabase, user: users['user'.concat(req.cookies.user_id)] };
  console.log(users);
  console.log(urlDatabase);
  res.render('urls_index', templateVars);
});

app.get("/urls/new", (req, res) => {
  const templateVars = { user: users['user'.concat(req.cookies.user_id)] };
  res.render("urls_new", templateVars);
});

app.get("/urls/:shortURL", (req, res) => {
  const templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL].longURL, user: users['user'.concat(req.cookies.user_id)] };
  if (!req.cookies.user_id) {
    res.status(403).send('Please login to see urls');
  } else if (urlDatabase[req.params.shortURL].userID  === req.cookies.user_id) {
    res.render("urls_show", templateVars);
  } else {
    res.status(403).send("This url does not belong to you, you can't see it");
  }
});

app.get("/u/:shortURL", (req, res) => {
  res.redirect(urlDatabase[req.params.shortURL].longURL);
});

app.get("/register", (req, res) => {
  const templateVars = { user: users['user'.concat(req.cookies.user_id)] };
  res.render("urls_register", templateVars);
});

app.get("/login", (req, res) => {
  const templateVars = { user: users['user'.concat(req.cookies.user_id)] };
  res.render("urls_login", templateVars);
});

app.post("/urls", (req, res) => {
  if (req.cookies.user_id) {
    let short = generateRandomString();
    let long = req.body.longURL;
    if (!long.startsWith('http://')) {
      let long1 = 'http://'.concat(long);
      urlDatabase[short] = { longURL: long1, userID: req.cookies.user_id };
    } else {
      urlDatabase[short] = { longURL: req.body.longURL, userID: req.cookies.user_id };
    }
    res.redirect(`/urls/${short}`);
  } else {
    res.redirect('/login');
  }
});

app.post("/urls/edit/:id", (req, res) => {
  if (req.cookies.user_id) {
    let short = req.params.id;
    let long = req.body.longURL;
    if (!long.startsWith('http://')) {
      let long1 = 'http://'.concat(long);
      urlDatabase[short] = { longURL: long1, userID: req.cookies.user_id };
    }else {
      urlDatabase[short] = { longURL: req.body.longURL, userID: req.cookies.user_id };
    }
    res.redirect(`/urls`);
  } else {
    res.redirect('/login');
  }
});

app.post("/urls/:shortURL/delete", (req, res) => {
  delete urlDatabase[req.params.shortURL];
  res.redirect('/urls');
});

app.post("/urls/:shortURL", (req, res) => {
  res.redirect(`/urls/${req.params.shortURL}`);
});

app.post("/login", (req, res) => {
  if (findUserByEmail(req.body.email)) {
    let user = findUserByEmail(req.body.email);
    if (users[user].password === req.body.password){
      res.cookie('user_id', users[user].id);
      res.redirect('/urls');
      return;
    }
    if (users[user].password !== req.body.password) {
      res.status(403).send('incorrect password');
    }
  }
  res.status(403).send('email not registered');
});

app.post("/logout", (req, res) => {
  res.clearCookie('user_id');
  res.redirect('/urls');
});

app.post("/register", (req, res) => {
  let id = generateRandomString();
  let user = 'user'.concat(id);
  if (findUserByEmail(req.body.email)) {
    res.status(400).send('email registered');
    return;
  }
  if (req.body.email === '') {
    res.status(400).send('email cannot be empty');
    return;
  }
  if (req.body.password === '') {
    res.status(400).send('password cannot be empty');
    return;
  }
  users[user] = {
    id: id,
    email: req.body.email,
    password: req.body.password
  }
  res.cookie("user_id", id);
  res.redirect('/urls');
})

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});