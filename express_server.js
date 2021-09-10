const express = require("express");
const app = express();
const PORT = 8080;

app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));

const cookieSession = require('cookie-session');
app.use(cookieSession({
  name: 'session',
  keys: ['encrypt']
}));

const methodOverride = require('method-override');
app.use(methodOverride('_method'));

const bcrypt = require('bcrypt');

const { getUserByEmail, generateRandomString, } = require('./helpers.js');

const urlDatabase = {};
const users = {};

app.get("/urls", (req, res) => {
  let urlUserDatabase = {};
  for (let url in urlDatabase) {
    if (urlDatabase[url].userID === req.session.user_id) {
      urlUserDatabase[url] = urlDatabase[url];
    }
  }
  const templateVars = { urls: urlUserDatabase, user: users['user'.concat(req.session.user_id)] };
  res.render('urls_index', templateVars);
});

app.get("/urls/all", (req, res) => {
  const templateVars = { urls: urlDatabase, user: users['user'.concat(req.session.user_id)] };
  res.render('urls_all', templateVars);
  console.log(urlDatabase);
  console.log(users);
});

app.get("/urls/new", (req, res) => {
  const templateVars = { user: users['user'.concat(req.session.user_id)] };
  res.render("urls_new", templateVars);
});

app.get("/urls/:shortURL", (req, res) => {
  const templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL].longURL, user: users['user'.concat(req.session.user_id)] };
  if (!req.session.user_id) {
    res.status(403).send('Please login to see urls');
  } else if (urlDatabase[req.params.shortURL].userID  === req.session.user_id) {
    res.render("urls_show", templateVars);
  } else {
    res.status(403).send("This url does not belong to you, you can't see it");
  }
});

app.get("/u/:shortURL", (req, res) => {
  urlDatabase[req.params.shortURL].clicks = urlDatabase[req.params.shortURL].clicks + 1;
  if (req.session.user_id) {
    if (!urlDatabase[req.params.shortURL].visits.includes(req.session.user_id)) {
      urlDatabase[req.params.shortURL].visits.push(req.session.user_id);
    }
  }
  res.redirect(urlDatabase[req.params.shortURL].longURL);
});

app.get("/register", (req, res) => {
  const templateVars = { user: users['user'.concat(req.session.user_id)] };
  res.render("urls_register", templateVars);
});

app.get("/login", (req, res) => {
  const templateVars = { user: users['user'.concat(req.session.user_id)] };
  res.render("urls_login", templateVars);
});

app.post("/urls", (req, res) => {
  if (req.session.user_id) {
    let short = generateRandomString();
    let long = req.body.longURL;
    if (!long.startsWith('http://')) {
      let long1 = 'http://'.concat(long);
      urlDatabase[short] = { longURL: long1, userID: req.session.user_id, clicks: 0, visits: [] };
    } else {
      urlDatabase[short] = { longURL: req.body.longURL, userID: req.session.user_id, clicks: 0, visits: [] };
    }
    res.redirect(`/urls/${short}`);
  } else {
    res.redirect('/login');
  }
});

app.put("/urls/edit/:id", (req, res) => {
  if (!req.session.user_id) {
    res.status(403).send('Please login to edit urls');
  } else if (urlDatabase[req.params.id].userID  === req.session.user_id) {
    let short = req.params.id;
    let long = req.body.longURL;
    if (!long.startsWith('http://')) {
      let long1 = 'http://'.concat(long);
      urlDatabase[short] = { longURL: long1, userID: req.session.user_id, clicks: 0, visits: [] };
    } else {
      urlDatabase[short] = { longURL: req.body.longURL, userID: req.session.user_id, clicks: 0, visits: [] };
    }
    res.redirect(`/urls`);
  } else {
    res.status(403).send("This url does not belong to you, you can't edit it");
  }
});

app.delete("/urls/:shortURL/delete", (req, res) => {
  if (!req.session.user_id) {
    res.status(403).send('Please login to delete urls');
  } else if (urlDatabase[req.params.shortURL].userID  === req.session.user_id) {
    delete urlDatabase[req.params.shortURL];
    res.redirect('/urls');
  } else {
    res.status(403).send("This url does not belong to you, you can't delete it");
  }
});

app.post("/urls/:shortURL", (req, res) => {
  res.redirect(`/urls/${req.params.shortURL}`);
});

app.post("/login", (req, res) => {
  if (getUserByEmail(req.body.email, users)) {
    let user = getUserByEmail(req.body.email, users);
    if (bcrypt.compareSync(req.body.password, users[user].password)) {
      req.session.user_id = users[user].id;
      res.redirect('/urls');
      return;
    }
    if (users[user].password !== req.body.password) {
      res.status(403).send('incorrect password');
      return;
    }
  }
  res.status(403).send('email not registered');
});

app.delete("/logout", (req, res) => {
  req.session = null;
  res.redirect('/urls');
});

app.put("/register", (req, res) => {
  let id = generateRandomString();
  let user = 'user'.concat(id);
  if (getUserByEmail(req.body.email, users)) {
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
    password: bcrypt.hashSync(req.body.password, 10)
  };
  req.session.user_id = id;
  res.redirect('/urls');
});

app.post("/count", (req, res) => {
  urlDatabase[req.body.shortURL].clicks = urlDatabase[req.body.shortURL].clicks + 1;
  if (req.session.user_id) {
    if (!urlDatabase[req.body.shortURL].visits.includes(req.session.user_id)) {
      urlDatabase[req.body.shortURL].visits.push(req.session.user_id);
    }
  }
  res.redirect(urlDatabase[req.body.shortURL].longURL);
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});