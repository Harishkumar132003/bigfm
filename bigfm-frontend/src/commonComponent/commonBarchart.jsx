import React, { useEffect, useRef, useState } from "react";
import styled from "styled-components";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";
import { useNavigate } from "react-router-dom";

const HorizontalBarYAxisWrapper = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  pointer-events: none;
  width: 100%;
  height: 100%;

  .recharts-bar {
    display: none;
  }
  .recharts-xAxis {
    display: none;
  }
`;

const CommonBarChart = ({
  data,
  title,
  axislables,
  customewidth,
  filterDate,
}) => {
  const [width, setWidth] = useState(0);
  const [cardHeaderHeight, setCardHeaderHeight] = useState(0);
  const containerEl = useRef(null);
  const cardHeaderEl = useRef(null);
  const MARGIN = 12;
  const navigate = useNavigate();

  const HorizontalBarDataWrapper = styled.div`
    width: ${customewidth ? customewidth : "100%"};
    height: 100%;

    .recharts-yAxis {
      display: none;
    }
  `;

  useEffect(() => {
    setWidth(containerEl.current?.clientWidth || 1200);
    setCardHeaderHeight(cardHeaderEl.current?.clientHeight || 50);
  }, []);

  // ✅ Handle click on bar
  // const handleBarClick = (barData) => {
  //   if (!barData || !barData.activeLabel) return;

  //   const selectedPart = barData.activeLabel;
  //   navigate(`/surgeries/${selectedPart}/${filterDate}`);
  // };

  return (
    <div
      ref={containerEl}
      style={{
        height: `100%`,
        width: "100%",
      }}
    >
      <div ref={cardHeaderEl}>
        <p className="drag-area">{title}</p>
      </div>

      <div
        style={{
          position: "relative",
          height: `calc(100% - ${cardHeaderHeight}px - ${MARGIN}px)`,
          width: "100%",
          marginTop: "8px",
        }}
      >
        {/* Main bar chart with X-axis */}
        <div
          style={{
            height: "100%",
            overflowX: "scroll",
            overflowY: "hidden",
            width: "calc(100% - 60px)",
            float: "right",
          }}
        >
          <HorizontalBarDataWrapper>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={data}
                layout="horizontal"
                margin={{ top: 0, right: MARGIN, bottom: 20, left: 0 }}
                barGap={2}
                // onClick={handleBarClick} // ✅ Attach click handler
              >
                <CartesianGrid vertical={false} />
                <XAxis
                  type="category"
                  dataKey="name"
                  interval={0}
                  tickLine={false}
                  label={{
                    value: axislables[1],
                    position: "bottom",
                    offset: 0,
                    style: { fill: "#04777e", fontSize: 12 },
                  }}
                   angle={-20}  
                   allowDecimals={false}
                />
                <Tooltip  formatter={(val, name, item) => {
    const seconds = item?.payload?.seconds || 0;
    return [
      `Market Share: ${val}%\nSeconds: ${seconds.toLocaleString()}`,
      ""
    ]
  }} />
                <Bar
                  dataKey="value"
                  fill="#04777e"
                  barSize={20}
                  radius={[5, 5, 0, 0]}
                  cursor="pointer"
                 
                />
              </BarChart>
            </ResponsiveContainer>
          </HorizontalBarDataWrapper>
        </div>

        {/* YAxis only overlay */}
        <HorizontalBarYAxisWrapper>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data}
              layout="horizontal"
              margin={{ top: 0, right: MARGIN, bottom: 20, left: 0 }}
              barCategoryGap="10%"
              barGap={0}
            >
              <XAxis  tick={false} axisLine={false}  />
              <YAxis
                type="number"
                tickLine={false}
                label={{
                  value: axislables[0],
                  angle: -90,
                  position: "insideLeft",
                  style: { fill: "#666", fontSize: 12 },
                }}
              />
              <Bar dataKey="value" />
            </BarChart>
          </ResponsiveContainer>
        </HorizontalBarYAxisWrapper>
      </div>
    </div>
  );
};

export default CommonBarChart;