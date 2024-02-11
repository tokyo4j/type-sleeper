const express = require("express");
const sqlite = require("sqlite3");
const bodyParser = require("body-parser");
const jwt = require("jsonwebtoken");
const fs = require("fs");
const cookieParser = require("cookie-parser");
const cors = require("cors");

const SECRET = "foobar";
const OPTIONS = {
  algorithm: "HS256",
};

require("./gen_sample.js");
const db = new sqlite.Database("./test.db");

const app = express();
const PORT = 8080;

app.use(cors());

app.use(cookieParser());
app.use(bodyParser.json());

function authenticate(req, res) {
  const token = req.cookies.token || req.headers.authorization;
  if (!token) {
    res.redirect("/login");
    return null;
  }
  try {
    const decoded = jwt.verify(token, SECRET, OPTIONS);
    return decoded.user_code;
  } catch (e) {
    res.redirect("/login");
    return null;
  }
}

app.get("/", (req, res) => {
  if (!authenticate(req, res)) return;
  res.sendFile(__dirname + "/frontend/dist/src/index/index.html");
});

app.get("/login", (req, res) => {
  res.sendFile(__dirname + "/frontend/dist/src/login/login.html");
});

app.use(express.static("frontend/dist"));

app.post("/key", (req, res) => {
  const user_code = authenticate(req, res);
  if (!user_code) return;
  db.run(
    "INSERT INTO keys VALUES (?, ?, ?)",
    user_code,
    req.body.timestamp,
    req.body.count
  );
  res.send("ok");
});

app.get("/keys", (req, res) => {
  const user_code = authenticate(req, res);
  if (!user_code) return;
  db.all("SELECT * FROM keys WHERE user_code = ?", user_code, (err, rows) => {
    res.status(200).json(rows);
  });
});

app.post("/login", (req, res) => {
  db.all(
    "SELECT user_name, password FROM users WHERE user_code = ?",
    req.body.user_code,
    (err, rows) => {
      if (!rows || rows.length != 1 || rows[0].password != req.body.password) {
        res.status(401).send("Login failed");
        return;
      }
      const token = jwt.sign(
        { user_code: req.body.user_code },
        SECRET,
        OPTIONS
      );
      res
        .status(200)
        .cookie("token", token)
        .json({ token, user_name: rows[0].user_name });
    }
  );
});

WHITE_LIST = ["twitter.com", "youtube.com"];
// Map user code to the site the user is currently viewing
const sites = {};
app.post("/site", (req, res) => {
  const user_code = authenticate(req, res);
  if (!user_code) return;
  const site = req.body.site;
  const now = Date.now();
  console.log("/site", site);
  if (!sites[user_code]) {
    sites[user_code] = {
      name: site,
      start: now,
      end: now,
    };
  } else {
    sites[user_code].end = now;
    if (sites[user_code].name != site) {
      if (WHITE_LIST.includes(sites[user_code].name)) {
        db.run(
          "INSERT INTO sites VALUES(?, ?, ?, ?)",
          user_code,
          sites[user_code].name,
          sites[user_code].start,
          sites[user_code].end
        );
        console.log(
          user_code,
          sites[user_code].name,
          sites[user_code].start,
          sites[user_code].end
        );
      }

      sites[user_code] = {
        name: site,
        start: now,
        end: now,
      };
    } else {
      sites[user_code].end = Date.now();
    }
    res.send("ok");
  }
});
setInterval(() => {
  const now = Date.now();
  for (user_code in sites) {
    if (now - sites[user_code].end > 10000) {
      sites[user_code].end = now;
      if (WHITE_LIST.includes(sites[user_code].name))
        db.run(
          "INSERT INTO sites VALUES(?, ?, ?, ?)",
          user_code,
          sites[user_code].name,
          sites[user_code].start,
          sites[user_code].end
        );
      console.log(
        user_code,
        sites[user_code].name,
        sites[user_code].start,
        sites[user_code].end,
        "(timeout)"
      );
      delete sites[user_code];
    }
  }
}, 5000);

app.get("/sites", (req, res) => {
  const user_code = authenticate(req, res);
  if (!user_code) return;
  db.all("SELECT * FROM sites WHERE user_code = ?", user_code, (err, rows) => {
    res.status(200).json(rows);
  });
});

const sleeps = {};
app.post("/sleep", (req, res) => {
  const user_code = authenticate(req, res);
  if (!user_code) return;
  const now = Date.now();
  if (req.body.type == "start") {
    sleeps[user_code] = now;
  } else if (req.body.type == "end") {
    if (!sleeps[user_code]) {
      res.status(400).send('Corresponding "start" request not found');
      return;
    }
    db.run(
      "INSERT INTO sleeps VALUES(?, ?, ?)",
      user_code,
      sleeps[user_code],
      now
    );
    console.log(user_code, sleeps[user_code], now);
    delete sleeps[user_code];
  }
  res.send("ok");
});

app.get("/sleeps", (req, res) => {
  const user_code = authenticate(req, res);
  if (!user_code) return;
  db.all("SELECT * FROM sleeps WHERE user_code = ?", user_code, (err, rows) => {
    if (sleeps[user_code]) {
      rows.push({
        user_code,
        start: sleeps[user_code],
      });
    }
    res.status(200).json(rows);
  });
});

app.listen(PORT, () => {
  console.log(`Listening on port ${PORT}...`);
});
