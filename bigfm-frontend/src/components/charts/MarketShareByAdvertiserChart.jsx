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
            setChartData([]);
        }
    }, [data]);

    if (!chartData.length) {
        return (
            <Box
                sx={{
                    width: "100%",
                    height: { xs: 300, md: 450 },
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
        <Box sx={{ width: "100%", height: { xs: 320, sm: 360, md: 450 } }}>
            <Typography
                variant="subtitle1"
                sx={{
                    mb: 2,
                    textAlign: "center",
                    fontSize: { xs: "0.95rem", md: "1.1rem" }
                }}
            >
                Top Missed Regions
            </Typography>

            <Box sx={{ height: { xs: "calc(100% - 40px)" } }}>
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                        data={chartData}
                        margin={{
                            top: 20,
                            right: 10,
                            left: 10,
                            bottom: 20
                        }}
                    >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis
                            dataKey="station"
                            tick={{ fontSize: 10 }}
                            interval={0}
                            angle={window.innerWidth < 600 ? -35 : 0}   // label tilt on small screens
                            textAnchor="end"
                        />
                        <YAxis
                            type="number"
                            tick={{ fontSize: 11 }}
                        />
                        <Tooltip formatter={(val) => val.toLocaleString()} />
                        <Bar
                            dataKey="missed_seconds"
                            fill="#ff7043"
                            barSize={window.innerWidth < 600 ? 28 : 50} // smaller bars on mobile
                            radius={[4, 4, 0, 0]}
                        />
                    </BarChart>
                </ResponsiveContainer>
            </Box>
        </Box>
    );
};

export default TopMissedRegionsChart;
