const sqlite = require("sqlite3");
const fs = require("fs");

const db = new sqlite.Database("./test.db");
if (!fs.existsSync("./test.db")) {
  db.serialize(() => {
    db.run("CREATE TABLE keys(user_code INT, timestamp INT, count INT)");

    let start = new Date(2024, 1, 11, 7).getTime();
    let end = new Date(2024, 1, 11, 20).getTime();
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
    start = new Date(2023, 1, 3).getTime();
    end = new Date(2023, 1, 11).getTime();
    for (
      let i = start;
      i <= end;
      i += Math.floor(Math.random() * 3600000 * 12)
    ) {
      let j = i + Math.floor(Math.random() * 3600000 * 2);
      db.run(
        "INSERT INTO sites VALUES(?, ?, ?, ?)",
        999,
        Math.random() < 0.5 ? "twitter.com" : "youtube.com",
        i,
        j
      );
      i = j;
    }

    db.run("CREATE TABLE sleeps(user_code INT, start INT, end INT)");
    for (let i = 3; i <= 10; i++) {
      db.run(
        "INSERT INTO sleeps VALUES(?, ?, ?)",
        999,
        new Date(
          2024,
          1,
          i,
          20 + Math.floor(Math.random() * 6),
          Math.floor(Math.random() * 60)
        ).getTime(),
        new Date(
          2024,
          1,
          i + 1,
          4 + Math.floor(Math.random() * 6),
          Math.floor(Math.random() * 60)
        ).getTime()
      );
    }
  });
}
