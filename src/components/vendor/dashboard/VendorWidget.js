import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { Tokens } from "../../../constants/index";
import ReactDatePicker from "../../../shared/datepicker/ReactDatePicker";
import { dateFormat } from "../../../constants";
import { format } from 'date-fns';
import Icons from "../../../utils/icons";
import {
  getTotalTaxInvoiceCount,
  getTotalJobsCount,
  getTotalQuotesCount
} from "../../../slices/vendor/dashboardMetricsSlice";
import { notification } from "antd";  

const VendorWidget = (props) => {
  const [greeting, setGreeting] = useState("");
  const firstName = localStorage.getItem(Tokens.FIRST_NAME);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const today = new Date();
  const [isChrome, setIsChrome] = useState(false);
  const [dateRange, setDateRange] = useState([today, today]);
  const [startDate, endDate] = dateRange;
  const { metricsCounts, isCountsLoading } = useSelector((state) => state.vendorDashboardMetrics);

  useEffect(() => {
    const isChromeBrowser =
      /Chrome/.test(navigator.userAgent) && /Google Inc/.test(navigator.vendor);
    setIsChrome(isChromeBrowser);
  }, []);

  useEffect(() => {
    const currentHour = new Date().getHours();
    if (currentHour < 12) {
      setGreeting("Good Morning");
    } else if (currentHour < 18) {
      setGreeting("Good Afternoon");
    } else {
      setGreeting("Good Evening");
    }
  }, []);

  useEffect(() => {
    fetchGlobalCounts();
  }, [dateRange]);

  const fetchGlobalCounts = async () => {
    if (!startDate || !endDate) return;

    const formattedStartDate = format(startDate, 'yyyy-MM-dd');
    const formattedEndDate = format(endDate, 'yyyy-MM-dd');

    try {
      await Promise.all([
        dispatch(getTotalTaxInvoiceCount({ startDate: formattedStartDate, endDate: formattedEndDate })).unwrap(),
        dispatch(getTotalJobsCount({ startDate: formattedStartDate, endDate: formattedEndDate })).unwrap(),
        dispatch(getTotalQuotesCount({ startDate: formattedStartDate, endDate: formattedEndDate })).unwrap(),
      ]);

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

  const handleQuoteClick = () => {
    navigate('/app/quote-management');
  };

  const handleJobClick = () => {
    navigate('/app/job-management');
  };

  const handleInvoiceClick = () => {
    navigate('/app/finance-management');
  };

  return (
    <div className="dashboard-widget admin-portal-dashboard-widget vendor-dashboard-widget">
      <div className="card no-border first-content">
        <div className="greeting admin-greeting">
          <div className="dashboard-greeting">
            {" "}
            <h1 className="greeting-time">{greeting},&nbsp;</h1>
            <h1 className="greeting-name">
              <span className="greeting-name-text">{firstName}...</span><span className="proclamation">!</span>👋
            </h1>{" "}
          </div>
          <p className="message">
            Keep track of your tasks and job status with ease.
          </p>
        </div>
      </div>
      <div className="job-managements">
        <div className="job-widgets">
          <div className={`date-container ${isChrome ? "chrome" : "default"}`}>
            <ReactDatePicker
              onChangeDate={handleDateChange}
              displayFormat={dateFormat.DISPLAY_DATE}
              selectsRange={true}
              defaultDate={dateRange}
              maxDate={today}
            />
          </div>
          <div className="jobs-container">
            <div className="job-summary">
              <div className="summary-box total-jobs" onClick={handleInvoiceClick} style={{ cursor: 'pointer' }}>
                <div className="summary-box-content">
                  <div className="icon">
                    <img src={Icons.slipt_icon} alt="briefcase-icon" />
                  </div>
                  <div className="content">
                    <h1 className="total">{isCountsLoading.invoices ? '...' : metricsCounts.invoices.taxInvoiceCount}</h1>
                    <p className="title">Total Tax Invoices</p>
                  </div>
                </div>
                <div className="lower-content summary-box-content">
                  <p className="title">Total Invoices</p>
                  <p className="total">{isCountsLoading.invoices ? '...' : metricsCounts.invoices.totalInvoiceCount}</p>
                </div>
                <div className="progress-bar" style={{'--progress-width': `${metricsCounts.invoices.totalInvoiceCount > 0 ? (metricsCounts.invoices.taxInvoiceCount / metricsCounts.invoices.totalInvoiceCount * 100) : 0}%`}}></div>
              </div>

              <div className="summary-box pending-jobs" onClick={handleJobClick} style={{ cursor: 'pointer' }}>
                <div className="summary-box-content">
                  <div className="icon">
                    <img src={Icons.briefcase} alt="briefcase-icon" />
                  </div>
                  <div className="content">
                    <h1 className="total">{isCountsLoading.jobs ? '...' : metricsCounts.jobs.totalActiveJobs}</h1>
                    <p className="title">Total Active Jobs</p>
                  </div>
                </div>
                <div className="lower-content summary-box-content">
                  <p className="title">Total Jobs</p>
                  <p className="total">{isCountsLoading.jobs ? '...' : metricsCounts.jobs.totalJobs}</p>
                </div>
                <div className="progress-bar pending" style={{'--progress-width': `${metricsCounts.jobs.totalJobs > 0 ? (metricsCounts.jobs.totalActiveJobs / metricsCounts.jobs.totalJobs * 100) : 0}%`}}></div>
              </div>

              <div className="summary-box on-hold-jobs" onClick={handleQuoteClick} style={{ cursor: 'pointer' }}>
                <div className="summary-box-content">
                  <div className="icon">
                    <img src={Icons.quote_icon} alt="briefcase-icon" />
                  </div>
                  <div className="content">
                    <h1 className="total">{isCountsLoading.quotes ? '...' : metricsCounts.quotes.totalPendingQuoteCount}</h1>
                    <p className="title">Total Pending Quotes</p>
                  </div>
                </div>
                <div className="lower-content summary-box-content">
                  <p className="title"> Total Quotes</p>
                  <p className="total">{isCountsLoading.quotes ? '...' : metricsCounts.quotes.totalQuoteCount}</p>
                </div>
                <div className="progress-bar on-hold" style={{'--progress-width': `${metricsCounts.quotes.totalQuoteCount > 0 ? (metricsCounts.quotes.totalPendingQuoteCount / metricsCounts.quotes.totalQuoteCount * 100) : 0}%`}}></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VendorWidget;
