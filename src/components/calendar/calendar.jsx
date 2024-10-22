import Cookie from "js-cookie";
import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import '../../App.css';
import './calendar.css';

function getStartOfWeek(date) {
    const dayOfWeek = date.getDay();
    const difference = date.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);
    return new Date(date.setDate(difference));
}

function addDays(date, days) {
    const newDate = new Date(date);
    newDate.setDate(date.getDate() + days);
    return newDate;
}

function Calendar() {
    const location = useLocation();
    const [signedIn, setSignedIn] = useState(false);
    const [currentWeek, setCurrentWeek] = useState(getStartOfWeek(new Date()));

    useEffect(() => {
        if (Cookie.get("signed_in_user") !== undefined) {
            setSignedIn(Cookie.get("signed_in_user"));
        } else {
            setSignedIn(false);
        }
    }, []);

    const handlePrevWeek = () => {
        setCurrentWeek(addDays(currentWeek, -7));
    };

    const handleNextWeek = () => {
        setCurrentWeek(addDays(currentWeek, 7));
    };

    const weekDays = [];
    for (let i = 0; i < 7; i++) {
        weekDays.push(addDays(currentWeek, i));
    }

    const timeSlots = [];
    for (let i = 0; i < 24 * 2; i++) {
        const hours = Math.floor(i / 2);
        const minutes = i % 2 === 0 ? "00" : "30";
        timeSlots.push(`${hours.toString().padStart(2, '0')}:${minutes}`);
    }

    return (
        <div className="calendar-container">
            <div className="calendar-header">
                <button onClick={handlePrevWeek}>Previous Week</button>
                <h2>Week of {currentWeek.toDateString()}</h2>
                <button onClick={handleNextWeek}>Next Week</button>
            </div>

            <div className="calendar-grid-wrapper">
                {/* Time labels on the left for larger screens */}
                <div className="time-label-column">
                    {timeSlots.map((slot, slotIndex) => (
                        <div key={slotIndex} className="time-label">{slot}</div>
                    ))}
                </div>

                {/* Calendar grid showing each day of the week */}
                <div className="calendar-grid">
                    {weekDays.map((day, index) => (
                        <div>
                            <h3>{day.toDateString()}</h3>
                            <div key={index} className="calendar-day">
                                <div className="time-slots">
                                    {timeSlots.map((slot, slotIndex) => (
                                        <>
                                            <div key={slotIndex} className="time-slot">
                                                <div className="time-label-inline">{slot}</div> {/* Time label inside slot for small screens */}
                                                <div className="content-area"></div> {/* Content will be added here later */}
                                            </div>
                                        </>
                                    ))}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

export default Calendar;