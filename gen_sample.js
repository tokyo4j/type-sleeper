const sqlite = require("sqlite3");
const fs = require("fs");

const db = new sqlite.Database("./test.db");
if (!fs.existsSync("./test.db")) {
  db.serialize(() => {
    db.run("CREATE TABLE keys(user_code INT, timestamp INT, count INT)");

    const start = new Date(2024, 1, 11, 7).getTime();
    const end = new Date(2024, 1, 11, 20).getTime();
    for (let i = start; i < end; i += 5 * 60 * 1000) {
      db.run(
        "INSERT INTO keys VALUES(?, ?, ?)",
        999,
        i,
        Math.floor(Math.random() * 500)
      );
    }

    db.run(
      "CREATE TABLE users(user_code INT, password VARCHAR(64), user_name VARCHAR(64))"
    );
    db.run("INSERT INTO users VALUES(999, 'pass', 'admin')");

    db.run(
      "CREATE TABLE sites(user_code INT, name VARCHAR(64), start INT, end INT)"
    );
    db.run(
      "INSERT INTO sites VALUES(?, ?, ?, ?)",
      999,
      "twitter.com",
      new Date(2024, 1, 11, 7, 12).getTime(),
      new Date(2024, 1, 11, 8, 23).getTime()
    );
    db.run(
      "INSERT INTO sites VALUES(?, ?, ?, ?)",
      999,
      "youtube.com",
      new Date(2024, 1, 11, 12, 34).getTime(),
      new Date(2024, 1, 11, 13, 45).getTime()
    );

    db.run("CREATE TABLE sleeps(user_code INT, start INT, end INT)");
    db.run(
      "INSERT INTO sleeps VALUES(?, ?, ?)",
      999,
      new Date(2024, 1, 10, 23, 55).getTime(),
      new Date(2024, 1, 11, 6, 45).getTime()
    );
  });
}
