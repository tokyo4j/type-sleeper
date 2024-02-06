const express = require("express");
const sqlite = require("sqlite3");
const bodyParser = require("body-parser");
const jwt = require("jsonwebtoken");
const fs = require("fs");

const SECRET = "foobar";
const OPTIONS = {
  algorithm: "HS256",
  expiresIn: "10m",
};

const db_exists = fs.existsSync("./test.db");
const db = new sqlite.Database("./test.db");
db.serialize(() => {
  db.run(
    "CREATE TABLE IF NOT EXISTS keys(user_code INT, timestamp DATETIME, count INT)"
  );
  db.run(
    "CREATE TABLE IF NOT EXISTS users(user_code INT, password VARCHAR(64), user_name VARCHAR(64))"
  );
  if (!db_exists) db.run("INSERT INTO users VALUES(999, 'pass', 'admin')");
  db.all("SELECT * FROM users;", (err, rows) => {
    console.log(rows);
  });
});

const app = express();
const PORT = 8080;

app.use(bodyParser.json());
app.use(express.static("frontend/dist"));

app.get("/", (req, res) => {
  res.send("Hello World!");
});

// app.get("/hello", (req, res) => {
//   res.sendFile(__dirname + "/frontend/dist/index.html");
// });

app.post("/key", (req, res) => {
  const user_code = jwt.verify(
    req.headers.authorization,
    SECRET,
    OPTIONS
  ).user_code;
  if (!user_code) res.status(401).send();
  db.run(
    "INSERT INTO keys VALUES (?, ?, ?)",
    user_code,
    req.body.timestamp,
    req.body.count
  );
  res.send("ok");
});

app.get("/key", (req, res) => {
  const user_code = jwt.verify(
    req.headers.authorization,
    SECRET,
    OPTIONS
  ).user_code;
  if (!user_code) res.status(401).send();
  db.all("SELECT * FROM keys", (err, rows) => {
    res.status(200).json(rows);
  });
});

app.post("/login", (req, res) => {
  console.log(req.body);
  db.all(
    "SELECT password FROM users WHERE user_code = ?",
    req.body.user_code,
    (err, rows) => {
      console.log("rows", rows);
      if (rows.length != 1 || rows[0].password != req.body.password) {
        console.log("login failed");
        return;
      }
      const token = jwt.sign(
        { user_code: req.body.user_code },
        SECRET,
        OPTIONS
      );
      res.status(200).json({ token });
    }
  );
});

app.listen(PORT, () => {
  console.log(`Listening on port ${PORT}...`);
});
