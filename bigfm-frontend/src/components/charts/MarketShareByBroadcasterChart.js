import React, { useEffect, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import axios from 'axios';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import Typography from '@mui/material/Typography';

const MarketShareByBroadcasterChart = () => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const baseUrl = process.env.REACT_APP_API_BASE_URL || '';
                const response = await axios.post(`${baseUrl}/market_share_by_broadcaster`, { broadcaster: 'BIG FM' });
                // Response: { broadcaster: "BIG FM", data: [{ city: "...", market_share_%: ... }] }
                const chartData = response.data.data || [];
                setData(chartData);
                setLoading(false);
            } catch (err) {
                console.error("Error fetching market share by broadcaster:", err);
                setError("Failed to load data");
                setLoading(false);
                // Fallback mock data
                const mockData = [
                    { city: 'MUMBAI', 'market_share_%': 20 },
                    { city: 'DELHI', 'market_share_%': 25 },
                    { city: 'BANGALORE', 'market_share_%': 30 },
                ];
                setData(mockData);
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

    return (
        <ResponsiveContainer width="100%" height={300}>
            <LineChart
                data={data}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="city" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="market_share_%" stroke="#8884d8" activeDot={{ r: 8 }} />
            </LineChart>
        </ResponsiveContainer>
    );
};

export default MarketShareByBroadcasterChart;
