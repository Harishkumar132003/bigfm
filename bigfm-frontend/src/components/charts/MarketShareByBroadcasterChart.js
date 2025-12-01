import React, { useEffect, useState } from 'react';
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid,
    Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import {
    Box, CircularProgress, Typography
} from '@mui/material';
import axios from 'axios';

const MarketShareByBroadcasterChart = () => {
    const [data, setData] = useState([
                    { week: "Week 1", market_share: 19.8 },
                    { week: "Week 2", market_share: 20.1 },
                    { week: "Week 3", market_share: 19.9 },
                    { week: "Week 4", market_share: 20.3 },
                    { week: "Week 5", market_share: 20.1 }
                ]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 300 }}>
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Box>
  

            <ResponsiveContainer width="100%" height={300}>
                <LineChart
                    data={data}
                    margin={{ top: 10, right: 30, left: 0, bottom: 10 }}
                >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="week" />
                    <YAxis domain={[19, 21]} />
                    <Tooltip formatter={(v) => `${v}%`} />
                    <Legend />
                    <Line
                        type="monotone"
                        dataKey="market_share"
                        stroke="#ff7043"
                        strokeWidth={3}
                        dot={{ r: 5 }}
                        activeDot={{ r: 7 }}
                        name="BigFM Share %"
                    />
                </LineChart>
            </ResponsiveContainer>
        </Box>
    );
};

export default MarketShareByBroadcasterChart;
