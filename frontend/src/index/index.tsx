import React, { useEffect, useState } from "react";
import ReactDOM from "react-dom/client";
import "../index.css";
import DataVisualization from "../components/DataVisualization";

const Index = () => {
  const [keys, setKeys] = useState();
  useEffect(() => {
    fetch("/key")
      .then((res) => res.json())
      .then((res) => {
        setKeys(res);
      });
  }, []);
  return (
  <div className="min-h-screen bg-gray-100 p-8">
    <h1 className="text-3xl font-bold text-emerald-500 mb-4">Vite + React</h1>
    <p className="mb-8 text-lg text-gray-700">
      タイピング速度を可視化するグラフを表示します。
    </p>
    <div className="bg-white shadow-xl rounded-lg p-6">
      {keys ? <DataVisualization data={keys} /> : <p>データを読み込んでいます...</p>}
    </div>
  </div>
  );
};

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <Index></Index>
  </React.StrictMode>
);
