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

const MarketShareByOriginChart = ({ data, filters }) => {
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(false);

  const [viewType, setViewType] = useState('overall'); // overall | origin | product
  const [selectedFilter, setSelectedFilter] = useState(['All']); // multi select

  const [cachedOverall, setCachedOverall] = useState([]);
  const [origins, setOrigins] = useState(['All']);
  const [products, setProducts] = useState(['All']);

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
  }, [data, filters]);

  useEffect(() => {
    axios.get(`${BASE_URL}/getMarketFilters`).then((res) => {
      setOrigins(res.data.origins);
      setProducts(res.data.products);
    });
  }, []);

  const fetchChartData = async (origin = ['All'], product = ['All']) => {
    setLoading(true);
    try {
      const params = {};
      if (!origin.includes('All')) params.origin = origin.join(',');
      if (!product.includes('All')) params.product = product.join(',');
      if (filters.month) params.month = filters.month;
      if (filters.year) params.year = filters.year;
      if (filters.week) params.week = filters.week;

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

  const handleViewTypeChange = (e) => {
    const newType = e.target.value;
    setViewType(newType);
    setSelectedFilter(['All']);
    setChartData(cachedOverall);
  };

  const handleFilterChange = async (e) => {
    let values = Array.isArray(e.target.value) ? e.target.value : [e.target.value];

    if (values.includes('All') && values.length > 1) {
      values = values.filter((v) => v !== 'All');
    }
    if (values.length === 0) values = ['All'];

    setSelectedFilter(values);

    if (values.includes('All')) {
      setChartData(cachedOverall);
      return;
    }

    if (viewType === 'origin') {
      await fetchChartData(values, ['All']);
    } else if (viewType === 'product') {
      await fetchChartData(['All'], values);
    }
  };

  const isOriginView = viewType === 'origin';
  const isProductView = viewType === 'product';
  const secondDropdownOptions =
    isOriginView ? origins : isProductView ? products : ['All'];

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height={350}>
        <CircularProgress />
      </Box>
    );
  }

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
          borderRadius: 2,
        }}
      >
        <Typography variant="h6" color="text.secondary">
          No Data Available
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ width: "100%", height: { xs: "auto", md: 450 } }}>
      {/* Top row */}
      <Box
        sx={{
          display: "flex",
          flexDirection: { xs: "column", md: "row" },
          justifyContent: { xs: "flex-start", md: "space-between" },
          alignItems: { xs: "stretch", md: "center" },
          gap: { xs: 2, md: 0 },
          mb: 2,
        }}
      >
        <Typography variant="subtitle1">Market Share by Channel</Typography>

        <Box
          sx={{
            display: "flex",
            gap: 2,
            flexDirection: { xs: "column", md: "row" },
            width: { xs: "100%", md: "auto" },
          }}
        >
          {/* 1st dropdown */}
          <FormControl size="small" sx={{ minWidth: { xs: "100%", md: 150 } }}>
            <InputLabel>View</InputLabel>
            <Select value={viewType} label="View" onChange={handleViewTypeChange}>
              <MenuItem value="overall">Overall</MenuItem>
              <MenuItem value="origin">By Origin</MenuItem>
              <MenuItem value="product">By Product</MenuItem>
            </Select>
          </FormControl>

          {/* 2nd dropdown */}
          <FormControl
            size="small"
            sx={{ minWidth: { xs: "100%", md: 200 } }}
          >
            <Select
              multiple
              value={selectedFilter}
              disabled={viewType === "overall"}
              onChange={handleFilterChange}
              renderValue={(selected) => selected.join(", ")}
            >
              <MenuItem value="All" disabled={selectedFilter.length > 1}>
                All
              </MenuItem>
              {secondDropdownOptions
                .filter((opt) => opt !== "All")
                .map((opt) => (
                  <MenuItem key={opt} value={opt}>
                    {opt}
                  </MenuItem>
                ))}
            </Select>
          </FormControl>
        </Box>
      </Box>

      {/* Chart + Table Layout */}
      <Box
        sx={{
          display: "flex",
          gap: 4,
          alignItems: "center",
          flexDirection: { xs: "column", md: "row" },
          width: "100%",
          height: { xs: "700px", md: "unset",},
        }}
      >
        {/* Chart */}
        <Box sx={{ flex: 1, width: "100%", height: { xs: 300, md: 400, lg: 380 } }}>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart >
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
                {chartData.map((_, idx) => (
                  <Cell key={idx} fill={COLORS[idx % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </Box>

        {/* Table */}
        <Box sx={{ flex: 1, width: "100%" }}>
          <TableContainer
            component={Paper}
            sx={{
              borderRadius: 2,
              maxHeight: { xs: 280, md: 350 },
              overflow: "auto",
            }}
          >
            <Table size="small" stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell><b>BROADCASTER</b></TableCell>
                  <TableCell align="right"><b>SECONDS</b></TableCell>
                  <TableCell align="right"><b>MARKET SHARE</b></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {chartData.map((row, idx) => (
                  <TableRow key={idx}>
                    <TableCell>{row.Broadcaster}</TableCell>
                    <TableCell align="right">
                      {row.seconds?.toLocaleString()}
                    </TableCell>
                    <TableCell align="right">
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
