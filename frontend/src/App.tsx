import { useEffect, useState } from "react";
import reactLogo from "./assets/react.svg";
import viteLogo from "/vite.svg";
import "./App.css";
import DataVisualization from "./components/DataVisualization"; // DataVisualizationコンポーネントをインポート

async function login(user_code: string, password: string) {
  return await fetch("http://localhost:8080/login", {
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ user_code, password }),
    method: "POST",
  }).then((res) => res.json());
}

function App() {
  const [data, setData] = useState(null); // フェッチされたデータを保持するためのステート

  useEffect(() => {
    const user_code = prompt("User code:")!;
    const password = prompt("Password:")!;
    login(user_code, password)
      .then(({ token }) =>
        fetch("http://localhost:8080/key", {
          headers: {
            authorization: token,
          },
        })
      )
      .then((res) => res.json())
      .then((res) => {
        // データをステートにセット
        setData(res);
      });
  }, []);

  return (
    <>
      <div>
        <a href="https://vitejs.dev" target="_blank">
          <img src={viteLogo} className="logo" alt="Vite logo" />
        </a>
        <a href="https://react.dev" target="_blank">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
      </div>
      <h1>Vite + React</h1>
      <div className="card">
        {/* <button onClick={() => setCount((count) => count + 1)}>
          count is {count}
        </button>
        <p>
          Edit <code>src/App.tsx</code> and save to test HMR
        </p> */}
      </div>
      <p className="read-the-docs">
        タイピング速度を可視化するグラフを表示します。
      </p>
      {data && <DataVisualization data={data} />} {/* フェッチされたデータがある場合にのみDataVisualizationコンポーネントを表示 */}
    </>
  );
}

export default App;
