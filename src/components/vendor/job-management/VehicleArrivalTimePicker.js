import React, { useState, useEffect } from "react";
import Icons from "../../../utils/icons";

const VehicleArrivalTimePicker = (props) => {
    const { onChangeTime, defaultTime, onClose, onSubmit, isToday } = props;

    const [hours, setHours] = useState(12);
    const [minutes, setMinutes] = useState(0);
    const [period, setPeriod] = useState("AM");

    useEffect(() => {
        if (defaultTime) {           
            // Parse defaultTime if it's a string (e.g., "12:30 PM" or "14:30")
            let parsedHours = 12;
            let parsedMinutes = 0;
            let parsedPeriod = "AM";

            if (typeof defaultTime === "string") {
                // Handle formats like "12:30 PM" or "14:30"
                const timeMatch = defaultTime.match(/(\d{1,2}).(\d{2})\s*(AM|PM)?/i);
               
                if (timeMatch) {
                    parsedHours = parseInt(timeMatch[1], 10);
                    parsedMinutes = parseInt(timeMatch[2], 10);
                    parsedPeriod = timeMatch[3]?.toUpperCase() || (parsedHours >= 12 ? "PM" : "AM");
                    // Convert 24-hour to 12-hour format if needed
                    if (!timeMatch[3] && parsedHours >= 12) {
                        parsedPeriod = "PM";
                        if (parsedHours > 12) {
                            parsedHours = parsedHours - 12;
                        }
                    } else if (!timeMatch[3] && parsedHours === 0) {
                        parsedHours = 12;
                        parsedPeriod = "AM";
                    } else if (!timeMatch[3] && parsedHours < 12) {
                        parsedPeriod = "AM";
                    }
                }
            } else if (defaultTime instanceof Date) {
                // Handle Date object
                parsedHours = defaultTime.getHours();
                parsedMinutes = defaultTime.getMinutes();
                parsedPeriod = parsedHours >= 12 ? "PM" : "AM";

                if (parsedHours > 12) {
                    parsedHours = parsedHours - 12;
                } else if (parsedHours === 0) {
                    parsedHours = 12;
                }
            }

            setHours(parsedHours);
            setMinutes(parsedMinutes);
            setPeriod(parsedPeriod);
        }
    }, [defaultTime]);

    const isFutureForToday = (candidateHours, candidateMinutes, candidatePeriod) => {
        if (!isToday) return false;

        const now = new Date();
        const nowTotalMinutes = now.getHours() * 60 + now.getMinutes();

        let h24 = candidateHours % 12;
        if (candidatePeriod === "PM" && h24 < 12) {
            h24 += 12;
        } else if (candidatePeriod === "AM" && h24 === 12) {
            h24 = 0;
        }

        const candidateTotal = h24 * 60 + candidateMinutes;
        return candidateTotal > nowTotalMinutes;
    };

    const incrementHours = () => {
        setHours((prev) => {
            let next = prev === 12 ? 1 : prev + 1;
            if (isFutureForToday(next, minutes, period)) {
                return prev;
            }
            return next;
        });
    };

    const decrementHours = () => {
        setHours((prev) => {
            if (prev === 1) return 12;
            return prev - 1;
        });
    };

    const incrementMinutes = () => {
        setMinutes((prev) => {
            let next = prev === 59 ? 0 : prev + 1;
            if (isFutureForToday(hours, next, period)) {
                return prev;
            }
            return next;
        });
    };

    const decrementMinutes = () => {
        setMinutes((prev) => {
            if (prev === 0) return 59;
            return prev - 1;
        });
    };

    const togglePeriod = () => {
        setPeriod((prev) => {
            const next = prev === "AM" ? "PM" : "AM";
            if (isFutureForToday(hours, minutes, next)) {
                return prev;
            }
            return next;
        });
    };

    const formatTime = (h, m, p) => {
        const formattedMinutes = m.toString().padStart(2, "0");
        return `${h}:${formattedMinutes} ${p}`;
    };

    const handleSave = () => {
        let saveHours = hours;
        let saveMinutes = minutes;
        let savePeriod = period;

        const timeString = formatTime(saveHours, saveMinutes, savePeriod);
        onChangeTime?.(timeString);
        onSubmit?.(timeString);
        onClose?.();
    };

    const handleCancel = () => {
        // Reset to default time if available
        if (defaultTime) {
            let parsedHours = 12;
            let parsedMinutes = 0;
            let parsedPeriod = "AM";

            if (typeof defaultTime === "string") {
                const timeMatch = defaultTime.match(/(\d{1,2}):(\d{2})\s*(AM|PM)?/i);
                if (timeMatch) {
                    parsedHours = parseInt(timeMatch[1], 10);
                    parsedMinutes = parseInt(timeMatch[2], 10);
                    parsedPeriod = timeMatch[3]?.toUpperCase() || (parsedHours >= 12 ? "PM" : "AM");

                    if (!timeMatch[3] && parsedHours >= 12) {
                        parsedPeriod = "PM";
                        if (parsedHours > 12) {
                            parsedHours = parsedHours - 12;
                        }
                    } else if (!timeMatch[3] && parsedHours === 0) {
                        parsedHours = 12;
                        parsedPeriod = "AM";
                    }
                }
            }

            setHours(parsedHours);
            setMinutes(parsedMinutes);
            setPeriod(parsedPeriod);
        } else {
            setHours(12);
            setMinutes(0);
            setPeriod("AM");
        }
        onClose?.();
    };

    return (
        <div className="position-relative vehicle-time timepicker p-0">
            <div className="time-picker-container">
                <div className="time-picker-content">
                    <div className="time-selector-group">
                        {/* Hours Selector */}
                        <div className="time-selector">
                            <button
                                type="button"
                                className="time-arrow-btn"
                                onClick={incrementHours}
                                aria-label="Increment hours"
                            >
                                <svg
                                    width="24"
                                    height="24"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    xmlns="http://www.w3.org/2000/svg"
                                >
                                    <path
                                        d="M18 15L12 9L6 15"
                                        stroke="#6b717d"
                                        strokeWidth="2"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                    />
                                </svg>
                            </button>
                            <div className="time-value">{hours}</div>
                            <button
                                type="button"
                                className="time-arrow-btn"
                                onClick={decrementHours}
                                aria-label="Decrement hours"
                            >
                                <svg
                                    width="24"
                                    height="24"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    xmlns="http://www.w3.org/2000/svg"
                                >
                                    <path
                                        d="M6 9L12 15L18 9"
                                        stroke="#6b717d"
                                        strokeWidth="2"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                    />
                                </svg>
                            </button>
                        </div>

                        {/* Separator */}
                        <div className="time-separator">:</div>

                        {/* Minutes Selector */}
                        <div className="time-selector">
                            <button
                                type="button"
                                className="time-arrow-btn"
                                onClick={incrementMinutes}
                                aria-label="Increment minutes"
                            >
                                <svg
                                    width="24"
                                    height="24"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    xmlns="http://www.w3.org/2000/svg"
                                >
                                    <path
                                        d="M18 15L12 9L6 15"
                                        stroke="#6b717d"
                                        strokeWidth="2"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                    />
                                </svg>
                            </button>
                            <div className="time-value">{minutes.toString().padStart(2, "0")}</div>
                            <button
                                type="button"
                                className="time-arrow-btn"
                                onClick={decrementMinutes}
                                aria-label="Decrement minutes"
                            >
                                <svg
                                    width="24"
                                    height="24"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    xmlns="http://www.w3.org/2000/svg"
                                >
                                    <path
                                        d="M6 9L12 15L18 9"
                                        stroke="#6b717d"
                                        strokeWidth="2"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                    />
                                </svg>
                            </button>
                        </div>

                        {/* AM/PM Selector */}
                        <div className="time-selector period-selector">
                            <button
                                type="button"
                                className="time-arrow-btn"
                                onClick={togglePeriod}
                                aria-label="Toggle period"
                            >
                                <svg
                                    width="24"
                                    height="24"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    xmlns="http://www.w3.org/2000/svg"
                                >
                                    <path
                                        d="M18 15L12 9L6 15"
                                        stroke="#6b717d"
                                        strokeWidth="2"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                    />
                                </svg>
                            </button>
                            <div className="time-value">{period}</div>
                            <button
                                type="button"
                                className="time-arrow-btn"
                                onClick={togglePeriod}
                                aria-label="Toggle period"
                            >
                                <svg
                                    width="24"
                                    height="24"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    xmlns="http://www.w3.org/2000/svg"
                                >
                                    <path
                                        d="M6 9L12 15L18 9"
                                        stroke="#6b717d"
                                        strokeWidth="2"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                    />
                                </svg>
                            </button>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="time-picker-buttons">
                        <button
                            type="button"
                            className="btn btn-sm btn-outline-secondary time-cancel"
                            onClick={handleCancel}
                            id="vehicle-arrival-time-cancel-button"
                        >
                            Cancel
                        </button>
                        <button
                            type="button"
                            className="btn btn-sm btn-primary time-save"
                            onClick={handleSave}
                            id="vehicle-arrival-time-save-button"
                        >
                            Save
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default VehicleArrivalTimePicker;

