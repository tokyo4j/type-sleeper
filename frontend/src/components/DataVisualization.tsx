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
} from 'chart.js';

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
        label: "Count Over Time",
        borderColor: "rgb(75, 192, 192)",
        backgroundColor: "rgba(75, 192, 192, 0.5)",
        data: [],
      },
    ],
  });

  useEffect(() => {
    // 5分間隔でデータをグループ化し、合計を計算する
    const groupedData: GroupedData = data.reduce<GroupedData>((acc, { timestamp, count }) => {
      // 各データポイントを5分間隔のキーにマッピング
      const date = new Date(timestamp);
      const key = new Date(date.getFullYear(), date.getMonth(), date.getDate(), date.getHours(), Math.floor(date.getMinutes() / 5) * 5).getTime();

      if (!acc[key]) {
        acc[key] = { total: 0, timestamp: key };
      }

      acc[key].total += count;

      return acc;
    }, {});

    const timestamps = Object.keys(groupedData).map(Number).sort((a, b) => a - b); // タイムスタンプでソート
    const counts = timestamps.map(key => groupedData[key].total);
    const labels = timestamps.map(timestamp => new Date(timestamp).toLocaleString());

    setChartData({
      labels,
      datasets: [
        {
          ...chartData.datasets[0],
          data: counts,
        },
      ],
    });
  }, [data]); // dataが変更された場合にのみこのeffectを実行

  return <Line data={chartData} />;
}

export default DataVisualization;
