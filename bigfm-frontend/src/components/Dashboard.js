import React, { useState } from 'react';
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

    const handleCityChange = (event) => {
        setCity(event.target.value);
    };

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
                    <StatCard title="Users" value="12,483" caption="+8.3% vs last week" color="#7C3AED" />
                </Grid>
                <Grid item xs={12} md={4}>
                    <StatCard title="Sessions" value="48,920" caption="+2.1% vs last week" color="#06B6D4" />
                </Grid>
                <Grid item xs={12} md={4}>
                    <StatCard title="Conversion" value="4.7%" caption="-0.4% vs last week" color="#F59E0B" />
                </Grid>
            </Grid>

            <Grid container spacing={2}>
                {/* Market Share by Origin (Donut/Pie) */}
                <Grid item xs={12} md={6}>
                    <Paper elevation={0} sx={{ p: 2.5, borderRadius: 3, minHeight: 350 }}>
                        <Typography variant="h6" sx={{ mb: 2 }}>Market Share by Origin</Typography>
                        <MarketShareByOriginChart city={city} />
                    </Paper>
                </Grid>

                {/* Market Share by Advertiser (Horizontal Stacked Bar) */}
                <Grid item xs={12} md={6}>
                    <Paper elevation={0} sx={{ p: 2.5, borderRadius: 3, minHeight: 350 }}>
                        <Typography variant="h6" sx={{ mb: 2 }}>Market Share by Advertiser</Typography>
                        <MarketShareByAdvertiserChart city={city} />
                    </Paper>
                </Grid>

                {/* Market Share by Industry (Vertical Stacked Bar) */}
                <Grid item xs={12} md={6}>
                    <Paper elevation={0} sx={{ p: 2.5, borderRadius: 3, minHeight: 350 }}>
                        <Typography variant="h6" sx={{ mb: 2 }}>Market Share by Industry</Typography>
                        <MarketShareByIndustryChart city={city} />
                    </Paper>
                </Grid>

                {/* Market Share by Broadcaster (Line or Vertical Bar) */}
                {/* <Grid item xs={12} md={6}>
                    <Paper elevation={0} sx={{ p: 2.5, borderRadius: 3, minHeight: 350 }}>
                        <Typography variant="h6" sx={{ mb: 2 }}>Market Share by Broadcaster</Typography>
                        <MarketShareByBroadcasterChart />
                    </Paper>
                </Grid> */}

                {/* Market Share Stacked by Origin (100% Stacked Column) */}
                {/* <Grid item xs={12}>
                    <Paper elevation={0} sx={{ p: 2.5, borderRadius: 3, minHeight: 350 }}>
                        <Typography variant="h6" sx={{ mb: 2 }}>Market Share Stacked by Origin</Typography>
                        <MarketShareStackedByOriginChart />
                    </Paper>
                </Grid> */}
            </Grid>
        </Stack>
    );
}

export default Dashboard;
