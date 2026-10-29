import React, { useEffect, useState, useRef } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import Icons from "../../utils/icons";
import { dateFormat } from '../../constants';
import { format } from "date-fns"; 

const ReactDatePicker = (props) => {
    const { 
        onChangeDate, 
        newStartDate,  
        readOnlyref = false, 
        daysBeforeToday, 
        defaultDate, 
        minDate, 
        maxDate,
        disabled, 
        displayFormat,
        inline,
        selectsRange,
        yearOnly,
        monthOnly,
        quarterOnly,
        weekOnly,
        placeholderText: customPlaceholder,
        className: customInputClassName,
        id = "",
        open: controlledOpen
    } = props;

    const selectedFormat = yearOnly
        ? "yyyy"
        : monthOnly
        ? "MMM yyyy"
        : quarterOnly
        ? "QQQ yyyy"
        : weekOnly
        ? "wo yyyy"
        : (displayFormat ?? dateFormat.API_NATIVE);
    const today = new Date();
    const effectiveDate = newStartDate ?? defaultDate;

    const getWeekRange = (inputDate) => {
        if (!inputDate) return { weekStart: null, weekEnd: null };
        const base = new Date(inputDate);
        if (isNaN(base.getTime())) return { weekStart: null, weekEnd: null };
        const dayOfWeek = base.getDay(); // 0=Sun
        const weekStart = new Date(base);
        weekStart.setHours(0, 0, 0, 0);
        weekStart.setDate(base.getDate() - dayOfWeek);
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekStart.getDate() + 6);
        weekEnd.setHours(0, 0, 0, 0);
        return { weekStart, weekEnd };
    };

    const initialStartDate = selectsRange
        ? (effectiveDate?.[0] ?? null)
        : weekOnly
        ? getWeekRange(effectiveDate).weekStart ?? null
        : (effectiveDate ?? null);
 
    const initialEndDate = selectsRange
        ? (effectiveDate?.[1] ?? null)
        : weekOnly
        ? getWeekRange(effectiveDate).weekEnd ?? null
        : null;

    const [startDate, setStartDate] = useState(initialStartDate);
    const [endDate, setEndDate] = useState(initialEndDate);
    const datePickerRef = useRef(null);

    useEffect(() => {
        if (selectsRange) {
            setStartDate(effectiveDate?.[0] ?? null);
            setEndDate(effectiveDate?.[1] ?? null);
        } else if (weekOnly) {
            const { weekStart, weekEnd } = getWeekRange(effectiveDate ?? today);
            setStartDate(weekStart);
            setEndDate(weekEnd);
        } else {
            setStartDate(effectiveDate ?? null);
            setEndDate(null);
        }
    }, [effectiveDate, selectsRange, weekOnly]);

    // Custom quarter formatting effect with proper event handling
    useEffect(() => {
        if (quarterOnly && datePickerRef.current) {
            const formatQuarters = () => {
                const quarterElements = document.querySelectorAll('.react-datepicker__quarter-text');
                quarterElements.forEach((element, index) => {
                    const quarter = index + 1;
                    const ranges = {
                        1: 'January - March',
                        2: 'April - June', 
                        3: 'July - September',
                        4: 'October - December'
                    };
                     
                    if (!element.dataset.originalContent) {
                        element.dataset.originalContent = element.textContent;
                    }
                    
                   
                    element.innerHTML = `<span className="quarter-badge">Q${quarter}</span><span className="quarter-range">${ranges[quarter]}</span>`;
                    element.setAttribute('data-quarter', `Q${quarter}`);
                });
            };

           
            const formatWithRAF = () => {
                requestAnimationFrame(() => {
                    formatQuarters();
                });
            };

           
            formatWithRAF();

            const observer = new MutationObserver((mutations) => {
                let shouldFormat = false;
                mutations.forEach((mutation) => {
                    if (mutation.type === 'childList' && 
                        mutation.addedNodes.length > 0 && 
                        Array.from(mutation.addedNodes).some(node => 
                            node.nodeType === 1 && 
                            node.classList && 
                            node.classList.contains('react-datepicker__quarter-text')
                        )) {
                        shouldFormat = true;
                    }
                });
                
                if (shouldFormat) {
                    // Use a small delay to avoid interfering with click events
                    setTimeout(formatQuarters, 50);
                }
            });
            
            const datepickerContainer = document.querySelector('.react-datepicker');
            if (datepickerContainer) {
                observer.observe(datepickerContainer, { 
                    childList: true, 
                    subtree: true,
                    attributes: false 
                });
            }

            return () => {
                observer.disconnect();
            };
        }
    }, [quarterOnly, startDate]);

    useEffect(() => {
        if (weekOnly && datePickerRef.current) {
            const formatDayNames = () => {
                const dayNameElements = document.querySelectorAll('.react-datepicker__day-name');
                
                dayNameElements.forEach((element) => {
                    const fullText = element.textContent.trim();
                    
                    if (fullText && fullText.length > 0) {
                        // Show only first letter
                        element.textContent = fullText.charAt(0);
                        element.style.fontSize = '12px';
                        element.style.fontWeight = '600';
                        element.style.color = '#183571';
                    }
                });
            };

            const formatWithRAF = () => {
                requestAnimationFrame(() => {
                    formatDayNames();
                });
            };

            formatWithRAF();

            const observer = new MutationObserver((mutations) => {
                let shouldFormat = false;
                mutations.forEach((mutation) => {
                    if (mutation.type === 'childList' && 
                        mutation.addedNodes.length > 0 && 
                        Array.from(mutation.addedNodes).some(node => 
                            node.nodeType === 1 && 
                            node.classList && 
                            node.classList.contains('react-datepicker__day-name')
                        )) {
                        shouldFormat = true;
                    }
                });
                
                if (shouldFormat) {
                    setTimeout(formatDayNames, 100);
                }
            });
            
            const datepickerContainer = document.querySelector('.react-datepicker');
            if (datepickerContainer) {
                observer.observe(datepickerContainer, { 
                    childList: true, 
                    subtree: true,
                    attributes: false
                });
            }

            return () => {
                observer.disconnect();
            };
        }
    }, [weekOnly, startDate]);

    // Custom month name formatting for month picker
    useEffect(() => {
        if (monthOnly && datePickerRef.current) {
            const formatMonthNames = () => {
                const monthElements = document.querySelectorAll('.react-datepicker__month-text');
                
                monthElements.forEach((element) => {
                    const shortText = element.textContent.trim();
                    
                    if (shortText && shortText.length > 0) {
                        // Convert short month names to full month names
                        const monthMap = {
                            'Jan': 'January',
                            'Feb': 'February',
                            'Mar': 'March',
                            'Apr': 'April',
                            'May': 'May',
                            'Jun': 'June',
                            'Jul': 'July',
                            'Aug': 'August',
                            'Sep': 'September',
                            'Oct': 'October',
                            'Nov': 'November',
                            'Dec': 'December'
                        };
                        
                        const fullMonthName = monthMap[shortText] || shortText;
                        element.textContent = fullMonthName;
                    }
                });
            };

            const formatWithRAF = () => {
                requestAnimationFrame(() => {
                    formatMonthNames();
                });
            };

            formatWithRAF();

            const observer = new MutationObserver((mutations) => {
                let shouldFormat = false;
                mutations.forEach((mutation) => {
                    if (mutation.type === 'childList' && 
                        mutation.addedNodes.length > 0 && 
                        Array.from(mutation.addedNodes).some(node => 
                            node.nodeType === 1 && 
                            node.classList && 
                            node.classList.contains('react-datepicker__month-text')
                        )) {
                        shouldFormat = true;
                    }
                });
                
                if (shouldFormat) {
                    setTimeout(formatMonthNames, 100);
                }
            });
            
            const datepickerContainer = document.querySelector('.react-datepicker');
            if (datepickerContainer) {
                observer.observe(datepickerContainer, { 
                    childList: true, 
                    subtree: true,
                    attributes: false
                });
            }

            return () => {
                observer.disconnect();
            };
        }
    }, [monthOnly, startDate]);

    const handleCallback = (dates) => {
        if (selectsRange) {
            const [start, end] = dates;
            setStartDate(start);
            setEndDate(end);
            onChangeDate(dates);
        } else if (weekOnly) {
            // For weekly picker, calculate the full week range
            if (dates) {
                try {
                    const selectedDate = new Date(dates);
                    
                    if (isNaN(selectedDate.getTime())) {
                        const fallbackDate = new Date();
                        setStartDate(fallbackDate);
                        setEndDate(fallbackDate);
                        onChangeDate([fallbackDate, fallbackDate]);
                        return;
                    }
                    
                    const dayOfWeek = selectedDate.getDay();
                    const sundayOffset = dayOfWeek;
                    
                   
                    const weekStart = new Date(selectedDate);
                    const originalDate = weekStart.getDate();
                    const newDate = originalDate - sundayOffset;
                    
                    weekStart.setDate(newDate);
                    
                 
                    const weekEnd = new Date(weekStart);
                    weekEnd.setDate(weekStart.getDate() + 6);
                    
                    if (isNaN(weekStart.getTime()) || isNaN(weekEnd.getTime())) {
                        const fallbackDate = new Date();
                        setStartDate(fallbackDate);
                        setEndDate(fallbackDate);
                        onChangeDate([fallbackDate, fallbackDate]);
                        return;
                    }
                    
                    setStartDate(weekStart);
                    setEndDate(weekEnd);
                    onChangeDate([weekStart, weekEnd]);
                } catch (error) {
                    const fallbackDate = new Date();
                    setStartDate(fallbackDate);
                    setEndDate(fallbackDate);
                    onChangeDate([fallbackDate, fallbackDate]);
                }
            } else {
                const fallbackDate = new Date();
                setStartDate(fallbackDate);
                onChangeDate(fallbackDate);
            }
        } else {
            setStartDate(dates);
            onChangeDate(dates);
        }
    };

    const onDatepickerRef = (el, readOnlyref) => {
        if (el && el.input) {
            el.input.readOnly = readOnlyref;
        }
    };

    return (
  <div className="position-relative datepicker p-0">
    <DatePicker
      wrapperClassName="w-100"
      className={`datepicker__custom-datepicker px-4${customInputClassName ? ` ${customInputClassName}` : ""}`}
      name="date"
      id={id||'date-picker'}
      selected={startDate}
      startDate={selectsRange ? startDate : null}
      endDate={selectsRange ? endDate : null}
      selectsRange={!!selectsRange}
      dayClassName={(date) => {
        if (!weekOnly || !startDate || !endDate) return undefined;
        const d = new Date(date);
        d.setHours(0, 0, 0, 0);
        const s = new Date(startDate);
        s.setHours(0, 0, 0, 0);
        const e = new Date(endDate);
        e.setHours(0, 0, 0, 0);
        if (d >= s && d <= e) {
          return 'react-datepicker__day--in-range';
        }
        return undefined;
      }}
      dateFormat={yearOnly ? "yyyy" : selectedFormat}
      showYearPicker={yearOnly}
      showMonthYearPicker={monthOnly}
      showQuarterYearPicker={quarterOnly}
      showWeekPicker={false}
      showWeekNumbers={false}
      calendarStartDay={0}
      shouldCloseOnSelect={!inline}
      onChange={(date) => handleCallback(date)}
      minDate={minDate}
      maxDate={maxDate}
      placeholderText={
        customPlaceholder ?? (
          yearOnly ? "YYYY" : monthOnly ? "MMM YYYY" : quarterOnly ? "Q YYYY" : weekOnly ? "Week YYYY" : "YYYY-MM-DD"
        )
      }
      ref={(el) => {
        onDatepickerRef(el, readOnlyref);
        datePickerRef.current = el;
      }}
      disabled={disabled}
      inline={inline}
      autoComplete="off"
      open={controlledOpen}
    />
      <img src={Icons.calendar} alt="Calendar Icon" className="input-icon" />
  </div>
);
};

export default ReactDatePicker;