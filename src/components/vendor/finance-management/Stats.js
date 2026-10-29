import React, { useState, useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import ReactDatePicker from "../../../shared/datepicker/ReactDatePicker";
import { dateFormat } from "../../../constants";
import { notification } from "antd";
import Icons from "../../../utils/icons";
import { fetchFinanceMetrics } from "../../../slices/vendor/financeSlice";

const Stats = () => {
  const dispatch = useDispatch();
  const { financeMetrics, isMetricsLoading } = useSelector(
    (state) => state.vendorFinance
  );
  const today = useMemo(() => new Date(), []);
  const [dateRange, setDateRange] = useState([today, today]);
  const [startDate, endDate] = dateRange;
  const [isChrome, setIsChrome] = useState(false);

  useEffect(() => {
    const isChromeBrowser =
      /Chrome/.test(navigator.userAgent) && /Google Inc/.test(navigator.vendor);
    setIsChrome(isChromeBrowser);
  }, []);

  useEffect(() => {
    fetchFinanceData();
  }, [dateRange]);

  const fetchFinanceData = async () => {
    if (!startDate || !endDate) return;

    const formattedStartDate = startDate.toISOString().split("T")[0];
    const formattedEndDate = endDate.toISOString().split("T")[0];

    const diffInDays = Math.ceil(
      (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (diffInDays > 90) {
      notification.error({
        message: <h5>Date range should be less than 90 days</h5>,
        icon: <img src={Icons.error} alt="Error" />,
        duration: 5,
      });
      return;
    }

    try {
      await dispatch(
        fetchFinanceMetrics({
          startDate: formattedStartDate,
          endDate: formattedEndDate,
        })
      ).unwrap();
    } catch (error) {
      notification.error({
        message: <h5>{error?.errors ? error.errors[0] : "Something went wrong"}</h5>,
        icon: <img src={Icons.error} alt="Error" />,
        duration: 5,
      });
    }
  };

  const handleDateChange = (dates) => {
    const [start, end] = dates;
    setDateRange([start, end]);
  };

  const renderLoadingOrData = (data) => {
    return isMetricsLoading ? (
      <span className="loading-dots">...</span>
    ) : (
      <span>{data}</span>
    );
  };

  return (
    <div id="finance-stats-container" className="job-widgets finance-sats">
      <div id="finance-stats-date-container" className={`date-container ${isChrome ? "chrome" : "default"}`}>
        <ReactDatePicker
          id="finance-stats-date-picker"
          onChangeDate={handleDateChange}
          displayFormat={dateFormat.DISPLAY_DATE}
          selectsRange={true}
          defaultDate={dateRange}
          maxDate={today}
        />
      </div>

      <div id="finance-stats-metrics-container" className="jobs-container">
        <div className="job-summary">
          <div id="finance-stat-total-estimates" className="summary-box total-jobs">
            <p>Total Estimates Created</p>
            {renderLoadingOrData(financeMetrics.totalEstimatesCreated)}
          </div>
          <div className="seperator"></div>
          <div id="finance-stat-pending-estimates" className="summary-box pending-jobs">
            <p>Pending Estimates</p>
            {renderLoadingOrData(financeMetrics.pendingEstimates)}
          </div>
          <div className="seperator"></div>
          <div id="finance-stat-rejected-estimates" className="summary-box on-hold-jobs">
            <p>Rejected Estimates</p>
            {renderLoadingOrData(financeMetrics.rejectedEstimates)}
          </div>
          <div className="seperator"></div>
          <div id="finance-stat-total-invoices" className="summary-box in-progress in-pro-jobs">
            <p>Total Invoices Created</p>
            {renderLoadingOrData(financeMetrics.totalInvoicesCreated)}
          </div>
          <div className="seperator"></div>
          <div id="finance-stat-total-earned" className="summary-box completed compl-jobs">
            <p>Total Earned (Rs.)</p>
            {renderLoadingOrData(financeMetrics.totalEarned)}
          </div>
          <div className="seperator"></div>
          <div id="finance-stat-total-outstanding" className="summary-box completed compl-jobs">
            <p>Total Outstanding (Rs.)</p>
            {renderLoadingOrData(financeMetrics.totalOutstanding)}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Stats;