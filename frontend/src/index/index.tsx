import React, { useEffect, useState } from "react";
import ReactDOM from "react-dom/client";
import "../index.css";
import DataVisualization from "../components/DataVisualization";
import SleepTimeDisplay from "../components/SleepTimeDisplay"; // 新しいコンポーネントをインポート

interface KeyData {
  user_code: number;
  timestamp: number;
  count: number;
}

enum DisplayState {
  TypingResult,
  SleepTimeDisplay
}

const Index = () => {
  const [keys, setKeys] = useState<KeyData[]>([]);
  const [displayState, setDisplayState] = useState(DisplayState.TypingResult); // 現在の表示状態を管理

  useEffect(() => {
    fetch("/key")
      .then((res) => res.json())
      .then((res) => {
        setKeys(res);
      });
  }, []);

  // 本日の日付を取得
  const today = new Date().toLocaleDateString();

  // 本日のタイピング合計数を計算
  const todayTypingCount = keys
    ? keys.reduce((acc, current) => {
        // timestampを日付に変換して比較（ミリ秒単位なので1000をかける）
        const keyDate = new Date(current.timestamp).toLocaleDateString();
        if (keyDate === today) {
          acc += current.count;
        }
        return acc;
      }, 0)
    : 0;

  // 昨日の日付を取得
  const yesterday = new Date(Date.now() - 86400000).toLocaleDateString(); // 86400000ミリ秒 = 1日

  // 昨日のタイピング合計数を計算
  const yesterdayTypingCount = keys
    ? keys.reduce((acc, current) => {
        // timestampを日付に変換して比較（ミリ秒単位なので1000をかける）
        const keyDate = new Date(current.timestamp).toLocaleDateString();
        if (keyDate === yesterday) {
          acc += current.count;
        }
        return acc;
      }, 0)
    : 0;

  // 本日の合計数と昨日の合計数との差分を計算
  const diffFromYesterday = todayTypingCount - yesterdayTypingCount;

  // プラスマイナスを数値の先頭に表示する
  const diffWithSign = diffFromYesterday >= 0 ? `+${diffFromYesterday}` : diffFromYesterday;

  // タイピング結果画面へ切り替える
  const switchToTypingResult = () => {
    setDisplayState(DisplayState.TypingResult);
  };

  // 睡眠時間表示画面へ切り替える
  const switchToSleepTimeDisplay = () => {
    setDisplayState(DisplayState.SleepTimeDisplay);
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      {/* ヘッダー部分 */}
      <header className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-emerald-500">タイピング & スリープ</h1>
        {/* ボタンをクリックして各画面に切り替え */}
        <div>
          <button
            className={`mr-4 px-4 py-2 ${displayState === DisplayState.TypingResult ? 'bg-emerald-500 text-white' : 'bg-gray-300 text-gray-700'} rounded-lg shadow-md hover:bg-emerald-600`}
            onClick={switchToTypingResult}
          >
            タイピング結果
          </button>
          <button
            className={`px-4 py-2 ${displayState === DisplayState.SleepTimeDisplay ? 'bg-emerald-500 text-white' : 'bg-gray-300 text-gray-700'} rounded-lg shadow-md hover:bg-emerald-600`}
            onClick={switchToSleepTimeDisplay}
          >
            睡眠時間表示
          </button>
        </div>
      </header>
      <div className="bg-white shadow-xl rounded-lg p-6">
        {/* 現在の表示状態に応じてコンポーネントを描画 */}
        {displayState === DisplayState.TypingResult ? (
          keys.length > 0 ? (
            <>
              <p className="text-3xl font-extrabold mb-4">本日のタイピング合計数: <span className="text-5xl text-emerald-500">{todayTypingCount}</span></p>
              <p className="text-xl font-semibold mb-2">昨日との差分: <span className={diffFromYesterday >= 0 ? "text-blue-500" : "text-red-500"}>{diffWithSign}</span></p>
              <DataVisualization data={keys} />
            </>
          ) : (
            <p>データを読み込んでいます...</p>
          )
        ) : (
          <SleepTimeDisplay />
        )}
      </div>
    </div>
  );
};

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <Index />
  </React.StrictMode>
);
