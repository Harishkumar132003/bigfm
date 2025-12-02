import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import {
  Box,
  CircularProgress,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  FormControl,
  Select,
  MenuItem,
  InputLabel,
} from '@mui/material';
import { BASE_URL } from '../../apiurls';

const COLORS = [
  '#0088FE',
  '#00C49F',
  '#FFBB28',
  '#FF8042',
  '#E57373',
  '#9575CD',
  '#03695fff',
];

const MarketShareByOriginChart = ({ data }) => {
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(false);

  // dropdown states
  const [viewType, setViewType] = useState('overall'); // overall | origin | product
  const [selectedFilter, setSelectedFilter] = useState(['All']); // MULTI SELECT ARRAY

  // stored data from API / props
  const [cachedOverall, setCachedOverall] = useState([]);
  const [origins, setOrigins] = useState(['All']);
  const [products, setProducts] = useState(['All']);

  // initial mounting → store overall data + load filters for dropdown
  useEffect(() => {
    if (data?.TOTAL_MARKET_SHARE_BY_CHANNEL) {
      const formattedData = data.TOTAL_MARKET_SHARE_BY_CHANNEL.map((item) => ({
        Broadcaster: item.channel,
        marketShare: item.percent,
        seconds: item.seconds,
        origin: item.origin,
        product: item.product,
      }));
      setCachedOverall(formattedData);
      setChartData(formattedData);
    }

    axios.get(`${BASE_URL}/getMarketFilters`).then((res) => {
      setOrigins(res.data.origins);
      setProducts(res.data.products);
    });
  }, [data]);

  // When dropdown changed → fetch chart data based on filter
  const fetchChartData = async (origin = ['All'], product = ['All']) => {
    setLoading(true);
    try {
      const params = {};
      if (!origin.includes('All')) params.origin = origin.join(',');
      if (!product.includes('All')) params.product = product.join(',');

      const res = await axios.get(`${BASE_URL}/getMarketShareChartData`, {
        params,
      });
      const result = res.data.market_share.map((item) => ({
        Broadcaster: item.channel,
        seconds: item.seconds,
        marketShare: item.percent,
      }));
      setChartData(result);
    } finally {
      setLoading(false);
    }
  };

  // ----------- DROPDOWN HANDLERS ----------------
  const handleViewTypeChange = (e) => {
    const newType = e.target.value;
    setViewType(newType);
    setSelectedFilter(['All']);

    setChartData(cachedOverall);
  };

  const handleFilterChange = async (e) => {
    let values = e.target.value;
    if (!Array.isArray(values)) values = [values];

    // If clicking something else while All is selected, remove All
    if (values.includes('All') && values.length > 1) {
      values = values.filter((v) => v !== 'All');
    }

    // If deselecting everything
    if (values.length === 0) {
      values = ['All'];
    }

    setSelectedFilter(values);

    // ⭐ If All selected → show props (cached data) instead of calling API
    if (values.includes('All')) {
      setChartData(cachedOverall);
      return;
    }

    // Otherwise hit API
    if (viewType === 'origin') {
      await fetchChartData(values, ['All']);
    } else if (viewType === 'product') {
      await fetchChartData(['All'], values);
    }
  };

  const isOriginView = viewType === 'origin';
  const isProductView = viewType === 'product';
  const secondDropdownOptions = isOriginView
    ? origins
    : isProductView
    ? products
    : ['All'];

  if (loading) {
    return (
      <Box
        display='flex'
        justifyContent='center'
        alignItems='center'
        height={350}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (!chartData.length) {
    return (
      <Box
        display='flex'
        justifyContent='center'
        alignItems='center'
        height={350}
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ width: '100%', height: 450 }}>
      {/* Top row: title and dropdowns */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 2,
        }}
      >
        <Typography variant='subtitle1'>Market Share by Channel</Typography>

        <Box display='flex' gap={2}>
          {/* 1st dropdown */}
          <FormControl size='small' sx={{ minWidth: 150 }}>
            <InputLabel>View</InputLabel>
            <Select
              value={viewType}
              label='View'
              onChange={handleViewTypeChange}
            >
              <MenuItem value='overall'>Overall</MenuItem>
              <MenuItem value='origin'>By Origin</MenuItem>
              <MenuItem value='product'>By Product</MenuItem>
            </Select>
          </FormControl>

          {/* 2nd dropdown — MULTI SELECT */}
          <FormControl size='small' sx={{ minWidth: 200, maxWidth: 220 }}>
           
            <Select
              multiple
              value={selectedFilter}
              disabled={viewType === 'overall'}
              onChange={handleFilterChange}
              renderValue={(selected) => selected.join(', ')}
            >
              <MenuItem value='All' disabled={selectedFilter.length > 1}>
                All
              </MenuItem>

              {secondDropdownOptions
                .filter((opt) => opt !== 'All')
                .map((opt) => (
                  <MenuItem key={opt} value={opt}>
                    {opt}
                  </MenuItem>
                ))}
            </Select>
          </FormControl>
        </Box>
      </Box>

      <Box
        display='flex'
        gap={4}
        alignItems='center'
        height='calc(100% - 50px)'
      >
        {/* --- Chart --- */}
        <Box flex={1} height='100%'>
          <ResponsiveContainer width='100%' height='100%'>
            <PieChart>
              <Pie
                data={chartData}
                cx='50%'
                cy='50%'
                innerRadius={65}
                outerRadius={90}
                dataKey='marketShare'
                nameKey='Broadcaster'
                stroke='#fff'
                strokeWidth={2}
                paddingAngle={2}
              >
                {chartData.map((_, idx) => (
                  <Cell key={idx} fill={COLORS[idx % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </Box>

        {/* --- Table --- */}
        <Box flex={1} height='100%'>
          <TableContainer
            component={Paper}
            sx={{ borderRadius: 2, maxHeight: 350, overflow: 'auto' }}
          >
            <Table size='small' stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell>
                    <b>BROADCASTER</b>
                  </TableCell>
                  <TableCell align='right'>
                    <b>SECONDS</b>
                  </TableCell>
                  <TableCell align='right'>
                    <b>MARKET SHARE</b>
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {chartData.map((row, idx) => (
                  <TableRow key={idx}>
                    <TableCell>{row.Broadcaster}</TableCell>
                    <TableCell align='right'>
                      {row.seconds?.toLocaleString()}
                    </TableCell>
                    <TableCell align='right'>
                      {row.marketShare.toFixed(2)}%
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
