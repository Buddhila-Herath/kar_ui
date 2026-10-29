import React, { useEffect, useMemo, useCallback, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchEstimatesCount, clearEstimatesCountError } from "../../../slices/vendor/dashboardChartsSlice";
import Spinner from "../../../shared/components/loaders/Spinner";
import { buildDashboardParams } from "../../../utils/dateRangeParams";

const EstimateStatus = ({ selectedFrequency = "Daily", selectedDate, selectedRange }) => {
  const dispatch = useDispatch();
  const { estimatesCountData, isLoading, error } = useSelector(
    (state) => state.vendorDashboardCharts
  );

  const defaultEstimateData = {
    approved: 0,
    pending: 0,
    rejected: 0,
  };

  const estimateData = estimatesCountData
    ? {
        approved: estimatesCountData.approvedQuoteCount || 0,
        pending: estimatesCountData.pendingQuoteCount || 0,
        rejected: estimatesCountData.rejectedQuoteCount || 0,
      }
    : defaultEstimateData;

  const apiParams = useMemo(() => buildDashboardParams(selectedFrequency, selectedRange), [selectedFrequency, selectedRange]);

  const prevParamsRef = useRef(null);

  useEffect(() => {
    dispatch(clearEstimatesCountError());
  }, [dispatch]);

  useEffect(() => {    
    if (!apiParams) {
      return;
    }
    
    const paramsString = JSON.stringify(apiParams);
    const prevParamsString = prevParamsRef.current ? JSON.stringify(prevParamsRef.current) : null;
    
    if (paramsString !== prevParamsString) {
      prevParamsRef.current = apiParams;
      dispatch(fetchEstimatesCount(apiParams));
    }
  }, [dispatch, apiParams]);

  const maxValue = Math.max(...Object.values(estimateData));
  const safeMaxValue = isFinite(maxValue) && maxValue > 0 ? maxValue : 0;

  const roundedMax = safeMaxValue > 0 ? Math.ceil(safeMaxValue / 20) * 20 : 0;

  const axisStep = Math.max(1, Math.ceil((safeMaxValue || 0) / 5));
  const axisMax = axisStep * 5;

  const ticks = Array.from({ length: 6 }, (_, i) => i * axisStep);

  const calculateBarWidth = (value) => {
    if (!axisMax || axisMax <= 0) {
      return 0;
    }
    const exactPosition = (value / axisMax) * 100;
    return Math.max(exactPosition, 0);
  };

  const shouldShowAboveBar = (width) => {
    // Check if we're in mobile view (screen width <= 768px)
    const isMobile = window.innerWidth <= 768;
    const threshold = isMobile ? 70 : 90;
    return width > threshold;
  };

  const estimateStatuses = [
    {
      label: "Approved",
      value: estimateData.approved,
      className: "approved",
      width: calculateBarWidth(estimateData.approved),
      showAboveBar: shouldShowAboveBar(
        calculateBarWidth(estimateData.approved)
      ),
      shouldSubtract: calculateBarWidth(estimateData.approved) > 40,
    },
    {
      label: "Pending",
      value: estimateData.pending,
      className: "pending",
      width: calculateBarWidth(estimateData.pending),
      showAboveBar: shouldShowAboveBar(calculateBarWidth(estimateData.pending)),
      shouldSubtract: calculateBarWidth(estimateData.pending) > 40,
    },
    {
      label: "Rejected",
      value: estimateData.rejected,
      className: "rejected",
      width: calculateBarWidth(estimateData.rejected),
      showAboveBar: shouldShowAboveBar(
        calculateBarWidth(estimateData.rejected)
      ),
      shouldSubtract: calculateBarWidth(estimateData.rejected) > 40,
    },
  ];

  if (isLoading) {
    return (
      <div className="estimate-status-widget">
        <div className="widget-header">
          <h3 className="widget-title">Estimates Status</h3>
        </div>
        <div className="chart-container">
          <div className="spin-container">
            <Spinner />
          </div>
        </div>
      </div>
    );
  }

  if (!apiParams) {
    return (
      <div className="estimate-status-widget">
        <div className="widget-header">
          <h3 className="widget-title">Estimates Status</h3>
        </div>
        <div className="chart-container">
          <div className="spin-container">
            <Spinner />
          </div>
        </div>
      </div>
    );
  }

  const hasUsableData = !!estimatesCountData;
  if (error && !isLoading && !hasUsableData) {
    return (
      <div className="estimate-status-widget">
        <div className="widget-header">
          <h3 className="widget-title">Estimates Status</h3>
        </div>
        <div className="chart-container">
          <div className="horizontal-bar-chart">
            <div className="chart-content">
              <span className="x-axis-label">Error loading estimates data: {error}</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="estimate-status-widget">
      <div className="widget-header">
        <h3 className="widget-title">Estimates Status</h3>
      </div>

      <div className="chart-container">
        <div className="horizontal-bar-chart">
          <div className="chart-content">
            <div className="chart-bars">
              {estimateStatuses.map((status, index) => (
                <div key={index} className="bar-row">
                  <div className="bar-label">{status.label}</div>
                  <div
                    className="bar-container"
                    style={{
                      "--bar-width": `${status.width}%`,
                    }}
                  >
                    <div
                      className={`bar-fill ${
                        status.className === "rejected" ? "rejected-fill" : ""
                      } ${status.className} ${
                        status.shouldSubtract ? "subtract-width" : "no-subtract"
                      }`}
                    ></div>
                    <span
                      className={`bar-value ${
                        status.showAboveBar ? "above-bar" : ""
                      }`}
                    >
                      {status.value}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <div className="chart-x-axis">
              <div className="axis-ticks">
                {ticks.map((tick) => (
                  <div key={tick} className="tick">
                    <span className="tick-label">{tick}</span>
                  </div>
                ))}
              </div>
            </div>
            <span className="x-axis-label">Estimates Count</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EstimateStatus;
