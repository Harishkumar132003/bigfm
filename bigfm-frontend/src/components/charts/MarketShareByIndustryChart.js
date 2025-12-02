// src/components/charts/UpsellOpportunities.js
import React, { useState, useEffect } from 'react';
import {
  Box, Paper, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Typography, Chip, CircularProgress
} from '@mui/material';
import axios from 'axios';

const UpsellOpportunities = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('category');
  const [error, setError] = useState(null);

  const fetchData = async (filterType) => {
    try {
      setLoading(true);
      const response = await axios.get(`/getUpsellOpportunities?type=${filterType}`);
      setData(response.data.opportunities);
      setError(null);
    } catch (err) {
      console.error('Error fetching upsell opportunities:', err);
      setError('Failed to load upsell opportunities');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData(filter);
  }, [filter]);

  const handleFilterChange = (newFilter) => {
    setFilter(newFilter);
  };

  const filters = [
    { key: 'category', label: 'By Category' },
    { key: 'station', label: 'By Station' },
    { key: 'brand_name', label: 'By Brand' }
  ];

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight={300}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight={200}>
        <Typography color="error">{error}</Typography>
      </Box>
    );
  }

  return (
    <Box>
      <Box display="flex" gap={1} mb={2} flexWrap="wrap">
        {filters.map((item) => (
          <Chip
            key={item.key}
            label={item.label}
            onClick={() => handleFilterChange(item.key)}
            color={filter === item.key ? 'primary' : 'default'}
            variant={filter === item.key ? 'filled' : 'outlined'}
            sx={{ mb: 1 }}
          />
        ))}
      </Box>

      <TableContainer component={Paper} sx={{ borderRadius: 2 }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell><strong>{filter.toUpperCase()}</strong></TableCell>
              <TableCell align="right"><strong>MARKET SHARE</strong></TableCell>
              <TableCell align="right"><strong>TOTAL VOLUME</strong></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {data?.map((row, index) => (
              <TableRow key={index}>
                <TableCell>{row.name || 'N/A'}</TableCell>
                <TableCell align="right">{row.market_share}%</TableCell>
                <TableCell align="right">{Math.round(row.total_seconds).toLocaleString()}</TableCell>
                
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default UpsellOpportunities;