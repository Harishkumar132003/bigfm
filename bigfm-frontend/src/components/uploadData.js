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
import axios from "axios";
const { RangePicker } = DatePicker;

const UploadData = () => {
  const [city, setCity] = useState("");
  const [dateRange, setDateRange] = useState(null);
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      alert("⚠ Please fill all fields before submitting!");
      return;
    }

    // const formattedFrom = dateRange[0]?.format("YYYY-MM-DD");
    // const formattedTo = dateRange[1]?.format("YYYY-MM-DD");

    const formData = new FormData();
    // formData.append("city", city);
    // formData.append("date_from", formattedFrom);
    // formData.append("date_to", formattedTo);
    formData.append("file", file);

    try {
      setLoading(true);

      const res = await axios.post(
        "http://localhost:5000/upload_market_data",
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );

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
        elevation={3}
        sx={{
          p: 4,
          borderRadius: 3,
          background: "linear-gradient(135deg, #FFFFFF 0%, #F0F9FF 50%, #deeff9 100%)",
          border: "1px solid #E0F2FE",
          boxShadow: "0px 8px 24px rgba(0, 120, 212, 0.1)",
        }}
      >
        <Typography 
          variant="h5" 
          fontWeight={700} 
          sx={{ 
            mb: 3, 
            textAlign: "center",
            color: "#1E293B",
            letterSpacing: "-0.01em"
          }}
        >
          Upload Market Data
        </Typography>

        <Stack component="form" spacing={3} onSubmit={handleSubmit}>
          {/* <TextField
            select
            fullWidth
            label="Select Origin / City"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            sx={{
              "& .MuiOutlinedInput-root": {
                borderRadius: "10px",
                backgroundColor: "#FFFFFF",
                transition: "all 0.2s ease-in-out",
                "&:hover": {
                  backgroundColor: "#F8FAFC",
                },
                "&.Mui-focused": {
                  backgroundColor: "#FFFFFF",
                  "& .MuiOutlinedInput-notchedOutline": {
                    borderColor: "#0078D4",
                    borderWidth: 2,
                  },
                },
              },
            }}
          >
            {originlist.map((item, index) => (
              <MenuItem key={index} value={item}>
                {item}
              </MenuItem>
            ))}
          </TextField> */}

          {/* <Box>
            <Typography 
              sx={{ mb: 1 }} 
              fontSize="0.9rem" 
              fontWeight={600}
              color="#475569"
            >
              Date Range
            </Typography>
            <RangePicker
              value={dateRange}
              onChange={(dates) => setDateRange(dates)}
              style={{
                width: "100%",
                height: "54px",
                borderRadius: "10px",
                fontSize: "16px",
                padding: "10px 14px",
                border: "1px solid #CBD5E1",
                transition: "all 0.2s ease-in-out",
              }}
              className="custom-range-picker"
            />
          </Box> */}

          <Button
            component="label"
            variant="outlined"
            sx={{
              py: 1.8,
              borderRadius: 2.5,
              borderStyle: "dashed",
              borderWidth: 2,
              borderColor: "#0078D4",
              color: "#0078D4",
              backgroundColor: "#FFFFFF",
              fontWeight: 600,
              transition: "all 0.3s ease-in-out",
              "&:hover": {
                borderColor: "#FFD500",
                backgroundColor: "#FFFBEB",
                color: "#005A9E",
                transform: "translateY(-2px)",
                boxShadow: "0px 4px 12px rgba(0, 120, 212, 0.15)",
              }
            }}
            startIcon={<CloudUploadIcon sx={{ fontSize: "24px !important" }} />}
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
              py: 1.8,
              fontSize: "1rem",
              fontWeight: 700,
              borderRadius: 2.5,
              background: "#0078D4",
              boxShadow: "0px 4px 12px rgba(0, 120, 212, 0.25)",
              transition: "all 0.3s ease-in-out",
              "&:hover": {
                background: "linear-gradient(135deg, #005A9E 0%, #004578 100%)",
                transform: "translateY(-2px)",
                boxShadow: "0px 6px 16px rgba(0, 120, 212, 0.35)",
              },
              "&:disabled": {
                background: "linear-gradient(135deg, #94A3B8 0%, #64748B 100%)",
                color: "#FFFFFF",
              }
            }}
          >
            {loading ? "Uploading..." : "Submit Data"}
          </Button>
        </Stack>
      </Paper>
    </Box>
  );
};

export default UploadData;