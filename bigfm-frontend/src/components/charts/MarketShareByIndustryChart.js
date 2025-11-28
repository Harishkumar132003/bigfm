import React, { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import axios from 'axios';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import Typography from '@mui/material/Typography';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

const MarketShareByIndustryChart = ({ city }) => {
    const [data, setData] = useState([]);
    const [keys, setKeys] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const baseUrl = process.env.REACT_APP_API_BASE_URL || '';
                const response = await axios.post(`${baseUrl}/market_share_by_industry`, { city: city || 'MUMBAI' });
                // Response: { city: "...", market_share_by_industry: [{ "Category": "...", "BIG FM Market_Share_%": ... }] }
                const chartData = response.data.market_share_by_industry || [];

                if (chartData.length > 0) {
                    const firstItem = chartData[0];
                    const dataKeys = Object.keys(firstItem).filter(k => k !== 'Category');
                    setKeys(dataKeys);
                }

                setData(chartData);
                setLoading(false);
            } catch (err) {
                console.error("Error fetching market share by industry:", err);
                setError("Failed to load data");
                setLoading(false);
                // Fallback mock data
                const mockData = [
                    { "Category": "Auto", "BIG FM Market_Share_%": 40, "RADIO CITY Market_Share_%": 24 },
                    { "Category": "Retail", "BIG FM Market_Share_%": 30, "RADIO CITY Market_Share_%": 13 },
                    { "Category": "Tech", "BIG FM Market_Share_%": 20, "RADIO CITY Market_Share_%": 98 },
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

    // Calculate width based on number of items
    // Minimum width 100%, or 100px per item
    const chartWidth = Math.max(data.length * 100, 600); // Assuming container is around 600px, but 100% is better. 
    // Since we can't easily get container width in pixels here without a ref, 
    // we'll use a min-width approach. If data is small, it fits. If large, it scrolls.
    // Actually, for horizontal scroll, we need the inner container to be wider than the outer.

    return (
        <Box sx={{ width: '100%', overflowX: 'auto', pb: 1 }}>
            <div style={{ width: data.length > 5 ? data.length * 120 : '100%', height: 300, minWidth: '100%' }}>
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                        data={data}
                        margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                    >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="Category" />
                        <YAxis />
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

export default MarketShareByIndustryChart;
