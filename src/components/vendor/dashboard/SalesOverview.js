import React, { useEffect, useMemo, useCallback, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchSalesStats } from "../../../slices/vendor/dashboardChartsSlice";
import Spinner from "../../../shared/components/loaders/Spinner";
import { buildDashboardParams } from "../../../utils/dateRangeParams";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Cell,
  Text,
  CartesianGrid,
} from "recharts";

const SalesOverview = ({selectedFrequency = "Daily", selectedDate, selectedRange}) => {
  const staticNames = ["Service Sales", "Spare Parts\nSales"];
  const dispatch = useDispatch();
  const { salesData, isLoading, error } = useSelector(
    (state) => state.vendorDashboardCharts
  );

  const data = useMemo(() => {
    const serviceValue = Number(salesData?.serviceSalesCount || 0);
    const spareValue = Number(salesData?.sparePartSalesCount || 0);
    return [
      { value: serviceValue },
      { value: spareValue },
    ];
  }, [salesData]);
  const apiParams = useMemo(() => buildDashboardParams(selectedFrequency, selectedRange), [selectedFrequency, selectedRange]);
  const prevParamsRef = useRef(null);
  
  const chartData = useMemo(() => 
    data.map((item, index) => ({
      ...item,
      name: staticNames[index] || `Item ${index + 1}`,
    })), [data]);

  useEffect(() => {    
    if (!apiParams) {
      return;
    }
    
    const paramsString = JSON.stringify(apiParams);
    const prevParamsString = prevParamsRef.current ? JSON.stringify(prevParamsRef.current) : null;
    
    if (paramsString !== prevParamsString) {
      prevParamsRef.current = apiParams;
      dispatch(fetchSalesStats(apiParams));
    }
  }, [dispatch, apiParams]);

  const YAxisLeftTick = ({ y, payload: { value } }) => {
    const lines = value.split("\n");
    return (
      <g>
        {lines.map((line, index) => (
          <Text
            key={index}
            x={10}
            y={y + index * 20}
            textAnchor="start"
            verticalAnchor="middle"
            scaleToFit
            fontSize={12}
            fontWeight={500}
            fill="#0B1426"
          >
            {line}
          </Text>
        ))}
      </g>
    );
  };

  let ctx;

  const measureText14HelveticaNeue = (text) => {
    if (!ctx) {
      ctx = document.createElement("canvas").getContext("2d");
      ctx.font = "14px 'Helvetica Neue'";
    }
    return ctx.measureText(text).width;
  };

  const BAR_AXIS_SPACE = 10;

  const maxTextWidth = useMemo(
    () =>
      chartData.reduce((acc, cur) => {
        const value = cur.value;
        const formatted = Number(value).toLocaleString("en-US");
        const width = measureText14HelveticaNeue(String(formatted));
        if (width > acc) {
          return width;
        }
        return acc;
      }, 0),
    [chartData]
  );

  const getColor = (index) => {
    return index === 0 ? "#A8DCFA" : "#8399A5";
  };

  const formatNumber = useCallback((num) => {
    return Number(num || 0).toLocaleString("en-US");
  }, []);

  const renderBarLabel = useCallback((props) => {
    const { x, y, width, height, value } = props;
    const text = formatNumber(value);
    return (
      <text
        x={x + width + 12}
        y={y + height / 2}
        textAnchor="start"
        dominantBaseline="middle"
        fontSize={14}
        fontWeight={500}
        fill="#676E7E"
      >
        {text}
      </text>
    );
  }, [formatNumber]);

  // Calculate dynamic domain with nice tick points
  const calculateNiceDomain = (maxValue) => {
    if (!maxValue || maxValue <= 0) {
      // Fallback domain when both values are 0
      return 5;
    }
    const magnitude = Math.pow(10, Math.floor(Math.log10(maxValue)));
    const normalizedMax = maxValue / magnitude;
    let niceMax;
    if (normalizedMax <= 1) niceMax = 1;
    else if (normalizedMax <= 2) niceMax = 2;
    else if (normalizedMax <= 5) niceMax = 5;
    else niceMax = 10;
    return niceMax * magnitude;
  };

  const maxValue = Math.max(...chartData.map((item) => item.value));
  const domainMax = calculateNiceDomain(maxValue);
  
  // Memoized chart to prevent re-renders
  const MemoizedChart = useMemo(() => {
    if (isLoading && !salesData) {
      return (
        <div className="sales-overview-chart">
          <div className="widget-header">
            <h3 className="widget-title">Sales Overview</h3>
          </div>
          <div className="chart-container">
            <div className="spin-container">
              <Spinner />
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="sales-overview-chart">
        <div className="chart-header">
          <h3 className="chart-title">Sales Overview</h3>
        </div>

        <div className="chart-container">
          <ResponsiveContainer width="100%" height={200}>
            <BarChart
              data={chartData}
              layout="vertical"
              margin={{
                left: 35,
                right: maxTextWidth + BAR_AXIS_SPACE + 20,
                top: 20,
                bottom: 50,
              }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="#E4EAF2"
                strokeWidth={1}
                opacity={0.8}
                horizontal={false}
                vertical={true}
              />
              <XAxis
                type="number"
                stroke="#001523"
                fontSize={14}
                fontWeight={400}
                tick={{ dy: 24 }}
                tickLine={false}
                axisLine={false}
                domain={[0, domainMax]}
                allowDecimals={false}
                tickCount={6}
                tickFormatter={(value) => formatNumber(value)}
                label={{
                  value: "Sales Volume (Rs)",
                  position: "insideBottom",
                  offset: -47,
                  fontSize: 12,
                  fontWeight: 500,
                  fill: "#999FAC",
                }}
              />
              <YAxis
                yAxisId={0}
                dataKey="name"
                type="category"
                axisLine={{ stroke: "#E4EAF2", strokeWidth: 1 }}
                tickLine={false}
                tick={YAxisLeftTick}
              />
              <Bar
                dataKey="value"
                minPointSize={2}
                barSize={12}
                radius={[0, 4, 4, 0]}
                label={renderBarLabel}
              >
                {chartData.map((d, idx) => {
                  return <Cell key={`${d.name}-${d.value}`} fill={getColor(idx)} />;
                })}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    );
  }, [isLoading, salesData, chartData, maxTextWidth, domainMax, renderBarLabel, formatNumber]);

  return MemoizedChart;
};

export default SalesOverview;
