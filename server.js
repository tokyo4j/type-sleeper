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
  expiresIn: "10m",
};

const db = new sqlite.Database("./test.db");
if (!fs.existsSync("./test.db")) {
  db.serialize(() => {
    db.run(
      "CREATE TABLE IF NOT EXISTS keys(user_code INT, timestamp INT, count INT)"
    );
    db.run(
      "CREATE TABLE IF NOT EXISTS users(user_code INT, password VARCHAR(64), user_name VARCHAR(64))"
    );
    db.run(
      "CREATE TABLE IF NOT EXISTS sites(user_code INT, name VARCHAR(64), start INT, end INT)"
    );
    db.run("INSERT INTO users VALUES(999, 'pass', 'admin')");
    const d = new Date(2023, 2, 10);
    db.run(`INSERT INTO keys VALUES
              (999, ${new Date(2023, 2, 10, 0, 0, 0).getTime()}, 4),
              (999, ${new Date(2023, 2, 10, 0, 0, 5).getTime()}, 2),
              (999, ${new Date(2023, 2, 10, 0, 0, 10).getTime()}, 3),
              (999, ${new Date(2023, 2, 10, 0, 0, 15).getTime()}, 5)
          `);
    db.all("SELECT * FROM users", (err, rows) => {
      console.log("users:", rows);
    });
    db.all("SELECT * FROM keys", (err, rows) => {
      console.log("keys:", rows);
    });
  });
}

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

app.get("/key", (req, res) => {
  const user_code = authenticate(req, res);
  if (!user_code) return;
  db.all("SELECT * FROM keys WHERE user_code = ?", user_code, (err, rows) => {
    res.status(200).json(rows);
  });
});

app.post("/login", (req, res) => {
  db.all(
    "SELECT password FROM users WHERE user_code = ?",
    req.body.user_code,
    (err, rows) => {
      if (rows.length != 1 || rows[0].password != req.body.password) {
        res.status(401).send("Login failed");
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

app.listen(PORT, () => {
  console.log(`Listening on port ${PORT}...`);
});
