import React, { useEffect, useMemo, useRef, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend } from "recharts";
import Spinner from "../../../shared/components/loaders/Spinner";
import { fetchJobCompletionRate } from "../../../slices/vendor/dashboardChartsSlice";
import { buildDashboardParams } from "../../../utils/dateRangeParams";

const ServiceCompletionRate = ({ selectedFrequency = "Daily", selectedDate, selectedRange }) => {
  const dispatch = useDispatch();
  const { completionRateData, isLoading, error } = useSelector(
    (state) => state.vendorDashboardCharts
  );

  const apiParams = useMemo(() => buildDashboardParams(selectedFrequency, selectedRange), [selectedFrequency, selectedRange]);

  const prevParamsRef = useRef(null);

  useEffect(() => {
    if (!apiParams) return;
    const curr = JSON.stringify(apiParams);
    const prev = prevParamsRef.current ? JSON.stringify(prevParamsRef.current) : null;
    if (curr !== prev) {
      prevParamsRef.current = apiParams;
      dispatch(fetchJobCompletionRate(apiParams));
    }
  }, [dispatch, apiParams]);

  const dataToUse = completionRateData;

  const startedPercent = parseFloat(
    dataToUse?.STARTED?.replace("%", "") || "0"
  );
  const completedPercent = parseFloat(
    dataToUse?.COMPLETED?.replace("%", "") || "0"
  );
  const pausedPercent = parseFloat(dataToUse?.PAUSED?.replace("%", "") || "0");

  const total = startedPercent + completedPercent + pausedPercent;
  const hasData = dataToUse && Object.keys(dataToUse).length > 0;

  const chartData =
    total === 0 || !hasData
      ? []
      : [
          {
            name: "Started",
            value: total > 0 ? (startedPercent / total) * 100 : startedPercent,
            color: "var(--chart-started-color)",
          },
          {
            name: "Completed",
            value:
              total > 0 ? (completedPercent / total) * 100 : completedPercent,
            color: "var(--chart-completed-color)",
          },
          {
            name: "Paused",
            value: total > 0 ? (pausedPercent / total) * 100 : pausedPercent,
            color: "var(--chart-paused-color)",
          },
        ];

  const legendData =
    total === 0 || !hasData
      ? []
      : [
          {
            name: "Started",
            color: "var(--chart-started-color)",
          },
          {
            name: "Paused",
            color: "var(--chart-paused-color)",
          },
          {
            name: "Completed",
            color: "var(--chart-completed-color)",
          },
        ];

  const renderCustomizedLabel = ({
    cx,
    cy,
    midAngle,
    innerRadius,
    outerRadius,
    percent,
    index,
  }) => {
    // Show labels for all values, even very small ones

    const RADIAN = Math.PI / 180;

    const radius = outerRadius;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    const originalPercentages = [
      startedPercent,
      completedPercent,
      pausedPercent,
    ];
    // Do not display percentage label if the original percentage is 0
    if (!originalPercentages[index] || originalPercentages[index] === 0) {
      return null;
    }
    const percentage = `${originalPercentages[index].toFixed(1)}%`;

    return (
      <g>
        <rect
          x={x - 25}
          y={y - 20}
          width={55}
          height={24}
          rx={4}
          ry={3}
          fill="var(--chart-background-color)"
          stroke="none"
          filter="drop-shadow(0px 1.85px 6.25px rgba(0,0,0,0.19))"
          style={{ padding: "4px" }}
        />
        <text
          x={x+2}
          y={y - 8}
          fill="var(--chart-text-color)"
          textAnchor="middle"
          dominantBaseline="central"
          fontSize="14"
          fontWeight="600"
          style={{ fill: "var(--chart-text-color)" }}
        >
          {percentage}
        </text>
      </g>
    );
  };

  if (isLoading) {
    return (
      <div className="service-completion-rate">
        <div className="chart-header">
          <h3 className="chart-title">Service Completion Rate</h3>
        </div>
        <div className="spin-container">
          <Spinner />
        </div>
      </div>
    );
  }

  return (
    <div className="service-completion-rate">
      <div className="chart-header">
        <h3 className="chart-title">Service Completion Rate</h3>
      </div>

      <div className="chart-legend-container">
        <div className="chart-legend">
          {legendData.map((item, index) => (
            <div key={index} className="legend-item">
              <div className="legend-color " style={{ backgroundColor: item.color }}></div>
              <span className="legend-label">{item.name}</span>
            </div>
          ))}
        </div>

        <div className="chart-container">
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={
                  chartData.length > 0
                    ? chartData
                    : [
                        {
                          name: "Empty",
                          value: 100,
                          color: "var(--chart-empty-color)",
                        },
                      ]
                }
                cx="50%"
                cy="50%"
                labelLine={false}
                label={chartData.length > 0 ? renderCustomizedLabel : null}
                outerRadius={130}
                innerRadius={56}
                fill="#8884d8"
                dataKey="value"
                startAngle={90}
                endAngle={450}
                isAnimationActive={false}
                activeShape={false}
                stroke="none"
                strokeWidth={0}
              >
                {(chartData.length > 0
                  ? chartData
                  : [
                      {
                        name: "Empty",
                        value: 100,
                        color: "var(--chart-empty-color)",
                      },
                    ]
                ).map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>

          <div className="chart-center-text">
            <div className="center-label">
              <div>Total</div>
              <div>Completion</div>
              <div>Rate</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ServiceCompletionRate;
