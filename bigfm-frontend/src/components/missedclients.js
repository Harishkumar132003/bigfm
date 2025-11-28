import React, { useState, useEffect } from 'react';
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
  Button,
  Grid,
  CircularProgress,
  IconButton,
} from '@mui/material';
import { DatePicker } from 'antd';
import { originlist } from '../constant/constantValue';
import { exportMissedClients } from '../api';
import Close from '@mui/icons-material/Close';

const { RangePicker } = DatePicker;

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
  { id: 'city', label: 'City', minWidth: 100 },
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
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [totalRecords, setTotalRecords] = useState(0);
  const [filters, setFilters] = useState({
    broadcaster: 'BIG FM',
    city: 'All Cities',
    dateRange: null,
  });

  const theme = useTheme();

  const fetchData = async () => {
    setLoading(true);
    const params = new URLSearchParams({
      broadcaster: filters.broadcaster,
      page: page + 1,
      limit: rowsPerPage,
      ...((filters.city && filters.city !== 'All Cities') && { city: filters.city }),
      ...(filters.dateRange && {
        start_date: filters.dateRange[0].format('YYYY-MM-DD'),
        end_date: filters.dateRange[1].format('YYYY-MM-DD'),
      }),
    });

    exportMissedClients(params)
      .then((response) => {
        const result = response.data;
        setData(result.records || []);
        setTotalRecords(result.total_records || 0);
      })
      .catch((error) => {
        console.error('Error fetching data:', error);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchData();
  }, [page, rowsPerPage, filters]);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(+event.target.value);
    setPage(0);
  };

  const handleFilterChange = (field, value) => {
    setFilters((prev) => ({ ...prev, [field]: value }));
  };

  const handleResetFilters = () => {
    setFilters({
      broadcaster: 'BIG FM',
      city: '',
      dateRange: null,
    });
    setPage(0);
  };

  return (
    <Box sx={{ width: '100%', overflow: 'hidden' }}>
      <Typography variant='h4' component='h1' gutterBottom>
        Missed Clients
      </Typography>

      <Paper sx={{ p: 2, mb: 3, boxShadow: 2 }}>
        <Grid
          container
          spacing={2}
          alignItems='center'
          sx={{ display: 'flex', justifyContent: 'space-between' }}
        >
          <Grid
            item
            sx={{
              display: 'flex',
              gap: 2,
              flexWrap: 'wrap',
              alignItems: 'end',
            }}
          >
            <Box sx={{ minWidth: 200 }}>
              <Typography
                sx={{ mb: 1 }}
                fontSize='0.9rem'
                fontWeight={600}
                color='#475569'
              >
                City
              </Typography>

              <TextField
                select
                fullWidth
                value={filters.city || ''}
                onChange={(e) => handleFilterChange('city', e.target.value)}
                size='small'
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '10px',
                    backgroundColor: '#FFFFFF',
                  },
                  legend: { display: 'none' },
                }}
                InputProps={{
                  endAdornment: (filters.city && filters.city !== 'All Cities') ? (
                    <IconButton
                      size='small'
                      onClick={() => handleFilterChange('city', 'All Cities')}
                      sx={{ mr: 1 }}
                    >
                      <Close fontSize='small' />
                    </IconButton>
                  ) : null,
                }}
              >
                <MenuItem value='All Cities'>All Cities</MenuItem>
                {originlist.map((city) => (
                  <MenuItem key={city} value={city}>
                    {city}
                  </MenuItem>
                ))}
              </TextField>
            </Box>

            {/* DATE RANGE */}
            <Box sx={{ minWidth: 260 }}>
              <Typography
                sx={{ mb: 1 }}
                fontSize='0.9rem'
                fontWeight={600}
                color='#475569'
              >
                Date Range
              </Typography>
              <RangePicker
                value={filters.dateRange}
                onChange={(dates) => handleFilterChange('dateRange', dates)}
                style={{
                  width: '100%',
                  height: '40px',
                  borderRadius: '10px',
                  fontSize: '16px',
                  padding: '10px 14px',
                  border: '1px solid #CBD5E1',
                }}
              />
            </Box>
          </Grid>

          {/* RIGHT SIDE – ACTION BUTTONS */}
        </Grid>
      </Paper>

      <Paper sx={{ width: '100%', overflow: 'hidden', boxShadow: 3 }}>
        <TableContainer sx={{ maxHeight: 'calc(100vh - 300px)' }}>
          <Table stickyHeader aria-label='sticky table'>
            <TableHead>
              <TableRow>
                {columns.map((column) => (
                  <TableCell
                    key={column.id}
                    align={column.align || 'left'}
                    style={{
                      minWidth: column.minWidth,
                      backgroundColor: theme.palette.primary.main,
                      color: theme.palette.primary.contrastText,
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
                  <TableCell
                    colSpan={columns.length}
                    align='center'
                    sx={{ py: 4 }}
                  >
                    <CircularProgress />
                  </TableCell>
                </TableRow>
              ) : data.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={columns.length}
                    align='center'
                    sx={{ py: 4 }}
                  >
                    No data available
                  </TableCell>
                </TableRow>
              ) : (
                data.map((row, index) => (
                  <TableRow hover role='checkbox' tabIndex={-1} key={index}>
                    {columns.map((column) => {
                      const value = row[column.id];
                      return (
                        <TableCell
                          key={column.id}
                          align={column.align || 'left'}
                          sx={{
                            '&:nth-of-type(odd)': {
                              backgroundColor: theme.palette.action.hover,
                            },
                          }}
                        >
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
          component='div'
          count={totalRecords}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </Paper>
    </Box>
  );
};

export default MissedClients;
