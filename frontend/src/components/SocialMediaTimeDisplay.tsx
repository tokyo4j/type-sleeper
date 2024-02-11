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

interface SiteData {
  user_code: number;
  name: string;
  start: number;
  end: number;
}

const SocialMediaTimeDisplay: React.FC = () => {
  const [sites, setSites] = useState<SiteData[]>([]);
  const [chartData, setChartData] = useState<any[]>([]);

  useEffect(() => {
    fetch("/sites")
      .then((res) => res.json())
      .then((data) => {
        const sortedData = data.sort(
          (a: SiteData, b: SiteData) => a.start - b.start
        );
        setSites(sortedData);
        setChartData(processChartData(sortedData));
      })
      .catch((error) => console.error("Error fetching site data:", error));
  }, []);

  // サイトデータを処理してチャート用のデータを生成
  const processChartData = (sites: SiteData[]) => {
    const dataMap: {
      [key: string]: { name: string; twitter?: number; youtube?: number };
    } = {};

    sites.forEach((site) => {
      const date = new Date(site.start).toLocaleDateString();
      const duration = (site.end - site.start) / 3600000; // 時間に変換

      if (!dataMap[date]) {
        dataMap[date] = { name: date };
      }

      if (site.name === "twitter.com") {
        dataMap[date].twitter = (dataMap[date].twitter || 0) + duration;
      } else if (site.name === "youtube.com") {
        dataMap[date].youtube = (dataMap[date].youtube || 0) + duration;
      }
    });

    return Object.values(dataMap);
  };

  return (
    <div className="flex flex-col items-center justify-center p-4">
      <h2 className="text-2xl font-semibold mb-6">SNS等の使用時間</h2>
      <div className="w-full lg:w-3/4 xl:w-1/2">
        <BarChart
          width={730} // この値は無視され、外側のdivによって幅が制御されます
          height={300}
          data={chartData}
          margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Bar dataKey="twitter" fill="#00ACEE" name="X (旧twitter)" />
          <Bar dataKey="youtube" fill="#FF0000" />
        </BarChart>
      </div>
      <div className="w-full lg:w-3/4 xl:w-1/2 mb-8">
        <div className="shadow-lg rounded-lg overflow-hidden">
          <table className="min-w-full leading-normal">
            <thead className="bg-gray-200 text-gray-600">
              <tr>
                <th className="px-5 py-3 border-b-2 border-gray-200 text-left text-xs font-semibold uppercase tracking-wider">
                  サイト名
                </th>
                <th className="px-5 py-3 border-b-2 border-gray-200 text-left text-xs font-semibold uppercase tracking-wider">
                  開始日時
                </th>
                <th className="px-5 py-3 border-b-2 border-gray-200 text-left text-xs font-semibold uppercase tracking-wider">
                  終了日時
                </th>
              </tr>
            </thead>
            <tbody>
              {sites.map((site, index) => (
                <tr
                  key={index}
                  className="border-b border-gray-200 hover:bg-gray-100"
                >
                  <td className="px-5 py-2 text-sm">{site.name}</td>
                  <td className="px-5 py-2 text-sm">
                    {new Date(site.start).toLocaleString()}
                  </td>
                  <td className="px-5 py-2 text-sm">
                    {new Date(site.end).toLocaleString()}
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

export default SocialMediaTimeDisplay;
