import React, { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import axios from 'axios';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import Typography from '@mui/material/Typography';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

const MarketShareStackedByOriginChart = () => {
    const [data, setData] = useState([]);
    const [keys, setKeys] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const baseUrl = process.env.REACT_APP_API_BASE_URL || '';
                const response = await axios.get(`${baseUrl}/market_share_stacked_by_origin`);
                // Response: { data: [{ city: "...", "BIG FM": ... }] }
                const chartData = response.data.data || [];

                if (chartData.length > 0) {
                    const firstItem = chartData[0];
                    const dataKeys = Object.keys(firstItem).filter(k => k !== 'city');
                    setKeys(dataKeys);
                }

                setData(chartData);
                setLoading(false);
            } catch (err) {
                console.error("Error fetching market share stacked by origin:", err);
                setError("Failed to load data");
                setLoading(false);
                // Fallback mock data
                const mockData = [
                    { city: 'MUMBAI', 'BIG FM': 20, 'RADIO CITY': 30, 'RADIO MIRCHI': 50 },
                    { city: 'DELHI', 'BIG FM': 25, 'RADIO CITY': 35, 'RADIO MIRCHI': 40 },
                    { city: 'BANGALORE', 'BIG FM': 30, 'RADIO CITY': 20, 'RADIO MIRCHI': 50 },
                ];
                setData(mockData);
                setKeys(['BIG FM', 'RADIO CITY', 'RADIO MIRCHI']);
            }
        };

        fetchData();
    }, []);

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 300 }}>
                <CircularProgress />
            </Box>
        );
    }

    const toPercent = (decimal, fixed = 0) => `${(decimal).toFixed(fixed)}%`;

    return (
        <ResponsiveContainer width="100%" height={300}>
            <BarChart
                data={data}
                stackOffset="expand"
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
            >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="city" />
                <YAxis tickFormatter={(val) => toPercent(val * 100)} />
                <Tooltip />
                <Legend />
                {keys.map((key, index) => (
                    <Bar key={key} dataKey={key} stackId="a" fill={COLORS[index % COLORS.length]} />
                ))}
            </BarChart>
        </ResponsiveContainer>
    );
};

export default MarketShareStackedByOriginChart;
