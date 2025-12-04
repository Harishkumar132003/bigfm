import React from "react";
import Plot from "react-plotly.js";
import Plotly from "plotly.js-dist-min";
import { Box } from '@mui/material';

const ChartRenderer = ({ data }) => {
  const parsedChart = data?.chart ? data.chart : data;

  if (!parsedChart || parsedChart.type === "text") {
    return <p>No chart data available</p>;
  }

  const {
    chart_type,
    labels,
    values,
    datasets,
    colors,
    title,
    hole,
    x,
    y,
    z,
    options
  } = parsedChart;

  // ------------------------------------------
  // BASE LAYOUT
  // ------------------------------------------
  const wrapTitle = (text, maxWordsPerLine = 5) => {
  if (!text) return "";
  const words = text.split(" ");
  let result = [];
  for (let i = 0; i < words.length; i += maxWordsPerLine) {
    result.push(words.slice(i, i + maxWordsPerLine).join(" "));
  }
  return result.join("<br>");
};
  const layout = {
    title: {
      text: wrapTitle(title),
      x: 0.5,
      xanchor: "center",
      font: { size: 18, weight: "bold",}
    },
    margin: { t: 60, b: 30, l: 20, r: 20 },
    paper_bgcolor: "transparent",
    plot_bgcolor: "transparent",
    autosize: true
  };

  // ------------------------------------------
  // SPECIAL LAYOUT FOR RADAR
  // ------------------------------------------
  if (chart_type === "radar") {
    layout.polar = {
      radialaxis: { visible: true, tickfont: { size: 12 } },
      angularaxis: { tickfont: { size: 12 } }
    };
  }

  // ------------------------------------------
  // SPECIAL LAYOUT FOR HEATMAP
  // ------------------------------------------
  if (chart_type === "heatmap") {
    layout.xaxis = { automargin: true };
    layout.yaxis = { automargin: true };
  }

  // ------------------------------------------
  // DEFAULT AXES (BAR/LINE ONLY)
  // ------------------------------------------
  if (!["pie", "radar", "heatmap"].includes(chart_type)) {
    layout.xaxis = {
      type: "category",
      tickangle: -45,
      automargin: true,
      fixedrange: true
    };
    layout.yaxis = {
      tickformat: ",",
      separatethousands: true,
      fixedrange: true
    };
  }

  // ------------------------------------------
  // HIDE AXES FOR PIE/DONUT
  // ------------------------------------------
  if (chart_type === "pie") {
    layout.xaxis = { visible: false };
    layout.yaxis = { visible: false };
  }

  // ------------------------------------------
  // PLOTDATA HANDLING
  // ------------------------------------------
  let plotData = [];

  // 1️⃣ HEATMAP
  if (chart_type === "heatmap") {
    plotData = [
      {
        type: "heatmap",
        x: x ?? labels,
        y: y,
        z: z,
        colorscale: options?.colorscale || "Viridis"
      }
    ];
  }

  // 2️⃣ RADAR (Scatterpolar)
  else if (chart_type === "radar") {
    plotData = [
      {
        type: "scatterpolar",
        r: values,
        theta: labels,
        fill: "toself",
        marker: { color: colors?.[0] || "#3b82f6" }
      }
    ];
  }

  // 3️⃣ MULTI-SERIES (BAR / LINE)
  else if (datasets && Array.isArray(datasets)) {
    plotData = datasets.map((ds) => ({
      x: labels,
      y: ds.data,
      type: chart_type,
      mode: chart_type === "line" ? "lines+markers" : undefined,
      marker: { color: ds.color },
      name: ds.label
    }));
  }

  // 4️⃣ PIE / DONUT
  else if (chart_type === "pie") {
    plotData = [
      {
        labels,
        values,
        type: "pie",
        marker: { colors },
        hole: hole ?? 0
      }
    ];
  }

  // 5️⃣ SINGLE-SERIES BAR / LINE
  else {
    plotData = [
      {
        x: labels,
        y: values,
        type: chart_type,
        marker: { color: colors?.[0] || "#3b82f6" }
      }
    ];
  }

  return (
    <Box
    sx={{
      width: "100%",
      height: { xs: 260, sm: 300, md: 360 }, // responsive height
    }}
  >
    <Plot
      data={plotData}
      layout={layout}
      config={{ responsive: true, displayModeBar: false }}
      onInitialized={(figure, graphDiv) => {
        graphDiv._fullLayout._plotly = Plotly;
      }}
       style={{ width: "100%", height: "100%" }}  
      onUpdate={(figure, graphDiv) => {
        graphDiv._fullLayout._plotly = Plotly;
      }}
      useResizeHandler
    />
    </Box>
  );
};

export default ChartRenderer;
