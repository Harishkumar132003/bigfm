import React from 'react';
import { Box, Typography, Grid, MenuItem, TextField } from '@mui/material';
import { DatePicker } from 'antd';
import dayjs from 'dayjs';

const DashboardDatePicker = ({ filters, handleFilterChange }) => {
  const WEEKS = ['Week 1', 'Week 2', 'Week 3', 'Week 4', 'Week 5'];

  return (
    <Box sx={{ mb: 3 ,}}>
      <Grid container spacing={2} sx={{display:'flex',justifyContent:'end', alignItems: 'center' }}>
        {/* MONTH */}
        <Grid item xs={12} sm={6} md={3}>
          <Typography fontSize="0.9rem" fontWeight={600} mb={1}>
            Month
          </Typography>
          <DatePicker
            picker="month"
            value={filters.monthObj}
            onChange={(v) => handleFilterChange("month", v)}
            format="MM-YYYY"
            style={{ width: "100%",borderRadius:'12px', height:'40px' }}
            size="large"
          />
        </Grid>

        {/* WEEK */}
        <Grid item xs={12} sm={6} md={3}>
          <Typography fontSize="0.9rem" fontWeight={600} mb={1}>
            Week
          </Typography>
          <TextField
            select
            fullWidth
            size="small"
            value={filters.week}
            onChange={(e) => handleFilterChange("week", e.target.value)}
          >
            <MenuItem value="">All Weeks</MenuItem>
            {WEEKS.map((wk) => (
              <MenuItem key={wk} value={wk}>
                {wk}
              </MenuItem>
            ))}
          </TextField>
        </Grid>

        {/* ORIGIN (optional if needed later) */}
        {/* <Grid item xs={12} sm={6} md={3}> ... </Grid> */}
      </Grid>
    </Box>
  );
};

export default DashboardDatePicker;
