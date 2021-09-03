const express = require("express");
const app = express();
const PORT = 8080;
var cookieParser = require('cookie-parser');

app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

function generateRandomString() {
let out = '';
let base = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
for (let i = 0; i < 6; i++) out += base.charAt(Math.floor(Math.random()*base.length))
return out;
}

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/hello", (req, res) => {
  const templateVars = { greeting: 'Hello World' };
  res.render("hello_world", templateVars);
});

app.get("/urls", (req, res) => {
  const templateVars = { urls: urlDatabase };
  res.render('urls_index', templateVars);
});

app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});

app.get("/urls/:shortURL", (req, res) => {
  const templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL] };
  res.render("urls_show", templateVars);
});

app.get("/u/:shortURL", (req, res) => {
  res.redirect(urlDatabase[req.params.shortURL]);
});

app.post("/urls", (req, res) => {
  let short = generateRandomString();
  let long = req.body.longURL;
  if (!long.startsWith('http://')) {
    let long1 = 'http://'.concat(long);
    urlDatabase[short] = long1;
  }else {
    urlDatabase[short] = req.body.longURL;
  }
  res.redirect(`/urls/${short}`);
});

app.post("/urls/edit/:id", (req, res) => {
  let short = req.params.id;
  let long = req.body.longURL;
  if (!long.startsWith('http://')) {
    let long1 = 'http://'.concat(long);
    urlDatabase[short] = long1;
  }else {
    urlDatabase[short] = req.body.longURL;
  }
  res.redirect(`/urls`);
});

app.post("/urls/:shortURL/delete", (req, res) => {
  delete urlDatabase[req.params.shortURL];
  res.redirect('/urls');
});

app.post("/urls/:shortURL", (req, res) => {
  res.redirect(`/urls/${req.params.shortURL}`);
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});