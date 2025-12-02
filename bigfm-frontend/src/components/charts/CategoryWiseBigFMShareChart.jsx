import React, { useEffect, useState } from "react";
import axios from "axios";
import CommonBarChart from '../../commonComponent/commonBarchart';
import { GET_CATEGORY_LIST } from '../../apiurls';

const CategoryWiseBigFMShare = ({filters}) => {
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
         const params = {};
      if (filters.month) params.month = filters.month;
      if (filters.year) params.year = filters.year;
      if (filters.week) params.week = filters.week;

        const res = await axios.get(GET_CATEGORY_LIST, {
        params,
      });

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
  }, [filters]);

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
