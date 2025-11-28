import React, { useEffect, useState } from 'react';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import axios from 'axios';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import Typography from '@mui/material/Typography';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

const MarketShareByOriginChart = ({ city }) => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true); // Reset loading state on city change
            try {
                // API requires POST with city
                const baseUrl = process.env.REACT_APP_API_BASE_URL || '';
                const response = await axios.post(`${baseUrl}/market_share_by_origin`, { city: city || 'MUMBAI' });
                // Response structure: { city: "MUMBAI", market_share: [{ Broadcaster: "...", "Market_Share_%": ... }] }
                const chartData = response.data.market_share || [];
                setData(chartData);
                setLoading(false);
            } catch (err) {
                console.error("Error fetching market share by origin:", err);
                setError("Failed to load data");
                setLoading(false);
                // Fallback to mock data
                setData([
                    { Broadcaster: 'BIG FM', 'Market_Share_%': 20 },
                    { Broadcaster: 'RADIO CITY', 'Market_Share_%': 25 },
                    { Broadcaster: 'RADIO MIRCHI', 'Market_Share_%': 30 },
                    { Broadcaster: 'RED FM', 'Market_Share_%': 15 },
                    { Broadcaster: 'MY FM', 'Market_Share_%': 10 },
                ]);
            }
        };

        if (city) {
            fetchData();
        }
    }, [city]);

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 300 }}>
                <CircularProgress />
            </Box>
        );
    }

    if (error && data.length === 0) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 300 }}>
                <Typography color="error">{error}</Typography>
            </Box>
        );
    }

    return (
        <ResponsiveContainer width="100%" height={300}>
            <PieChart>
                <Pie
                    data={data}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    fill="#8884d8"
                    paddingAngle={5}
                    dataKey="Market_Share_%"
                    nameKey="Broadcaster"
                >
                    {data.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                </Pie>
                <Tooltip />
                <Legend />
            </PieChart>
        </ResponsiveContainer>
    );
};

export default MarketShareByOriginChart;
