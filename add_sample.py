import time
import requests
from datetime import datetime, timedelta
import math

# ログインしてトークンを取得
token = requests.post(
    "http://localhost:8080/login",
    # json={"user_code": 999, "password": "pass"},
    json={"user_code": 101, "password": "hello"},
).json()["token"]
print("token=", token)

# 現在の時刻を取得
current_time = datetime.now() - timedelta(days=1)

# 昨日の時刻を取得
# yesterday_time = current_time - timedelta(days=1)

# 午前11時の時刻を設定
start_time = current_time.replace(hour=11, minute=0, second=0, microsecond=0)

# 午後11時の時刻を設定
end_time = current_time.replace(hour=23, minute=0, second=0, microsecond=0)

# 開始timestamp（現在の時刻が午前11時より前の場合は、午前11時から、午後11時より後の場合は翌日の午前11時から開始）
if current_time < start_time:
    start_timestamp = start_time.timestamp()
else:
    start_timestamp = (current_time + timedelta(days=1)).replace(hour=11, minute=0, second=0, microsecond=0).timestamp()

# 1周期の秒数を設定（3時間）
cycle_seconds = 3 * 60 * 60

# 経過時間のシミュレーション用
elapsed_time = 0

while elapsed_time <= (end_time - start_time).total_seconds():
    # 自動でtimestampを更新
    simulated_timestamp = start_timestamp + elapsed_time
    # sin関数を使用して、0から30の範囲の値を生成
    count = int((math.sin(elapsed_time / (cycle_seconds / (2 * math.pi))) + 1) * 13)  # 0から30の範囲で変動

    # 生成したデータをサーバに送信
    requests.post(
        "http://localhost:8080/key",
        headers={"authorization": token},
        json={
            "timestamp": int(simulated_timestamp * 1000),
            "count": count,
        },
    )

    # 5秒ごとのシミュレーション
    elapsed_time += 5
    time.sleep(0.01)  # 実際の待機時間を短くして全体の実行時間を短縮

print("データ送信完了")
