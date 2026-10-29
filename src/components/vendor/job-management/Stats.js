import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import ReactDatePicker from "../../../shared/datepicker/ReactDatePicker";
import { dateFormat } from '../../../constants';
import { notification } from "antd";
import Icons from "../../../utils/icons";
import {
  getTotalJobCount,
  getTotalPendingJobCount,
  getTotalOnHoldJobCount,
  getTotalInProgressJobCount,
  getTotalCompletedJobCount
} from "../../../slices/vendor/jobSlice";
import { format } from 'date-fns';

const Stats = () => {
  const dispatch = useDispatch();
  const { jobCounts, isCountsLoading } = useSelector((state) => state.vendorJobs);
  const today = new Date();
  const [dateRange, setDateRange] = useState([today, today]);
  const [startDate, endDate] = dateRange;
   const [isChrome, setIsChrome] = useState(false);
  
    useEffect(() => {
      const isChromeBrowser =
        /Chrome/.test(navigator.userAgent) && /Google Inc/.test(navigator.vendor);
      setIsChrome(isChromeBrowser);
    }, []);

  useEffect(() => {
    fetchJobCounts();
  }, [dateRange]);

  const fetchJobCounts = async () => {
    if (!startDate || !endDate) return;
    
    const formattedStartDate = format(startDate, 'yyyy-MM-dd');
    const formattedEndDate = format(endDate, 'yyyy-MM-dd');
  
    try {
      await Promise.all([
        dispatch(getTotalJobCount({ startDate: formattedStartDate, endDate: formattedEndDate })).unwrap(),
        dispatch(getTotalPendingJobCount({ startDate: formattedStartDate, endDate: formattedEndDate })).unwrap(),
        dispatch(getTotalOnHoldJobCount({ startDate: formattedStartDate, endDate: formattedEndDate })).unwrap(),
        dispatch(getTotalInProgressJobCount({ startDate: formattedStartDate, endDate: formattedEndDate })).unwrap(),
        dispatch(getTotalCompletedJobCount({ startDate: formattedStartDate, endDate: formattedEndDate })).unwrap(),
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

  return (
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
            <div className="summary-box total-jobs">
              <p>Total Jobs</p>
              <span>{isCountsLoading.total ? '...' : jobCounts.total}</span>
            </div>
            <div className="seperator"></div>
            <div className="summary-box pending-jobs">
              <p>Pending Assignments</p>
              <span>{isCountsLoading.pending ? '...' : jobCounts.pending}</span>
            </div>
            <div className="seperator"></div>
            <div className="summary-box on-hold-jobs">
              <p>Jobs on Hold</p>
              <span>{isCountsLoading.onHold ? '...' : jobCounts.onHold}</span>
            </div>
            <div className="seperator"></div>
            <div className="summary-box in-progress in-pro-jobs">
              <p>Jobs In Progress</p>
              <span>{isCountsLoading.inProgress ? '...' : jobCounts.inProgress}</span>
            </div>
            <div className="seperator"></div>
            <div className="summary-box completed  compl-jobs">
              <p>Completed Jobs</p>
              <span>{isCountsLoading.completed ? '...' : jobCounts.completed}</span>
            </div>
          </div>
        </div>
      </div>
  );
};

export default Stats;
