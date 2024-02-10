let token;

chrome.tabs.onUpdated.addListener(function (tabId, changeInfo, tab) {
  console.log(tab.url);
});

chrome.alarms.create("site", { periodInMinutes: 5 / 60 });
chrome.alarms.create("login", { periodInMinutes: 5 });
login();

async function login() {
  return await fetch("http://localhost:8080/login", {
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ user_code: "999", password: "pass" }),
    method: "POST",
  })
    .then((res) => res.json())
    .then((res) => {
      token = res.token;
      console.log("Login success");
    });
}

async function sendSite() {
  console.log(token);
  console.log(chrome.tabs.query({ active: true }));
  const [tab] = await chrome.tabs.query({ active: true });
  const site = new URL(tab.url).hostname;
  await fetch("http://localhost:8080/site", {
    headers: {
      "Content-Type": "application/json",
      authorization: token,
    },
    method: "POST",
    body: JSON.stringify({ site }),
  });
}

chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name == "site") {
    if (!token) {
      login();
      return;
    }
    sendSite();
  } else if (alarm.name == "token") {
    login();
  }
});
