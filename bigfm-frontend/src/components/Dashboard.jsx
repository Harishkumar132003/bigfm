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
import { getdashboadsummary } from '../api';
import CategoryWiseBigFMShareChart from './charts/CategoryWiseBigFMShareChart';
import DashboardDatePicker from './DashboardDatePicker';
import dayjs from 'dayjs';

const originlist = [
  'Ahmedabad',
  'Bangalore',
  'Bhopal',
  'Chandigarh',
  'Chennai',
  'Coimbatore',
  'Delhi',
  'Hyderabad',
  'Indore',
  'Jaipur',
  'Kanpur',
  'Kochi',
  'Kolkata',
  'Lucknow',
  'Mumbai',
  'Nagpur',
  'Pune',
  'Surat',
  'Trivandrum',
  'Vadodara',
  'Vizag',
];

const variationColor = '#16A34A';
const variationText = (
  <span style={{ color: variationColor }}>
    <img
      src='/uparrowicon.svg'
      alt='Up Arrow'
      style={{ verticalAlign: 'middle', marginRight: 4 }}
    />
    +0.35% vs last week
  </span>
);

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
        width: '100%',
      }}
    >
      <Typography variant='overline' color='text.secondary'>
        {title}
      </Typography>
      <Typography variant='h5' sx={{ fontWeight: 800, my: 0.5 }}>
        {value}
      </Typography>
      <Typography variant='body2' color='text.secondary'>
        {caption}
      </Typography>
    </Paper>
  );
}

function Dashboard() {
  const [city, setCity] = useState(originlist[0]);
  const [bigfmdata, setBigfmdata] = useState({});
  const [missedclient, setMissedclient] = useState({});
  const [dashboardData, setDashboardData] = useState(null);

const [filters, setFilters] = useState({
    broadcaster: 'BIG FM',
    city: 'All Cities',
     monthObj: null,
  yearObj: null,  
    month: null,
    year: null,
    week: '',
  });

   const handleFilterChange = (field, value) => {
    if (field === "month" && value) {
  const month = value.format("MMM");
  const year = value.format("YYYY");
  
  console.log("Month:", month, "Year:", year);

  setFilters((prev) => ({
    ...prev,
    month,
    year ,monthObj: value// <- auto update year too
  }));
  return;
}

    setFilters((prev) => ({ ...prev, [field]: value }));
  };

  const handleCityChange = (event) => {
    setCity(event.target.value);
  };

  const fetchDashboardData = async () => {
  try {
    

    const response = await getdashboadsummary({ 
      ...(filters.month && { month: filters.month }),
      ...(filters.year && { year: filters.year }),
      ...(filters.week && { week: filters.week }),
    });
    
    const data = response.data;
    console.log('Dashboard summary data:', data);

    setMissedclient(data.MISSED_100_CLIENTS || {});
    setBigfmdata(data.BIGFM_SUMMARY || {});
    setDashboardData(data);
  } catch (err) {
    console.error('Error fetching dashboard summary:', err);
  }
};

  useEffect(() => {
  fetchDashboardData();
}, [filters]);

  return (
    <Stack spacing={3}>
      <DashboardDatePicker
      filters={filters}
      handleFilterChange={handleFilterChange}
  
    />

      <Grid container spacing={2}>
        <Grid
          item
          xs={12}
          md={4}
          sx={{ display: 'flex', alignItems: 'stretch', width: '100%' }}
        >
          <StatCard
            title='Market Share'
            value={`${bigfmdata?.percent || 0}%`}
            caption={variationText}
            color='#7C3AED'
            sx={{ height: '100%' }}
          />
        </Grid>

        <Grid
          item
          xs={12}
          md={4}
          sx={{ display: 'flex', alignItems: 'stretch' }}
        >
          <StatCard
            title='Missed Client Seconds'
            value={`${missedclient?.missed_client_seconds || 0} Seconds`}
            caption=' '
            color='#06B6D4'
            sx={{ height: '100%' }}
          />
        </Grid>

        <Grid
          item
          xs={12}
          md={4}
          sx={{ display: 'flex', alignItems: 'stretch' }}
        >
          <StatCard
            title='Total Missed Clients'
            value={missedclient?.missed_client_count || 0}
            color='#F59E0B'
            sx={{ height: '100%' }}
          />
        </Grid>
      </Grid>

      <Grid container spacing={2}>
        {/* Market Share by Origin (Donut/Pie) */}
        <Grid item xs={12} md={6}>
          <Paper elevation={0} sx={{ p: 2.5, borderRadius: 3, minHeight: 400 }}>
            <Typography variant='h6' sx={{ mb: 2 }}>
              Overall Market Share
            </Typography>
            <MarketShareByOriginChart data={dashboardData} city={city} filters={filters} />
          </Paper>
        </Grid>

        {/* Market Share Distribution (Stacked Bar) */}
        <Grid item xs={12} md={6}>
          <Paper elevation={0} sx={{ p: 2.5, borderRadius: 3, minHeight: 400 }}>
            <Typography variant='h6' sx={{ mb: 2 }}>
              {' '}
              Top 5 Missed Regions
            </Typography>
            <MarketShareByAdvertiserChart data={dashboardData} city={city} />
          </Paper>
        </Grid>

        {/* Market Share by Industry (Vertical Stacked Bar) */}

        {/* Market Share by Broadcaster (Line or Vertical Bar) */}
        <Grid item xs={12} md={6}>
          <Paper elevation={0} sx={{ p: 2.5, borderRadius: 3, minHeight: 350,height: '100%' }}>
            <Typography variant='h6' sx={{ mb: 2 }}>
              Weekly Market Share Trend
            </Typography>
            <MarketShareByBroadcasterChart />
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper elevation={0} sx={{ p: 2.5, borderRadius: 3, minHeight: 350 }}>
            <Typography variant='h6' sx={{ mb: 2 }}>
              Category-wise BIG FM Market Share
            </Typography>
            <CategoryWiseBigFMShareChart filters={filters} />
          </Paper>
        </Grid>

        {/* Market Share Stacked by Origin (100% Stacked Column) */}
        <Grid item xs={12}>
          <Paper elevation={0} sx={{ p: 2.5, borderRadius: 3, minHeight: 350 }}>
            <Typography variant='h6' sx={{ mb: 2 }}>
              Station-wise Competitive Landscape
            </Typography>
            <MarketShareStackedByOriginChart filters={filters}/>
          </Paper>
        </Grid>
      </Grid>

      <Grid item xs={12} md={6}>
        <Paper elevation={0} sx={{ p: 2.5, borderRadius: 3, minHeight: 350 }}>
          <Typography variant='h6' sx={{ mb: 2 }}>
            Low Market Share{' '}
          </Typography>
          <MarketShareByIndustryChart city={city} datefilter={filters}/>
        </Paper>
      </Grid>
    </Stack>
  );
}

export default Dashboard;
