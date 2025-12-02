import React, { useEffect, useState } from 'react';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid,
    Tooltip, ResponsiveContainer
} from 'recharts';
import { Box, CircularProgress, Typography } from '@mui/material';

const TopMissedRegionsChart = ({ data }) => {
    const [chartData, setChartData] = useState([]);

    useEffect(() => {
        if (data?.TOP_5_MISSED_REGIONS?.length > 0) {
            const formatted = data.TOP_5_MISSED_REGIONS.map(region => ({
                station: region.station,
                missed_seconds: region.missed_seconds,
            }));
            setChartData(formatted);
        } else {
            setChartData([]); // ensures state resets when no data
        }
    }, [data]);

    // 🚫 Show "No Data" instead of loader
    if (!chartData.length) {
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

    return (
        <Box sx={{ width: '100%', height: 450 }}>
            <Typography variant="subtitle1" sx={{ mb: 2, textAlign: 'center' }}>
                Top Missed Regions
            </Typography>
            <Box sx={{ height: 'calc(100% - 40px)' }}>
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                        data={chartData}
                        margin={{ top: 20, right: 30, left: 100, bottom: 20 }}
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
        </Box>
    );
};

export default TopMissedRegionsChart;
