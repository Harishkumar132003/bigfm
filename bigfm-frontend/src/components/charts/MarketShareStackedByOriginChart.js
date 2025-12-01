import React, { useEffect, useState } from 'react';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid,
    Tooltip, Legend
} from 'recharts';
import { Box, CircularProgress, Typography } from '@mui/material';
import axios from 'axios';

const COLORS = ['#FF8042', '#003f88', '#ff6d00', '#00C49F', '#8e44ad']; // BIG FM, Radio Mirchi, RED FM, Radio City, FEVER

const MarketShareStackedByOriginChart = () => {
    const [data, setData] = useState([]);
    const [keys, setKeys] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const baseUrl = process.env.REACT_APP_API_BASE_URL || '';
                const response = await axios.get(`${baseUrl}/getStationWiseMarketShare`);

                const stations = response.data.records || [];

                // Convert API → chart format
                const formatted = stations.map(st => ({
                    city: st["Station"],
                    "BIG FM": st["BIG FM"],
                    "RADIO MIRCHI": st["RADIO MIRCHI"],
                    "RED FM": st["RED FM"],
                    "RADIO CITY": st["RADIO CITY"],
                    "FEVER": st["FEVER"],
                    "MY FM": st["MY FM"],
                    "OTHERS": st["Others"]
                }));

                setData(formatted);
                setKeys(Object.keys(formatted[0]).filter(k => k !== "city"));
            } catch (err) {
                console.log("⚠ API failed, using mock data");
                const mockData = [
                    { city: 'Ahmedabad', BIGFM: 18, 'Radio Mirchi': 21, 'RED FM': 19, 'Radio City': 15, FEVER: 12 },
                    { city: 'Mumbai', BIGFM: 22, 'Radio Mirchi': 18, 'RED FM': 21, 'Radio City': 14, FEVER: 8 },
                    { city: 'Delhi', BIGFM: 19, 'Radio Mirchi': 20, 'RED FM': 18, 'Radio City': 15, FEVER: 10 },
                ];
                setData(mockData);
                setKeys(Object.keys(mockData[0]).filter(k => k !== 'city'));
            }
            setLoading(false);
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
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="city" />
                        <YAxis />
                        <Tooltip />
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
