import React, { useEffect, useMemo, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  Cell,
} from "recharts";
import Spinner from "../../../shared/components/loaders/Spinner";
import { fetchComparisonValues } from "../../../slices/vendor/dashboardChartsSlice";
import { buildDashboardParams } from "../../../utils/dateRangeParams";

const ComparisonChart = ({
  data = {},
  selectedFrequency = "Daily", selectedDate, selectedRange }) => {
  const dispatch = useDispatch();

  const { comparisonData, isLoading } = useSelector(
    (state) => state.vendorDashboardCharts
  );

  const apiParams = useMemo(() => buildDashboardParams(selectedFrequency, selectedRange), [selectedFrequency, selectedRange]);
  const prevParamsRef = useRef(null);

  useEffect(() => {    
    if (!apiParams) {
      return;
    }
    
    const paramsString = JSON.stringify(apiParams);
    const prevParamsString = prevParamsRef.current ? JSON.stringify(prevParamsRef.current) : null;
    
    if (paramsString !== prevParamsString) {
      prevParamsRef.current = apiParams;
      dispatch(fetchComparisonValues(apiParams));
    }
  }, [dispatch, apiParams]);

  const dataToUse = comparisonData || data;

  const transformApiData = (apiData) => {
    if (!apiData || !apiData.data) return [];

    return apiData.data.map((item) => ({
      period: item.xvalue,
      taxInvoices: item.ytaxValue,
      proformaInvoices: item.yproformaValue,
    }));
  };

  const transformedData =
    dataToUse && dataToUse.data ? transformApiData(dataToUse) : null;
  const chartData = transformedData || [];
  const hasData = chartData && chartData.length > 0;
  
  // Check if all values are zero
  const allValuesZero = chartData.every(item => 
    (item.taxInvoices || 0) === 0 && (item.proformaInvoices || 0) === 0
  );

  // Create default data for empty chart display
  const getDefaultChartData = () => {
    const defaultPeriods = {
      "Daily": ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
      "Weekly": ["Week 1", "Week 2", "Week 3", "Week 4"],
      "Monthly": ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
      "Quarterly": ["Q1", "Q2", "Q3", "Q4"],
      "Yearly": ["2017", "2018", "2019", "2020", "2021", "2022", "2023", "2024"]
    };
    
    const periods = defaultPeriods[selectedFrequency] || ["Period 1", "Period 2", "Period 3"];
    return periods.map(period => ({
      period,
      taxInvoices: 0,
      proformaInvoices: 0
    }));
  };

  // Use default data only when there's no data at all, not when all values are zero
  const displayData = !hasData ? getDefaultChartData() : chartData;
  const isHighlighted = (period) => {
    if (!selectedDate || !selectedRange) return false;
    const currentPeriod = getCurrentPeriodFromDate(
      selectedDate,
      selectedFrequency
    );
    return period === currentPeriod;
  };
  const getCurrentPeriodFromDate = (date, frequency) => {
    if (!date) return null;

    const d = new Date(date);
    switch (frequency) {
      case "Daily":
        const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
        return days[d.getDay()];
      case "Weekly":
        const start = new Date(d.getFullYear(), 0, 1);
        const dayCount = Math.floor((d - start) / (24 * 60 * 60 * 1000));
        const weekNumber = Math.ceil((dayCount + start.getDay() + 1) / 7);
        return `Week ${weekNumber}`;
      case "Monthly":
        const months = [
          "Jan",
          "Feb",
          "Mar",
          "Apr",
          "May",
          "Jun",
          "Jul",
          "Aug",
          "Sep",
          "Oct",
          "Nov",
          "Dec",
        ];
        return months[d.getMonth()];
      case "Quarterly":
        const quarter = Math.floor(d.getMonth() / 3) + 1;
        return `Q${quarter}`;
      case "Yearly":
        return d.getFullYear().toString();
      default:
        return null;
    }
  };

  const getYAxisDomain = (data = []) => {
    // Calculate dynamic domain based on actual data
    if (data && data.length > 0) {
      const maxValue = Math.max(
        ...data.map(item => Math.max(item.taxInvoices || 0, item.proformaInvoices || 0))
      );
      const safeMaxValue = isFinite(maxValue) && maxValue > 0 ? maxValue : 0;
      
      if (safeMaxValue === 0) {
        return [0, 10]; 
      }
      
      const paddedMax = Math.ceil(safeMaxValue * 1.2);
      
      let roundedMax;
      if (paddedMax <= 10) {
        roundedMax = Math.ceil(paddedMax / 2) * 2;
      } else if (paddedMax <= 50) {
        roundedMax = Math.ceil(paddedMax / 5) * 5; 
      } else if (paddedMax <= 100) {
        roundedMax = Math.ceil(paddedMax / 10) * 10;
      } else if (paddedMax <= 500) {
        roundedMax = Math.ceil(paddedMax / 50) * 50; 
      } else if (paddedMax <= 1000) {
        roundedMax = Math.ceil(paddedMax / 100) * 100; 
      } else {
        roundedMax = Math.ceil(paddedMax / 500) * 500; 
      }
      
      return [0, roundedMax];
    }

    return [0, 100];
  };

  const yAxisDomain = getYAxisDomain(chartData);
  
  const generateYAxisTicks = (domain) => {
    const [min, max] = domain;
    const maxValue = max;
    
    if (maxValue <= 0) {
      return [0, 5, 10];
    }
 
    let step;
    if (maxValue <= 10) {
      step = Math.max(1, Math.ceil(maxValue / 5));
    } else if (maxValue <= 50) {
      step = Math.max(2, Math.ceil(maxValue / 5));
    } else if (maxValue <= 100) {
      step = Math.max(5, Math.ceil(maxValue / 5));
    } else if (maxValue <= 500) {
      step = Math.max(10, Math.ceil(maxValue / 5));
    } else if (maxValue <= 1000) {
      step = Math.max(50, Math.ceil(maxValue / 5));
    } else {
      step = Math.max(100, Math.ceil(maxValue / 5));
    }
    
    const ticks = [];
    for (let i = 0; i <= maxValue; i += step) {
      ticks.push(i);
    }
    
    if (ticks.length < 3) {
      ticks.push(maxValue);
    }
    
    return ticks;
  };
  
  const yAxisTicks = generateYAxisTicks(yAxisDomain);

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const allValuesZero = payload.every((entry) => entry.value === 0);
      if (allValuesZero) {
        return null;
      }

      return (
        <div className="comparison-tooltip">
          <div className="tooltip-header">
            <p className="tooltip-label">{label}</p>
          </div>
          <div className="tooltip-content">
            {payload.map((entry, index) => (
              <div key={index} className="tooltip-item">
                <div className="tooltip-item-left">
                  <div
                    className="tooltip-dot"
                    style={{ backgroundColor: entry.color }}
                  ></div>
                  <span className="tooltip-name">{entry.name}</span>
                </div>
                <span className="tooltip-value">{entry.value}</span>
              </div>
            ))}
          </div>
        </div>
      );
    }
    return null;
  };

  const CustomBar = ({ dataKey, name, fill, mutedFill, ...props }) => {
    return (
      <Bar dataKey={dataKey} name={name} fill={fill} {...props}>
        {chartData.map((entry, index) => {
          const isHighlightedBar = isHighlighted(entry.period);
          return (
            <Cell
              key={`cell-${index}`}
              fill={isHighlightedBar ? fill : mutedFill}
            />
          );
        })}
      </Bar>
    );
  };

  const CustomLegend = () => {
    return (
      <div className="custom-legend">
        <div className="legend-item">
          <div
            className="legend-color-bar"
            style={{ backgroundColor: "#C0D8F0" }}
          ></div>
          <span className="legend-text">Tax Invoices</span>
        </div>
        <div className="legend-item">
          <div
            className="legend-color-bar"
            style={{ backgroundColor: "#84A6FA" }}
          ></div>
          <span className="legend-text">Proforma Invoices</span>
        </div>
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="comparison-chart">
        <div className="chart-header">
          <h3 className="chart-title">
            Comparison of Tax Invoices vs Proforma Invoices
          </h3>
          <CustomLegend />
        </div>
        <div className="spin-container">
          <Spinner />
        </div>
      </div>
    );
  }


  return (
    <div className="comparison-chart">
      <div className="chart-header">
        <h3 className="chart-title">
          Comparison of Tax Invoices vs Proforma Invoices
        </h3>
        <CustomLegend />
      </div>

      <div className="chart-container">
        <ResponsiveContainer width="100%" height={400} minWidth={600}>
          <BarChart
            key={selectedFrequency}
            data={displayData}
            margin={{
              top: 20,
              right: 0,
              left: -10,
              bottom: 21,
            }}
          >
            <CartesianGrid
              strokeDasharray=""
              stroke="#E4EAF2"
              strokeWidth={1}
              opacity={0.8}
              horizontal={true}
              vertical={false}
            />
            <XAxis
              dataKey="period"
              stroke="#0B1426"
              fontSize={14}
              fontWeight={500}
              tick={{ dy: 16 }}
              tickLine={false}
              axisLine={{ stroke: "#E4EAF2" }}
            />
            <YAxis
              stroke="#0B1426"
              fontSize={14}
              fontWeight={400}
              domain={yAxisDomain}
              ticks={yAxisTicks}
              axisLine={false}
              tick={{ dx: -16 }}
              tickLine={false}
            />
            <Tooltip
              content={<CustomTooltip />}
              cursor={false}
              wrapperStyle={{ background: "#F8F8FF" }}
            />
            <CustomBar
              dataKey="taxInvoices"
              name="Tax Invoices"
              fill="#C0D8F0"
              mutedFill="#E4EAF2"
              radius={[2, 2, 0, 0]}
              isAnimationActive={false}
            />
            <CustomBar
              dataKey="proformaInvoices"
              name="Proforma Invoices"
              fill="#84A6FA"
              mutedFill="#C5CCD8"
              radius={[2, 2, 0, 0]}
              isAnimationActive={false}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default ComparisonChart;
