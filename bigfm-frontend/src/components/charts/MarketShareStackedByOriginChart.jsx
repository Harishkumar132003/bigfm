import React, { useEffect, useState } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';
import { Box, CircularProgress, Typography } from '@mui/material';
import axios from 'axios';
import { BASE_URL } from '../../apiurls';

const COLORS = [
  '#0088FE',
  '#00C49F',
  '#FFBB28',
  '#FF8042',
  '#E57373',
  '#9575CD',
  '#03695fff',
];
const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    const item = payload[0].payload;

    return (
      <Box sx={{ p: 1.5, bgcolor: 'white', borderRadius: 1, boxShadow: 2 }}>
        <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
          {label}
        </Typography>

        {payload.map((p) => {
          const percent = item[`${p.name}%`] ?? "0%";
          return (
            <Typography key={p.name} variant="body2">
              <span style={{ color: p.color, fontWeight: 600 }}>{p.name}:</span>{" "}
              {p.value} sec ({percent})
            </Typography>
          );
        })}

        <Typography variant="caption" sx={{ display: "block", mt: 1 }}>
          Total: {item["Total Secondages"]}
        </Typography>
      </Box>
    );
  }
  return null;
};




const MarketShareStackedByOriginChart = ({ filters }) => {
  const [data, setData] = useState([]);
  const [keys, setKeys] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const params = {};

        if (filters.month) params.month = filters.month;
        if (filters.year) params.year = filters.year;
        if (filters.week) params.week = filters.week;

        const response = await axios.get(
          `${BASE_URL}/getStationWiseMarketShare`,
          {
            params,
          }
        );

        const stations = response.data.records || [];

        // Convert API → chart format
       const formatted = stations.map((st) => ({
  city: st['Station'],

  'BIG FM': st['BIG FM'],
  'BIG FM%': st['BIG FM%'],

  'RADIO MIRCHI': st['RADIO MIRCHI'],
  'RADIO MIRCHI%': st['RADIO MIRCHI%'],

  'RED FM': st['RED FM'],
  'RED FM%': st['RED FM%'],

  'RADIO CITY': st['RADIO CITY'],
  'RADIO CITY%': st['RADIO CITY%'],

  FEVER: st['FEVER'],
  'FEVER%': st['FEVER%'],

  'MY FM': st['MY FM'],
  'MY FM%': st['MY FM%'],

  OTHERS: st['Others'],
  'OTHERS%': st['Others%'],

  'Total Secondages': st['Total Secondages'],
}));


        setData(formatted);
        setKeys(
  Object.keys(formatted[0]).filter(
    (k) =>
      k !== 'city' &&
      k !== 'Total Secondages' &&
      !k.endsWith('%') // prevents % columns from being used in the chart
  )
);
      } catch (err) {
        console.log('⚠ API failed, using mock data');
        
        setData([]);
        setKeys([]);
      }
      setLoading(false);
    };

    fetchData();
  }, [filters]);

  if (loading) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: 300,
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (!data.length) {
        return (
                  <Box
                      sx={{
                          width: "100%",
                          height: 450,
                          display: "flex",
                          justifyContent: "center",
                          alignItems: "center",
                          bgcolor: "#f8f8f8",
                          borderRadius: 2
                      }}
                  >
                      <Typography variant="h6" color="text.secondary">
                          No Data Available
                      </Typography>
                  </Box>
              );
    }

  const chartWidth = data.length > 5 ? data.length * 180 : 900;

  return (
    <Box sx={{ width: '100%' }}>
      {/* Horizontal Scroll */}
      <Box sx={{ width: '100%', overflowX: 'auto', pb: 1 }}>
        <Box sx={{ width: chartWidth, height: 350 }}>
          <BarChart
            width={chartWidth}
            height={350}
            data={data}
            margin={{ top: 20, right: 30, left: 10, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray='3 3' />
            <XAxis dataKey='city' />
            <YAxis />
            <Tooltip content={<CustomTooltip />}/>
            <Legend />

            {keys.map((key, index) => (
              <Bar
                key={key}
                dataKey={key}
                fill={COLORS[index % COLORS.length]}
                name={key}
              />
            ))}
          </BarChart>
        </Box>
      </Box>
    </Box>
  );
};

export default MarketShareStackedByOriginChart;
