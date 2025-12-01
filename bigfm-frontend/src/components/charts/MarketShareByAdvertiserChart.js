import React, { useEffect, useState } from 'react';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid,
    Tooltip, ResponsiveContainer
} from 'recharts';
import { Box, CircularProgress, Typography } from '@mui/material';

const TopMissedRegionsChart = ({ data }) => {
    const [chartData, setChartData] = useState([]);

    useEffect(() => {
        if (data?.TOP_5_MISSED_REGIONS) {
            const formatted = data.TOP_5_MISSED_REGIONS.map(region => ({
                station: region.station,
                missed_seconds: region.missed_seconds,
            }));
            setChartData(formatted);
        }
    }, [data]);

    if (!chartData.length) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 300 }}>
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Box sx={{ width: "100%", height: 350 }}>
            <ResponsiveContainer width="100%" height="100%">
                <BarChart
                    data={chartData}
                    margin={{ top: 20, right: 20, left: 10, bottom: 5 }}
                >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="station" />
                    <YAxis type="number" />
                    <Tooltip formatter={(val) => val.toLocaleString()} />
                    <Bar
                        dataKey="missed_seconds"
                        fill="#ff7043"
                        barSize={50}
                        radius={[4, 4, 0, 0]}
                    />
                </BarChart>
            </ResponsiveContainer>
        </Box>
    );
};

export default TopMissedRegionsChart;
