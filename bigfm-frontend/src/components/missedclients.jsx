import React, { useState, useEffect, useRef, use } from 'react';
import {
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  TablePagination,
  useTheme,
  TextField,
  MenuItem,
  Grid,
  CircularProgress,
  IconButton,
  Button,
} from '@mui/material';
import { DatePicker } from 'antd';
import { exportMissedClients } from '../api';
import Close from '@mui/icons-material/Close';
import axios from 'axios';
import { BASE_URL } from '../apiurls';

const WEEKS = ['Week 1', 'Week 2', 'Week 3', 'Week 4', 'Week 5'];

const BROADCASTERS = [
  'BIG FM',
  'FEVER',
  'MY FM',
  'RADIO CITY',
  'RADIO MIRCHI',
  'RED FM',
];

const columns = [
  { id: 'parent', label: 'Client Name', minWidth: 200 },
  { id: 'station', label: 'Origin', minWidth: 100 },
  { id: 'BIG_FM', label: 'BIG FM', minWidth: 80, align: 'center' },
  { id: 'FEVER', label: 'FEVER', minWidth: 80, align: 'center' },
  { id: 'MY_FM', label: 'MY FM', minWidth: 80, align: 'center' },
  { id: 'OTHERS', label: 'OTHERS', minWidth: 80, align: 'center' },
  { id: 'RADIO_CITY', label: 'RADIO CITY', minWidth: 80, align: 'center' },
  { id: 'RADIO_MIRCHI', label: 'RADIO MIRCHI', minWidth: 80, align: 'center' },
  { id: 'RED_FM', label: 'RED FM', minWidth: 80, align: 'center' },
  {
    id: 'total_seconds',
    label: 'Total Seconds',
    minWidth: 80,
    align: 'right',
    format: (value) => Math.round(value),
  },
];

const MissedClients = () => {
  const theme = useTheme();
  const[originlist,setOrigins]=useState([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [totalRecords, setTotalRecords] = useState(0);

  const [filters, setFilters] = useState({
    broadcaster: 'BIG FM',
    city: 'All',
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
  setPage(0);
  return;
}

    setFilters((prev) => ({ ...prev, [field]: value }));
    setPage(0);
  };

  const handleResetFilters = () => {
    setFilters({
      broadcaster: 'BIG FM',
      city: 'All',
      month: null,
      year: null,
      week: '',
    });
    setPage(0);
  };

  const fetchData = async () => {
    setLoading(true);
    const params = new URLSearchParams({
      channel_club: filters.broadcaster,
      page: page + 1,
      limit: rowsPerPage,
      ...(filters.city && filters.city !== 'All' && { origin: filters.city }),
      ...(filters.month && { month: filters.month }),
      ...(filters.year && { year: filters.year }),
      ...(filters.week && { week: filters.week }),
    });

  

    exportMissedClients(params)
      .then((response) => {
        setData(response.data.records || []);
        setTotalRecords(response.data.total_records || 0);
      })
      .catch((error) => console.error('Error fetching data:', error))
      .finally(() => setLoading(false));
  };

  useEffect(() => { 
     axios.get(`${BASE_URL}/getMarketFilters`).then((res) => {
      setOrigins(res.data?.origins || []);
    });
  }, []);

 useEffect(() => {
 
    fetchData();
}, [page, rowsPerPage, filters]);

  return (
    <Box sx={{ width: '100%', overflow: 'hidden' }}>
      <Typography variant='h4' component='h1' gutterBottom>
        Missed Clients
      </Typography>

      <Paper sx={{ p: 2, mb: 3, boxShadow: 2 }}>
        <Grid container spacing={2} alignItems="center" flexWrap="wrap">
          
          {/* CITY */}
          <Grid item xs={12} sm={6} md={3}>
            <Typography fontSize="0.9rem" fontWeight={600} mb={1}>Origin</Typography>
            <TextField
              select
              fullWidth
              value={filters.city}
              onChange={(e) => handleFilterChange('city', e.target.value)}
              size="small"
              InputProps={{
                endAdornment: filters.city !== 'All' && (
                  <IconButton size="small" onClick={() => handleFilterChange('city', 'All')}>
                    <Close fontSize="small" />
                  </IconButton>
                ),
              }}
            >
              {originlist.map((city) => (
                <MenuItem key={city} value={city}>{city}</MenuItem>
              ))}
            </TextField>
          </Grid>

          {/* MONTH */}
          <Grid item xs={12} sm={6} md={3}>
            <Typography fontSize="0.9rem" fontWeight={600} mb={1}>Month</Typography>
            <DatePicker
              picker="month"
              value={filters.monthObj}
              onChange={(v) => handleFilterChange('month', v)}
              style={{ width: '100%',height:'40px' }}
            />
          </Grid>


          {/* WEEK */}
          <Grid item xs={12} sm={6} md={3}>
            <Typography fontSize="0.9rem" fontWeight={600} mb={1}>Week</Typography>
            <TextField
              select
              fullWidth
              value={filters.week}
              onChange={(e) => handleFilterChange('week', e.target.value)}
              size="small"
            >
              <MenuItem value="">All Weeks</MenuItem>
              {WEEKS.map((wk) => (
                <MenuItem key={wk} value={wk}>{wk}</MenuItem>
              ))}
            </TextField>
          </Grid>

          {/* RESET BTN */}
          

        </Grid>
      </Paper>

      {/* TABLE */}
      <Paper sx={{ width: '100%', overflow: 'hidden', boxShadow: 3 }}>
        <TableContainer sx={{ maxHeight: 'calc(100vh - 300px)' }}>
          <Table stickyHeader>
            <TableHead>
              <TableRow>
                {columns.map((column) => (
                  <TableCell
                    key={column.id}
                    align={column.align || 'left'}
                    sx={{
                      minWidth: column.minWidth,
                      backgroundColor: theme.palette.primary.main,
                      color: '#fff !important',
                      fontWeight: 'bold',
                    }}
                  >
                    {column.label}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>

            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={columns.length} align="center" sx={{ py: 4 }}>
                    <CircularProgress />
                  </TableCell>
                </TableRow>
              ) : data.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={columns.length} align="center" sx={{ py: 4 }}>
                    No data available
                  </TableCell>
                </TableRow>
              ) : (
                data?.map((row, index) => (
                  <TableRow hover key={index}>
                    {columns.map((column) => {
                      const value = row[column.id];
                      return (
                        <TableCell key={column.id} align={column.align || 'left'}>
                          {column.format && typeof value === 'number'
                            ? column.format(value)
                            : value}
                        </TableCell>
                      );
                    })}
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>

        <TablePagination
          rowsPerPageOptions={[10, 25, 50]}
          count={totalRecords}
          rowsPerPage={rowsPerPage}
          page={page}
          component="div"
          onPageChange={(e, newPage) => setPage(newPage)}
          onRowsPerPageChange={(e) => {
            setRowsPerPage(+e.target.value);
            setPage(0);
          }}
        />
      </Paper>
    </Box>
  );
};

export default MissedClients;
