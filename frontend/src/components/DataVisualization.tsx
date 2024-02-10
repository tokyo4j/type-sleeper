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

interface DataVisualizationProps {
  data: { user_code: number; timestamp: number; count: number }[];
}

function DataVisualization({ data }: DataVisualizationProps) {
  // 明示的な型定義を用いたuseStateの初期化
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
    const timestamps = data.map(item => new Date(item.timestamp * 1000).toLocaleString());
    const counts = data.map(item => item.count);

    setChartData({
      labels: timestamps,
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
