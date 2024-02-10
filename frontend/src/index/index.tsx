import React, { useEffect, useState } from "react";
import ReactDOM from "react-dom/client";
import "../index.css";

const Index = () => {
  const [keys, setKeys] = useState();
  useEffect(() => {
    fetch("/key")
      .then((res) => res.json())
      .then((res) => {
        setKeys(res);
      });
  }, []);
  return <div>{keys && JSON.stringify(keys)}</div>;
};

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <Index></Index>
  </React.StrictMode>
);
