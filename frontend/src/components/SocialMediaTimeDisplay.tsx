import React, { useEffect, useState } from "react";

interface SiteData {
  user_code: number;
  name: string;
  start: number;
  end: number;
}

const SocialMediaTimeDisplay: React.FC = () => {
  const [sites, setSites] = useState<SiteData[]>([]);

  useEffect(() => {
    fetch("/sites")
      .then(res => res.json())
      .then(data => setSites(data))
      .catch(error => console.error("Error fetching site data:", error));
  }, []);

  return (
    <div>
      <h2 className="text-2xl font-semibold mb-4">SNS等の使用時間</h2>
      <table className="min-w-full table-auto">
        <thead className="bg-gray-200">
          <tr>
            <th className="px-4 py-2">サイト名</th>
            <th className="px-4 py-2">開始時間</th>
            <th className="px-4 py-2">終了時間</th>
          </tr>
        </thead>
        <tbody>
          {sites.map((site, index) => (
            <tr key={index} className="border-b">
              <td className="px-4 py-2">{site.name}</td>
              <td className="px-4 py-2">{new Date(site.start).toLocaleTimeString()}</td>
              <td className="px-4 py-2">{new Date(site.end).toLocaleTimeString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default SocialMediaTimeDisplay;
