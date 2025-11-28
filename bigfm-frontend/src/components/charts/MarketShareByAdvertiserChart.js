import React, { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import axios from 'axios';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import Typography from '@mui/material/Typography';

const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#0088FE', '#00C49F'];

const MarketShareByAdvertiserChart = ({ city }) => {
    const [data, setData] = useState([]);
    const [keys, setKeys] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const baseUrl = process.env.REACT_APP_API_BASE_URL || '';
                const response = await axios.post(`${baseUrl}/market_share_by_advertiser`, { city: city || 'MUMBAI' });
                // Response: { city: "...", market_share_by_advertiser: [{ "Brand Name": "...", "BIG FM Market_Share_%": ... }] }
                const chartData = response.data.market_share_by_advertiser || [];

                if (chartData.length > 0) {
                    const firstItem = chartData[0];
                    const dataKeys = Object.keys(firstItem).filter(k => k !== 'Brand Name');
                    setKeys(dataKeys);
                }

                setData(chartData);
                setLoading(false);
            } catch (err) {
                console.error("Error fetching market share by advertiser:", err);
                setError("Failed to load data");
                setLoading(false);
                // Fallback mock data
                const mockData = [
                    { "Brand Name": "Brand A", "BIG FM Market_Share_%": 40, "RADIO CITY Market_Share_%": 24 },
                    { "Brand Name": "Brand B", "BIG FM Market_Share_%": 30, "RADIO CITY Market_Share_%": 13 },
                    { "Brand Name": "Brand C", "BIG FM Market_Share_%": 20, "RADIO CITY Market_Share_%": 98 },
                ];
                setData(mockData);
                setKeys(["BIG FM Market_Share_%", "RADIO CITY Market_Share_%"]);
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

    // Calculate height based on number of items to ensure readability
    // Minimum height 300px, or 60px per item
    const chartHeight = Math.max(data.length * 60, 300);

    return (
        <Box sx={{ width: '100%', height: 400, overflowY: 'auto', pr: 1 }}>
            <div style={{ height: chartHeight, width: '100%' }}>
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                        layout="vertical"
                        data={data}
                        margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                    >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis type="number" />
                        <YAxis dataKey="Brand Name" type="category" width={150} />
                        <Tooltip />
                        <Legend />
                        {keys.map((key, index) => (
                            <Bar key={key} dataKey={key} stackId="a" fill={COLORS[index % COLORS.length]} />
                        ))}
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </Box>
    );
};

export default MarketShareByAdvertiserChart;
