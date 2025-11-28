import React, { useState } from "react";
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  MenuItem,
  Stack
} from "@mui/material";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import { originlist } from "../constant/constantValue";
import { DatePicker } from "antd";
import axios from "axios"; // ⬅️ Important
const { RangePicker } = DatePicker;

const UploadData = () => {
  const [city, setCity] = useState("");
  const [dateRange, setDateRange] = useState(null);
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!city || !dateRange || !file) {
      alert("⚠ Please fill all fields before submitting!");
      return;
    }

    const formattedFrom = dateRange[0]?.format("YYYY-MM-DD");
    const formattedTo = dateRange[1]?.format("YYYY-MM-DD");

    const formData = new FormData();
    formData.append("city", city);
    formData.append("date_from", formattedFrom);
    formData.append("date_to", formattedTo);
    formData.append("file", file);

    try {
      setLoading(true);

      const res = await axios.post(
        "http://localhost:5000/upload_market_data",  // ⬅️ Your backend API URL
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );

      setCity("");
      setDateRange(null);
      setFile(null);

      alert("🚀 Data Uploaded Successfully!");
      console.log("Response:", res.data);

      // reset form
      setCity("");
      setDateRange(null);
      setFile(null);

    } catch (err) {
      console.error(err);
      alert("❌ Upload failed! Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ maxWidth: 700, margin: "0 auto", mt: 4 }}>
      <Paper
        elevation={4}
        sx={{
          p: 4,
          borderRadius: 4,
          background:
            "linear-gradient(135deg, #fafaff 0%, #f1ecff 60%, #e5faff 100%)"
        }}
      >
        <Typography variant="h5" fontWeight={700} sx={{ mb: 3,textAlign: "center" }}>
           Upload Market Data
        </Typography>

        <Stack component="form" spacing={2.4} onSubmit={handleSubmit}>
          <TextField
            select
            fullWidth
            label="Select Origin / City"
            value={city}
            onChange={(e) => setCity(e.target.value)}
          >
            {originlist.map((item, index) => (
              <MenuItem key={index} value={item}>
                {item}
              </MenuItem>
            ))}
          </TextField>

          <Box>
            <Typography sx={{ mb: 0.5 }} fontSize="0.9rem" fontWeight={500}>
              Date Range
            </Typography>
            <RangePicker
              value={dateRange}              
              onChange={(dates) => setDateRange(dates)}
              style={{
                width: "100%",
                height: "52px",
                borderRadius: "12px",
                fontSize: "16px",
                padding: "10px 14px",
                border: "1px solid rgba(0,0,0,0.23)",
              }}
              className="custom-range-picker"
            />
          </Box>

          <Button
            component="label"
            variant="outlined"
            sx={{
              py: 1.6,
              borderRadius: 2,
              borderStyle: "dashed",
              borderColor: "#7C3AED",
              color: "#7C3AED",
              "&:hover": {
                borderColor: "#06B6D4",
                color: "#06B6D4"
              }
            }}
            startIcon={<CloudUploadIcon />}
          >
            {file ? file.name : "Upload XLS / CSV File"}
            <input
              hidden
              type="file"
              accept=".csv,.xls,.xlsx"
              onChange={(e) => setFile(e.target.files[0])}
            />
          </Button>

          <Button
            type="submit"
            size="large"
            variant="contained"
            disabled={loading}
            sx={{
              mt: 2,
              py: 1.5,
              fontSize: "1rem",
              borderRadius: 2,
              background: "linear-gradient(135deg, #7C3AED 0%, #06B6D4 100%)"
            }}
          >
            {loading ? "⏳ Uploading..." : "🚀 Submit Data"}
          </Button>
        </Stack>
      </Paper>
    </Box>
  );
};

export default UploadData;
