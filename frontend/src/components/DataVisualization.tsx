import { useEffect, useState } from "react";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

interface GroupedData {
  [key: number]: {
    total: number;
    timestamp: number;
  };
}

interface DataVisualizationProps {
  data: { user_code: number; timestamp: number; count: number }[];
}

function DataVisualization({ data }: DataVisualizationProps) {
  const [chartData, setChartData] = useState<{
    labels: string[];
    datasets: Array<{
      label: string;
      borderColor: string;
      backgroundColor: string;
      data: number[];
    }>;
  }>({
    labels: [],
    datasets: [
      {
        label: "タイピング数",
        borderColor: "rgb(75, 192, 192)",
        backgroundColor: "rgba(75, 192, 192, 0.5)",
        data: [],
      },
    ],
  });

  const [todayTotalTypings, setTodayTotalTypings] = useState<number>(0);
  const [totalTypings, setTotalTypings] = useState<number>(0);
  const [differenceFromYesterday, setDifferenceFromYesterday] =
    useState<number>(0);

  useEffect(() => {
    if (data.length === 0) return;

    const todayStartTimestamp = new Date().setHours(0, 0, 0, 0);
    const todayEndTimestamp = new Date().setHours(23, 59, 59, 999);

    // 昨日の日付を設定
    const yesterdayDate = new Date();
    yesterdayDate.setDate(yesterdayDate.getDate() - 1);

    // 昨日の開始時刻と終了時刻を正しく設定
    const yesterdayStartTimestamp = new Date(yesterdayDate).setHours(
      0,
      0,
      0,
      0
    );
    const yesterdayEndTimestamp = new Date(yesterdayDate).setHours(
      23,
      59,
      59,
      999
    );

    const total = data.reduce((acc, { count }) => acc + count, 0);
    setTotalTypings(total);

    const todayData = data.filter(
      ({ timestamp }) =>
        timestamp >= todayStartTimestamp && timestamp <= todayEndTimestamp
    );
    const todayTotal = todayData.reduce((acc, { count }) => acc + count, 0);
    setTodayTotalTypings(todayTotal);

    const yesterdayData = data.filter(
      ({ timestamp }) =>
        timestamp >= yesterdayStartTimestamp &&
        timestamp <= yesterdayEndTimestamp
    );
    const yesterdayTotal = yesterdayData.reduce(
      (acc, { count }) => acc + count,
      0
    );
    const difference = todayTotal - yesterdayTotal;
    setDifferenceFromYesterday(difference);

    const filteredData = todayData;

    if (filteredData.length === 0) return;

    const groupedData: GroupedData = filteredData.reduce<GroupedData>(
      (acc, { timestamp, count }) => {
        const key =
          Math.floor((timestamp - todayStartTimestamp) / (60 * 60 * 1000)) *
            (60 * 60 * 1000) +
          todayStartTimestamp;

        if (!acc[key]) {
          acc[key] = { total: 0, timestamp: key };
        }

        acc[key].total += count;

        return acc;
      },
      {}
    );

    const timestamps: number[] = [];
    for (
      let time = todayStartTimestamp;
      time <= todayEndTimestamp;
      time += 60 * 60 * 1000
    ) {
      timestamps.push(time);
    }

    const counts = timestamps.map(
      (timestamp) => groupedData[timestamp]?.total ?? 0
    );
    const labels = timestamps.map((timestamp) =>
      new Date(timestamp).toLocaleString()
    );

    setChartData({
      labels,
      datasets: [
        {
          ...chartData.datasets[0],
          data: counts,
        },
      ],
    });
  }, [data]);

  return (
    <>
      <div className="bg-white shadow-xl rounded-lg p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 shadow rounded-lg text-center bg-white">
            <div className="text-xl font-semibold">本日のタイピング数</div>
            <div className="text-3xl text-blue-500">{todayTotalTypings}</div>
          </div>
          <div className="p-4 shadow rounded-lg text-center bg-white">
            <div className="text-xl font-semibold">総タイピング数</div>
            <div className="text-3xl text-green-500">{totalTypings}</div>
          </div>
          <div className="p-4 shadow rounded-lg text-center bg-white">
            <div className="text-xl font-semibold">昨日との差分</div>
            <div
              className={`text-3xl ${
                differenceFromYesterday >= 0 ? "text-blue-500" : "text-red-500"
              }`}
            >
              {differenceFromYesterday}
            </div>
          </div>
        </div>
        <div className="mt-8">
          <Line data={chartData} />
        </div>
      </div>
    </>
  );
}

export default DataVisualization;
