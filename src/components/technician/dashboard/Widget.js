import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from 'react-redux';
import { format } from 'date-fns';
import { notification } from "antd";
import Icons from "../../../utils/icons";
import { Tokens } from '../../../constants/index'
import ReactDatePicker from "../../../shared/datepicker/ReactDatePicker";
import { dateFormat } from '../../../constants';
import {
  getTotalOpenJobCount,
  getTotalUnderTakenJobCount,
  getTotalCompletedJobCount
} from "../../../slices/technician/jobSlice";

const Widget = (props) => {
  const { formattedMessage } = props;
  const { jobCounts, isCountsLoading } = useSelector((state) => state.technicianJobs);
  const [greeting, setGreeting] = useState('');
  const firstName = localStorage.getItem(Tokens.FIRST_NAME);
  const today = new Date();
  const [dateRange, setDateRange] = useState([today, today]);
  const [startDate, endDate] = dateRange;
  const dispatch = useDispatch();
  const [isChrome, setIsChrome] = useState(false);
  
    useEffect(() => {
      const isChromeBrowser =
        /Chrome/.test(navigator.userAgent) && /Google Inc/.test(navigator.vendor);
      setIsChrome(isChromeBrowser);
    }, []);
  

  useEffect(() => {
    const currentHour = new Date().getHours();
    if (currentHour < 12) {
      setGreeting('Good Morning');
    } else if (currentHour < 18) {
      setGreeting('Good Afternoon');
    } else {
      setGreeting('Good Evening');
    }
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
        dispatch(getTotalOpenJobCount({ startDate: formattedStartDate, endDate: formattedEndDate })).unwrap(),
        dispatch(getTotalUnderTakenJobCount({ startDate: formattedStartDate, endDate: formattedEndDate })).unwrap(),
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
    <div id="technician-widget-container">
      <div className="card-mobile" id="technician-widget-mobile">
        <div className="card-header-mob" id="technician-widget-header-mobile">
        <div className="greeting" id="technician-greeting-mobile">
          <h1 className="greeting-time" id="technician-greeting-time-mobile">{greeting},&nbsp;</h1>
          <h1 className="greeting-name" id="technician-greeting-name-mobile">{firstName} 👋</h1>
        </div>
        <p className="message" id="technician-welcome-message-mobile">
          {formattedMessage(
            "dashboard.welcome.text"
          )}
        </p>
        </div>
      </div>
    <div className="dashboard-widget tech-widgets" id="technician-dashboard-widget">

      <div className="card no-border" id="technician-widget-header-card">
        <div className="card-header" id="technician-widget-header">
          <div className="greeting" id="technician-greeting">
            <h1 className="greeting-time" id="technician-greeting-time">{greeting},&nbsp;</h1>
            <h1 className="greeting-name" id="technician-greeting-name">{firstName} 👋</h1>
          </div>
          <p className="message" id="technician-welcome-message">
            {formattedMessage(
              "dashboard.welcome.text"
            )}
          </p>
        </div>
        <div className={`date-container ${isChrome ? "chrome" : "default"}`} id="technician-date-picker-container">
          <ReactDatePicker
            onChangeDate={handleDateChange}
            displayFormat={dateFormat.DISPLAY_DATE}
            selectsRange={true}
            defaultDate={dateRange}
            maxDate={today}
          />
        </div>
      </div>

      <div 
        className="card widget-card-container"
        id="technician-widget-cards-container"
        style={{
          gap: '16px',
        }}
      >
        <div className="card widget-card" id="technician-open-jobs-widget"
          style={{
            backgroundImage: `url(${Icons.white_blue_bg_frame})`,
          }}>
          <div className="card-content" id="technician-open-jobs-content">
            <div className="left-content" id="technician-open-jobs-left">
              <h3 className="widget-title" id="technician-open-jobs-title">
                Open Jobs
              </h3>
              <h1 className="widget-count" id="technician-open-jobs-count">{isCountsLoading.open ? '...' : jobCounts.open}</h1>
            </div>
            <div className="right-content" id="technician-open-jobs-right">
              <img src={Icons.briefcase_icon} alt="Icon" className="widget-icon" id="technician-open-jobs-icon" />
            </div>
          </div>
        </div>

        <div className="separator" id="technician-widget-separator-1" />

        <div className="card widget-card" id="technician-undertaken-jobs-widget"
          style={{
            backgroundImage: `url(${Icons.light_blue_bg_frame})`,
          }}>
          <div className="card-content" id="technician-undertaken-jobs-content">
            <div className="left-content" id="technician-undertaken-jobs-left">
              <h3 className="widget-title" id="technician-undertaken-jobs-title">
                Undertaken Jobs
              </h3>
              <h1 className="widget-count" id="technician-undertaken-jobs-count">{isCountsLoading.underTaken ? '...' : jobCounts.underTaken}</h1>
            </div>
            <div className="right-content" id="technician-undertaken-jobs-right">
              <img src={Icons.list_checks_icon} alt="Icon" className="widget-icon" id="technician-undertaken-jobs-icon" />
            </div>
          </div>
        </div>

        <div className="separator" id="technician-widget-separator-2" />

        <div className="card widget-card" id="technician-completed-jobs-widget"
          style={{
            backgroundImage: `url(${Icons.blue_bg_frame})`,
          }}>
          <div className="card-content" id="technician-completed-jobs-content">
            <div className="left-content" id="technician-completed-jobs-left">
              <h3 className="widget-title" id="technician-completed-jobs-title">
                Completed Jobs
              </h3>
              <h1 className="widget-count" id="technician-completed-jobs-count">{isCountsLoading.completed ? '...' : jobCounts.completed}</h1>
            </div>
            <div className="right-content" id="technician-completed-jobs-right">
              <img src={Icons.check_icon} alt="Icon" className="widget-icon" id="technician-completed-jobs-icon" />
            </div>
          </div>
        </div>
      </div>
    </div>
    </div>
  );
};

export default Widget;
