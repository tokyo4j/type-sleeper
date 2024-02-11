import React, { useEffect, useState } from "react";
import ReactDOM from "react-dom/client";
import "../index.css";
import DataVisualization from "../components/DataVisualization";
import SleepTimeDisplay from "../components/SleepTimeDisplay";
import SocialMediaTimeDisplay from "../components/SocialMediaTimeDisplay";

interface KeyData {
  user_code: number;
  timestamp: number;
  count: number;
}

enum DisplayState {
  TypingResult,
  SleepTimeDisplay,
  SocialMediaTimeDisplay,
}

const user_name = localStorage.getItem("user_name");

const Index = () => {
  const [keys, setKeys] = useState<KeyData[]>([]);
  const [displayState, setDisplayState] = useState(DisplayState.TypingResult);

  useEffect(() => {
    fetch("/keys")
      .then((res) => res.json())
      .then((res) => {
        setKeys(res);
      });
  }, []);

  const today = new Date().toLocaleDateString();

  const todayTypingCount =
    keys.reduce((acc, current) => {
      const keyDate = new Date(current.timestamp).toLocaleDateString();
      if (keyDate === today) {
        acc += current.count;
      }
      return acc;
    }, 0) || 0;

  const yesterday = new Date(Date.now() - 86400000).toLocaleDateString();

  const yesterdayTypingCount =
    keys.reduce((acc, current) => {
      const keyDate = new Date(current.timestamp).toLocaleDateString();
      if (keyDate === yesterday) {
        acc += current.count;
      }
      return acc;
    }, 0) || 0;

  const diffFromYesterday = todayTypingCount - yesterdayTypingCount;
  const diffWithSign =
    diffFromYesterday >= 0
      ? `+${diffFromYesterday}`
      : diffFromYesterday.toString();

  return (
    <div
      className={`min-h-screen ${
        displayState === DisplayState.TypingResult
          ? "bg-green-100"
          : displayState === DisplayState.SleepTimeDisplay
          ? "bg-blue-100"
          : "bg-orange-100"
      } p-8`}
    >
      <header className="flex justify-between items-center mb-8">
        <h1
          className={`text-3xl font-bold ${
            displayState === DisplayState.TypingResult
              ? "text-green-500"
              : displayState === DisplayState.SleepTimeDisplay
              ? "text-blue-500"
              : "text-orange-500"
          }`}
        >
          Life Visualizer {user_name && `(${user_name})`}
        </h1>
        <div>
          <button
            className={`mr-4 px-4 py-2 ${
              displayState === DisplayState.TypingResult
                ? "bg-green-500 text-white"
                : "bg-gray-300 text-gray-700"
            } rounded-lg shadow-md hover:bg-green-600`}
            onClick={() => setDisplayState(DisplayState.TypingResult)}
          >
            タイピング結果
          </button>
          <button
            className={`mr-4 px-4 py-2 ${
              displayState === DisplayState.SleepTimeDisplay
                ? "bg-blue-300 text-white"
                : "bg-gray-300 text-gray-700"
            } rounded-lg shadow-md hover:bg-blue-400`}
            onClick={() => setDisplayState(DisplayState.SleepTimeDisplay)}
          >
            睡眠時間表示
          </button>
          <button
            className={`px-4 py-2 ${
              displayState === DisplayState.SocialMediaTimeDisplay
                ? "bg-orange-500 text-white"
                : "bg-gray-300 text-gray-700"
            } rounded-lg shadow-md hover:bg-orange-600`}
            onClick={() => setDisplayState(DisplayState.SocialMediaTimeDisplay)}
          >
            SNS等の使用時間表示
          </button>
        </div>
      </header>
      {displayState === DisplayState.TypingResult && (
        <DataVisualization data={keys} />
      )}
      {displayState === DisplayState.SleepTimeDisplay && <SleepTimeDisplay />}
      {displayState === DisplayState.SocialMediaTimeDisplay && (
        <SocialMediaTimeDisplay />
      )}
    </div>
  );
};

const rootElement = document.getElementById("root");
if (rootElement) {
  ReactDOM.createRoot(rootElement).render(
    <React.StrictMode>
      <Index />
    </React.StrictMode>
  );
} else {
  console.error("Failed to find the root element");
}
