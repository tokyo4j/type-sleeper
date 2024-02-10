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
        label: "タイピング数",
        borderColor: "rgb(75, 192, 192)",
        backgroundColor: "rgba(75, 192, 192, 0.5)",
        data: [],
      },
    ],
  });

  useEffect(() => {
    if (data.length === 0) return; // データが空の場合は処理を終了

    // 本日の開始と終了のタイムスタンプを取得
    const todayStartTimestamp = new Date().setHours(0, 0, 0, 0);
    const todayEndTimestamp = new Date().setHours(23, 59, 59, 999);

    // 本日のデータを抽出
    const filteredData = data.filter(({ timestamp }) => timestamp >= todayStartTimestamp && timestamp <= todayEndTimestamp);

    if (filteredData.length === 0) return; // 今日のデータがない場合は処理を終了

    // timestampの最小値と最大値を取得
    const minTimestamp = todayStartTimestamp;
    const maxTimestamp = todayEndTimestamp;

    // 1時間ごとのグループ化し、合計を計算する
    const groupedData: GroupedData = filteredData.reduce<GroupedData>((acc, { timestamp, count }) => {
      const key = Math.floor((timestamp - minTimestamp) / (60 * 60 * 1000)) * (60 * 60 * 1000) + minTimestamp;

      if (!acc[key]) {
        acc[key] = { total: 0, timestamp: key };
      }

      acc[key].total += count;

      return acc;
    }, {});

    // タイムスタンプの範囲内で1時間ごとのデータを生成
    const timestamps: number[] = [];
    for (let time = minTimestamp; time <= maxTimestamp; time += 60 * 60 * 1000) {
      timestamps.push(time);
    }

    const counts = timestamps.map(timestamp => groupedData[timestamp]?.total ?? 0); // もしデータがない場合は0をセットする
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
