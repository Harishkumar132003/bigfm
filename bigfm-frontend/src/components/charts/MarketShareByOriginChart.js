import React, { useEffect, useState } from 'react';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import {
    Box, CircularProgress, Typography,
    Table, TableBody, TableCell,
    TableContainer, TableHead, TableRow, Paper
} from '@mui/material';

const COLORS = [
    "#0088FE", // BIG_FM
    "#00C49F", // FEVER
    "#FFBB28", // MY_FM
    "#FF8042", // OTHERS
    "#E57373", // RADIO_CITY
    "#9575CD", // RADIO_MIRCHI
    "#4DB6AC", // RED_FM
];

const MarketShareByOriginChart = ({ data }) => {
    const [chartData, setChartData] = useState([]);

    useEffect(() => {
        if (data?.TOTAL_MARKET_SHARE_BY_CHANNEL) {
            const formattedData = data.TOTAL_MARKET_SHARE_BY_CHANNEL.map(item => ({
                Broadcaster: item.channel,
                marketShare: item.percent,
                seconds: item.seconds
            }));
            setChartData(formattedData);
        }
    }, [data]);

    if (!chartData.length) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" height={300}>
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Box sx={{ width: '100%', height: 450 }}>
            <Typography variant="subtitle1" sx={{ mb: 2, textAlign: 'center' }}>
                Market Share by Channel
            </Typography>
            <Box display="flex" gap={4} alignItems="center" height="calc(100% - 40px)">
                {/* ---------- PIE CHART SECTION ---------- */}
                <Box flex={1} height="100%">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                        <Pie
                            data={chartData}
                            cx="50%"
                            cy="50%"
                            innerRadius={65}
                            outerRadius={90}
                            dataKey="marketShare"
                            nameKey="Broadcaster"
                            stroke="#fff"
                            strokeWidth={2}
                            paddingAngle={2}
                        >
                            {chartData.map((_, index) => (
                                <Cell key={index} fill={COLORS[index % COLORS.length]} />
                            ))}
                        </Pie>
                        <Tooltip />
                        <Legend layout="horizontal" verticalAlign="bottom" align="center" />
                        </PieChart>
                    </ResponsiveContainer>
                </Box>

                {/* ---------- TABLE SECTION ---------- */}
                <Box flex={1} height="100%">
                    <TableContainer component={Paper} sx={{ borderRadius: 2, maxHeight: 350, overflow: 'auto' }}>
                        <Table size="small" stickyHeader>
                        <TableHead>
                            <TableRow>
                                <TableCell><strong>BROADCASTER</strong></TableCell>
                                <TableCell align="right"><strong>SECONDS</strong></TableCell>
                                <TableCell align="right"><strong>MARKET SHARE</strong></TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {chartData.map((row, idx) => (
                                <TableRow key={idx}>
                                    <TableCell>{row.Broadcaster}</TableCell>
                                    <TableCell align="right">
                                        {row.seconds?.toLocaleString() ?? "-"}
                                    </TableCell>
                                    <TableCell align="right">
                                        {(row.marketShare ?? 0).toFixed(2)}%
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                        </Table>
                    </TableContainer>
                </Box>
            </Box>
        </Box>
    );
};

export default MarketShareByOriginChart;
