import React, { useState, useEffect, useMemo, useRef } from "react";
import Icons from "../../../utils/icons";
import ReactDatePicker from "../../../shared/datepicker/ReactDatePicker";
import EstimateStatus from "./EstimateStatus";
import ServiceCompletionRate from "./ServiceCompletionRate";
import SalesOverview from "./SalesOverview";
import ComparisonChart from "./ComparisonChart";

const RangeTabs = () => {
  const [selectedFrequency, setSelectedFrequency] = useState("Daily");
  const [currentDate, setCurrentDate] = useState(() => {
    const today = new Date();
    if (isNaN(today.getTime())) {
      return new Date();
    }
    return today;
  });
  const [showPicker, setShowPicker] = useState(false);
  const datePickerRef = useRef(null);
  const today = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);

  const frequencies = ["Daily", "Weekly", "Monthly", "Quarterly", "Yearly"];

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (datePickerRef.current && !datePickerRef.current.contains(event.target)) {
        setShowPicker(false);
      }
    };

    if (showPicker) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showPicker]);

  const formatDate = (date) => {
    if (!date || isNaN(new Date(date).getTime())) {
      return new Date().toLocaleDateString("en-GB", {
        day: "numeric",
        month: "short",
        year: "numeric",
      });
    }
    return date.toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const getRange = (date, freq) => {
    const d = new Date(date);
    if (isNaN(d.getTime())) {
      return { start: new Date(), end: new Date() };
    }

    const start = new Date(d);
    const end = new Date(d);
    if (freq === "Daily") {
      const base = new Date(Math.min(d.getTime(), today.getTime()));
      base.setHours(0, 0, 0, 0);
      return { start: base, end: base };
    }
    if (freq === "Weekly") {
      // Compute using UTC to avoid timezone shifts, then project to local midnight
      const utc = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
      const utcDay = utc.getUTCDay(); // 0 = Sunday
      const startUTC = new Date(utc);
      startUTC.setUTCDate(utc.getUTCDate() - utcDay);
      startUTC.setUTCHours(0, 0, 0, 0);

      const endUTC = new Date(startUTC);
      endUTC.setUTCDate(startUTC.getUTCDate() + 6);
      endUTC.setUTCHours(0, 0, 0, 0);

      const weekStart = new Date(startUTC.getUTCFullYear(), startUTC.getUTCMonth(), startUTC.getUTCDate());
      weekStart.setHours(0, 0, 0, 0);
      const weekEnd = new Date(endUTC.getUTCFullYear(), endUTC.getUTCMonth(), endUTC.getUTCDate());
      weekEnd.setHours(0, 0, 0, 0);

      return { start: weekStart, end: weekEnd };
    }
    if (freq === "Monthly") {
      start.setDate(1);
      end.setMonth(d.getMonth() + 1, 0);
      return { start, end };
    }
    if (freq === "Quarterly") {
      const q = Math.floor(d.getMonth() / 3);
      start.setMonth(q * 3, 1);
      end.setMonth(q * 3 + 3, 0);
      return { start, end };
    }
    // Yearly
    start.setMonth(0, 1);
    end.setMonth(11, 31);
    return { start, end };
  };

  const range = useMemo(() => {
    return getRange(currentDate, selectedFrequency);
  }, [currentDate, selectedFrequency]);

  const getStartOfPeriod = (date, freq) => {
    const d = new Date(date);
    if (freq === "Daily") {
      d.setHours(0, 0, 0, 0);
      return d;
    }
    if (freq === "Weekly") {
      const day = d.getDay();
      const sundayOffset = day;
      const start = new Date(d);
      start.setDate(d.getDate() - sundayOffset);
      start.setHours(0, 0, 0, 0);
      return start;
    }
    if (freq === "Monthly") {
      const start = new Date(d.getFullYear(), d.getMonth(), 1);
      start.setHours(0, 0, 0, 0);
      return start;
    }
    if (freq === "Quarterly") {
      const q = Math.floor(d.getMonth() / 3);
      const start = new Date(d.getFullYear(), q * 3, 1);
      start.setHours(0, 0, 0, 0);
      return start;
    }
    // Yearly
    const start = new Date(d.getFullYear(), 0, 1);
    start.setHours(0, 0, 0, 0);
    return start;
  };

  const canGoNext = useMemo(() => {
    const currentStart = getStartOfPeriod(currentDate, selectedFrequency);
    const todayStart = getStartOfPeriod(today, selectedFrequency);
    return currentStart < todayStart;
  }, [currentDate, selectedFrequency, today]);

  const getRangeText = () => {
    switch (selectedFrequency) {
      case "Daily":
        return formatDate(range.start);
      case "Weekly":
        return `${formatDate(range.start)} – ${formatDate(range.end)}`;
      case "Monthly":
        return range.start.toLocaleDateString("en-GB", {
          month: "short",
          year: "numeric",
        });
      case "Quarterly":
        const quarterIndex = Math.floor(range.start.getMonth() / 3) + 1;
        const quarterLabels = [
          { key: 1, text: "Jan – Mar" },
          { key: 2, text: "April – June" },
          { key: 3, text: "July – Sep" },
          { key: 4, text: "Oct – Dec" },
        ];
        return `Q${quarterIndex} ${
          quarterLabels[quarterIndex - 1].text
        } ${range.start.getFullYear()}`;
      case "Yearly":
        return range.start.getFullYear().toString();
      default:
        return `${formatDate(range.start)} - ${formatDate(range.end)}`;
    }
  };

  // Memoize the range text to prevent unnecessary recalculations
  const rangeText = useMemo(() => {
    return getRangeText();
  }, [selectedFrequency, range]);

  const navigateDate = (direction) => {
    const sign = direction === "prev" ? -1 : 1;
    const d = new Date(currentDate);
    if (selectedFrequency === "Daily") {
      d.setDate(d.getDate() + sign);
    } else if (selectedFrequency === "Weekly") {
      d.setDate(d.getDate() + 7 * sign);
    } else if (selectedFrequency === "Monthly") {
      d.setMonth(d.getMonth() + sign);
    } else if (selectedFrequency === "Quarterly") {
      d.setMonth(d.getMonth() + 3 * sign);
    } else {
      d.setFullYear(d.getFullYear() + sign);
    }
    setCurrentDate(d);
  };

  const handleFrequencyChange = (frequency) => {
    setSelectedFrequency(frequency);
    setShowPicker(false);
    // Reset anchor date to today so the derived range reflects the current period
    setCurrentDate(today);
  };

  return (
    <div className="date-navigation-tabs">
      <div className="date-navigation-tabs-containers">
      <div className="date-navigation-tabs-container">
        <div className="date-navigation">
          <div
            className="nav-arrow prev"
            onClick={() => navigateDate("prev")}
            title="Previous"
          >
            <img src={Icons.caret_left} alt="Previous" />
          </div>
          <div
            className="nav-arrow next"
            onClick={() => { if (canGoNext) navigateDate("next"); }}
            title="Next"
            style={{ pointerEvents: canGoNext ? "auto" : "none" }}
          >
            <img src={Icons.caret_right} alt="Next" style={{ opacity: canGoNext ? 1 : 0.4 }} />
          </div>
          <div
            className="current-date"
            onClick={() => setShowPicker(!showPicker)}
            title="Pick date(s)"
          >
            {rangeText}
          </div>
        </div>

        {showPicker && (
          <div className="date-picker-container" ref={datePickerRef}>
            {selectedFrequency === "Yearly" ? (
              <div className="year-picker">
                <ReactDatePicker
                  maxDate={today}
                  yearOnly={true}
                  onChangeDate={(d) => {
                    setCurrentDate(d || new Date());
                    setShowPicker(false);
                  }}
                  newStartDate={currentDate}
                  inline
                />
              </div>
            ) : selectedFrequency === "Weekly" ? (
              <div className="week-picker">
                <ReactDatePicker
                  weekOnly={true}
                  maxDate={today}
                  onChangeDate={(dates) => {
                  
                    try {
                      if (dates && Array.isArray(dates) && dates.length === 2) {
                        const startDate = dates[0];
                        if (
                          startDate &&
                          !isNaN(new Date(startDate).getTime())
                        ) {
                          setCurrentDate(startDate);
                          setShowPicker(false);
                        }
                      } else if (dates && !isNaN(new Date(dates).getTime())) {
                        setCurrentDate(dates);
                        setShowPicker(false);
                      }
                    } catch (error) {
                     
                    }
                  }}
                  newStartDate={currentDate}
                  inline
                  selectsRange={false}
                  showWeekNumbers={false}
                  calendarStartDay={0}
                />
              </div>
            ) : selectedFrequency === "Monthly" ? (
              <div className="month-picker">
                <ReactDatePicker
                  monthOnly={true}
                  maxDate={today}
                  onChangeDate={(d) => {
                    setCurrentDate(d || new Date());
                    setShowPicker(false);
                  }}
                  newStartDate={currentDate}
                  inline
                />
              </div>
            ) : selectedFrequency === "Quarterly" ? (
 
              <ReactDatePicker
                quarterOnly
                maxDate={today}
                onChangeDate={(d) => {
                  setCurrentDate(d || new Date());
                  setShowPicker(false);
                }}
                newStartDate={currentDate}
                inline
              />
            ) : (
              <div className="daily-picker">
              <ReactDatePicker
                onChangeDate={(d) => {
                  setCurrentDate(d || new Date());
                  setShowPicker(false);
                }}
                newStartDate={currentDate}
                inline
                maxDate={today}
              />
               </div>
            )}
          </div>
        )}
      </div>

      <div className="frequency-buttons">
        {frequencies.map((frequency) => (
          <div
            key={frequency}
            className={`frequency-btn ${
              selectedFrequency === frequency ? "active" : ""
            }`}
            onClick={() => handleFrequencyChange(frequency)}
          >
            {frequency}
          </div>
        ))}
      </div>
      </div>
      <div className="charts-container">
        <EstimateStatus 
          selectedFrequency={selectedFrequency}
          selectedDate={currentDate}
          selectedRange={range}
        />
        <ServiceCompletionRate 
          selectedFrequency={selectedFrequency}
          selectedDate={currentDate}
          selectedRange={range}
        />
      </div>

        <ComparisonChart 
          selectedFrequency={selectedFrequency} 
          selectedDate={currentDate}
          selectedRange={range}
        />    
        <SalesOverview 
          selectedFrequency={selectedFrequency} 
          selectedDate={currentDate}
          selectedRange={range}
        />
    </div>
  );
};

export default RangeTabs;
