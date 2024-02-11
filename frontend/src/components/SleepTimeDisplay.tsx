import React, { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";

interface SleepData {
  user_code: number;
  start: number;
  end: number | null; // number 型または null を許容
}

const SleepTimeDisplay: React.FC = () => {
  const [sleeps, setSleeps] = useState<SleepData[]>([]);
  const [chartData, setChartData] = useState<any[]>([]);
  const [awake, setAwake] = useState<boolean>(true);

  function syncSleeps() {
    return fetch("/sleeps")
      .then((res) => res.json())
      .then((data) => {
        const sortedData = data.sort(
          (a: SleepData, b: SleepData) => a.start - b.start
        );
        setSleeps(sortedData);
        setChartData(processChartData(sortedData));
        setAwake(data.at(-1).end);
      })
      .catch((error) => console.error("Error fetching sleep data:", error));
  }

  useEffect(() => {
    syncSleeps();
  }, []);

  const processChartData = (sleeps: SleepData[]) => {
    const dataMap: { [key: string]: { name: string; sleepHours: number } } = {};

    sleeps.forEach((sleep) => {
      const date = new Date(sleep.start).toLocaleDateString();
      const duration = sleep.end
        ? (sleep.end - sleep.start) / (1000 * 60 * 60)
        : 0;

      if (!dataMap[date]) {
        dataMap[date] = { name: date, sleepHours: 0 };
      }

      dataMap[date].sleepHours += duration;
    });

    return Object.values(dataMap);
  };

  const formatDuration = (milliseconds: number) => {
    const hours = Math.floor(milliseconds / (1000 * 60 * 60));
    const minutes = Math.floor((milliseconds % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}時間${minutes}分`;
  };

  const handleSleep = () => {
    fetch("/sleep", {
      headers: {
        "content-type": "application/json",
      },
      method: "POST",
      body: JSON.stringify({ type: "start" }),
    }).then((res) => {
      if (res.ok) {
        syncSleeps();
      }
    });
  };

  const handleWakeUp = () => {
    fetch("/sleep", {
      headers: {
        "content-type": "application/json",
      },
      method: "POST",
      body: JSON.stringify({ type: "end" }),
    }).then((res) => {
      if (res.ok) {
        syncSleeps();
      }
    });
  };

  return (
    <div
      className={`flex flex-col items-center justify-center shadow-xl rounded-lg p-6 bg-white`}
    >
      <h2 className="text-2xl font-semibold mb-6">睡眠時間</h2>
      <div className="flex justify-center space-x-4">
        {awake ? (
          <button
            onClick={handleSleep}
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          >
            就寝
          </button>
        ) : (
          <button
            onClick={handleWakeUp}
            className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
          >
            起床
          </button>
        )}
      </div>
      <div className="w-full lg:w-3/4 xl:w-1/2">
        <BarChart
          width={730}
          height={300}
          data={chartData}
          margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Bar dataKey="sleepHours" fill="#8884d8" name="睡眠時間" />
        </BarChart>
      </div>
      <div className="w-full lg:w-3/4 xl:w-1/2 mb-8">
        <div className="shadow-lg rounded-lg overflow-hidden">
          <table className="min-w-full leading-normal">
            <thead className="bg-gray-200 text-gray-600">
              <tr>
                <th className="px-5 py-3 border-b-2 border-gray-200 text-left text-xs font-semibold uppercase tracking-wider">
                  開始日時
                </th>
                <th className="px-5 py-3 border-b-2 border-gray-200 text-left text-xs font-semibold uppercase tracking-wider">
                  終了日時
                </th>
                <th className="px-5 py-3 border-b-2 border-gray-200 text-left text-xs font-semibold uppercase tracking-wider">
                  睡眠時間
                </th>
              </tr>
            </thead>
            <tbody>
              {sleeps.map((sleep, index) => (
                <tr
                  key={index}
                  className="border-b border-gray-200 hover:bg-gray-100"
                >
                  <td className="px-5 py-2 text-sm">
                    {new Date(sleep.start).toLocaleString()}
                  </td>
                  <td className="px-5 py-2 text-sm">
                    {sleep.end ? new Date(sleep.end).toLocaleString() : "-"}
                  </td>
                  <td className="px-5 py-2 text-sm">
                    {sleep.end ? formatDuration(sleep.end - sleep.start) : "-"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default SleepTimeDisplay;
