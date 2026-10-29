import React, { useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { format } from "date-fns";
import Icons from "../../../utils/icons";
import { dateFormat } from '../../../constants';

const VehicleArrivalDatePicker = (props) => {
    const {
        onChangeDate,
        readOnlyref,
        defaultDate,
        disabled,
        displayFormat,
        inline,
        onClose,
        onSubmit
    } = props;

    const selectedFormat = displayFormat ?? dateFormat.API_NATIVE;
    const [startDate, setStartDate] = useState(defaultDate || null);
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
    const today = new Date();

    const handleSave = () => {
        if (startDate) {
            onChangeDate(startDate);
            onSubmit(startDate);
        }
        onClose?.();
    };

    const handleCallback = (date) => {
        setStartDate(date);
        onChangeDate(date);
    };

    const onDatepickerRef = (el, readOnlyref) => {
        if (el && el.input) {
            el.input.readOnly = readOnlyref !== undefined ? readOnlyref : true;
        }
    };

    const handleDateChange = (date) => {
        setStartDate(date);
        setCurrentMonth(date);
    };

    const handleCancel = () => {
        setStartDate(defaultDate || null);
        onClose();
    };

    const renderCustomHeader = ({
        monthDate,
        decreaseMonth,
        increaseMonth,
    }) => {
        const weekdays = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];
        return (
            <div>
                {/* Month/year navigation */}
                <button onClick={decreaseMonth}>{"<"}</button>
                <span>{format(monthDate, "MMMM yyyy")}</span>
                <button onClick={increaseMonth}>{">"}</button>

                {/* Custom weekday headers */}
                <div className="d-flex justify-content-between">
                    {weekdays.map((day) => (
                        <div key={day} className="react-datepicker__day-name">
                            {day}
                        </div>
                    ))}
                </div>
            </div>
        );
    };

    return (
        <div className="position-relative vehicle-date datepicker p-0">
            <div className="date-picker-wrapper">
            <DatePicker
                wrapperClassName="w-100"
                className="datepicker__custom-datepicker px-4"
                name="date"
                selected={startDate}
                dateFormat={selectedFormat}
                onChange={handleDateChange}
                onMonthChange={(date) => setCurrentMonth(date)}
                minDate={oneYearAgo}
                maxDate={today}
                placeholderText="YYYY-MM-DD"
                ref={(el) => onDatepickerRef(el, readOnlyref)}
                disabled={disabled}
                inline={inline}
                formatWeekDay={(day) => {
                    return day.substring(0, 3).toUpperCase();
                }}
                calendarClassName="service-calendar"
            />
            {!inline && <img src={Icons.calendar} alt="Calendar Icon" className="input-icon" />}

            <div className="mt-3">
                <div className="d-flex justify-content-end mb-2 date-buttons">
                    <button
                        className="btn btn-sm btn-outline-secondary me-2 date-cancel"
                        onClick={handleCancel}
                        id="vehicle-arrival-date-cancel-button"
                    >
                        Cancel
                    </button>
                    <button
                        className="btn btn-sm btn-primary date-save"
                        onClick={handleSave}
                        id="vehicle-arrival-date-save-button"
                    >
                        Save
                    </button>
                </div>
            </div>
            </div>
        </div>
    );
};

export default VehicleArrivalDatePicker;