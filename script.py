import keyboard
import time
import requests
from datetime import datetime

count = 0


def on_press(key):
    if key == "shift":
        return
    print("pressed:", key)
    global count
    count += 1


keyboard.on_press(on_press)

token = requests.post(
    "http://localhost:8080/login",
    json={
        "user_code": 999,
        "password": "pass",
    },
).json()["token"]
print("token=", token)

while True:
    time.sleep(5)
    requests.post(
        "http://localhost:8080/key",
        headers={"authorization": token},
        json={
            "timestamp": int(datetime.now().timestamp()),
            "count": count,
        },
    )
    count = 0
