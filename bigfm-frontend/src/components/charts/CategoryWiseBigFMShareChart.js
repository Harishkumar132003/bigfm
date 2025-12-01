import React, { useEffect, useState } from "react";
import axios from "axios";
import CommonBarChart from '../../commonComponent/commonBarchart';

const CategoryWiseBigFMShare = () => {
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const baseUrl = process.env.REACT_APP_API_BASE_URL || "";
        const res = await axios.get(`${baseUrl}/getCategoryWiseBigFMShare`);

        const formatted = (res.data.records || []).map((item) => ({
          name: item.Category,
          seconds: item.Seconds,       // seconds
          value: item.MarketShare     // %
        }));

        setChartData(formatted);
        console.log(formatted)
      } catch (e) {
        console.error("Error loading category wise data", e);
      }
      setLoading(false);
    };

    fetchData();
  }, []);

  if (loading) return <p>Loading...</p>;

  return (
    <div style={{ width: "100%", height: "350px" }}>
      <CommonBarChart
        data={chartData}
        title=""
        axislables={["Market Share %", "Category"]}
        customewidth={chartData.length > 6 ? `${chartData.length * 130}px` : "100%"}
      />
    </div>
  );
};

export default CategoryWiseBigFMShare;
