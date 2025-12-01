import React, { useEffect, useState } from 'react';
import Stack from '@mui/material/Stack';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import { alpha } from '@mui/material/styles';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Box from '@mui/material/Box';

// Import Chart Components (to be created)
import MarketShareByOriginChart from './charts/MarketShareByOriginChart';
import MarketShareByAdvertiserChart from './charts/MarketShareByAdvertiserChart';
import MarketShareByIndustryChart from './charts/MarketShareByIndustryChart';
import MarketShareByBroadcasterChart from './charts/MarketShareByBroadcasterChart';
import MarketShareStackedByOriginChart from './charts/MarketShareStackedByOriginChart';
import {getdashboadsummary} from '../api';
import CategoryWiseBigFMShareChart from './charts/CategoryWiseBigFMShareChart';

const originlist = [
    "Ahmedabad",
    "Bangalore",
    "Bhopal",
    "Chandigarh",
    "Chennai",
    "Coimbatore",
    "Delhi",
    "Hyderabad",
    "Indore",
    "Jaipur",
    "Kanpur",
    "Kochi",
    "Kolkata",
    "Lucknow",
    "Mumbai",
    "Nagpur",
    "Pune",
    "Surat",
    "Trivandrum",
    "Vadodara",
    "Vizag"
]



function StatCard({ title, value, caption, color }) {
    const bgA = alpha(color, 0.08);
    const bdA = alpha(color, 0.24);
    return (
        <Paper
            elevation={0}
            sx={{
                p: 2.5,
                borderRadius: 3,
                background: `linear-gradient(135deg, ${bgA} 0%, rgba(255,255,255,0.7) 100%)`,
                border: `1px solid ${bdA}`,
            }}
        >
            <Typography variant="overline" color="text.secondary">
                {title}
            </Typography>
            <Typography variant="h5" sx={{ fontWeight: 800, my: 0.5 }}>
                {value}
            </Typography>
            <Typography variant="body2" color="text.secondary">
                {caption}
            </Typography>
        </Paper>
    );
}

function Dashboard() {
    const [city, setCity] = useState(originlist[0]);
    const [bigfmdata, setBigfmdata] = useState({});
    const [missedclient, setmissedclient] = useState({});
    const [dashboardData, setDashboardData] = useState(null);

    const handleCityChange = (event) => {
        setCity(event.target.value);
    };

    useEffect(() => {
        // Fetch dashboard summary data
        const fetchDashboardData = async () => {
            try {
                const response = await getdashboadsummary();
                const data = response.data;
                console.log("Dashboard summary data:", data);
                
                // Set individual state for stats
                setmissedclient(data.MISSED_100_CLIENTS || {});
                setBigfmdata(data.BIGFM_SUMMARY || {});
                
                // Set the complete data for charts
                setDashboardData(data);
            } catch (err) {
                console.error("Error fetching dashboard summary:", err);
                // You might want to set some error state here
            }
        };

        fetchDashboardData();
    }, []);

    return (
        <Stack spacing={3}>
            <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                <FormControl sx={{ m: 1, minWidth: 120 }} size="small">
                    <InputLabel id="city-select-label">City</InputLabel>
                    <Select
                        labelId="city-select-label"
                        id="city-select"
                        value={city}
                        label="City"
                        onChange={handleCityChange}
                    >
                        {originlist.map((c) => (
                            <MenuItem key={c} value={c}>
                                {c}
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>
            </Box>

            <Grid container spacing={2}>
                <Grid item xs={12} md={4}>
                    <StatCard title="Market Share" value={bigfmdata?.percent || 0} caption="+8.3% vs last week" color="#7C3AED" />
                </Grid>
                <Grid item xs={12} md={4}>
                    <StatCard title="Missed Volume" value={missedclient?.missed_client_seconds || 0} caption="+2.1% vs last week" color="#06B6D4" />
                </Grid>
                <Grid item xs={12} md={4}>
                    <StatCard title="Critical Misses" value={missedclient?.missed_client_count || 0} caption="-0.4% vs last week" color="#F59E0B" />
                </Grid>
            </Grid>

            <Grid container spacing={2}>
                {/* Market Share by Origin (Donut/Pie) */}
                <Grid item xs={12} md={6}>
                    <Paper elevation={0} sx={{ p: 2.5, borderRadius: 3, minHeight: 400 }}>
                        <Typography variant="h6" sx={{ mb: 2 }}>Overall Market Share</Typography>
                        <MarketShareByOriginChart data={dashboardData} city={city} />
                    </Paper>
                </Grid>

                {/* Market Share Distribution (Stacked Bar) */}
                <Grid item xs={12} md={6}>
                    <Paper elevation={0} sx={{ p: 2.5, borderRadius: 3, minHeight: 400 }}>
                        <Typography variant="h6" sx={{ mb: 2 }}> Top 5 Missed Regions</Typography>
                        <MarketShareByAdvertiserChart data={dashboardData} city={city} />
                    </Paper>
                </Grid>

                {/* Market Share by Industry (Vertical Stacked Bar) */}

                {/* Market Share by Broadcaster (Line or Vertical Bar) */}
                <Grid item xs={12} md={6}>
                    <Paper elevation={0} sx={{ p: 2.5, borderRadius: 3, minHeight: 350 }}>
                        <Typography variant="h6" sx={{ mb: 2 }}>Weekly Market Share Trend</Typography>
                        <MarketShareByBroadcasterChart />
                    </Paper>
                </Grid>

                <Grid item xs={12} md={6}>
                    <Paper elevation={0} sx={{ p: 2.5, borderRadius: 3, minHeight: 350 }}>
                        <Typography variant="h6" sx={{ mb: 2 }}>Category-wise BIG FM Market Share</Typography>
                        <CategoryWiseBigFMShareChart />
                    </Paper>
                </Grid>

                {/* Market Share Stacked by Origin (100% Stacked Column) */}
                <Grid item xs={12}>
                    <Paper elevation={0} sx={{ p: 2.5, borderRadius: 3, minHeight: 350 }}>
                        <Typography variant="h6" sx={{ mb: 2 }}>Station-wise Competitive Landscape</Typography>
                        <MarketShareStackedByOriginChart />
                    </Paper>
                </Grid>
            </Grid>

             <Grid item xs={12} md={6}>
                    <Paper elevation={0} sx={{ p: 2.5, borderRadius: 3, minHeight: 350 }}>
                        <Typography variant="h6" sx={{ mb: 2 }}>Low Market Share </Typography>
                        <MarketShareByIndustryChart city={city} />
                    </Paper>
                </Grid>
        </Stack>
    );
}

export default Dashboard;
