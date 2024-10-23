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

const filters = ["#0000FF", "#FF0000", "#008000", "#FFFF00", "#FFA500", "#800080", "#FFC0CB", "#A52A2A", "#FF00FF", "#808080"];

const tmpdata = [
    { "task_name": "task1", "description": "neke neke", "color": "#FF0000", "start_time": "2024-10-22T10:00:00", "end_time": "2024-10-22T12:00:00" },
    { "task_name": "task2", "description": "neke neke", "color": "#FF00FF", "start_time": "2024-10-22T14:00:00", "end_time": "2024-10-23T16:00:00" },
    { "task_name": "task3", "description": "neke neke", "color": "#00FF00", "start_time": "2024-10-23T18:00:00", "end_time": "2024-10-24T20:00:00" },
    { "task_name": "task4", "description": "neke neke", "color": "#808080", "start_time": "2024-10-24T22:00:00", "end_time": "2024-10-25T23:00:00" }
];


function Calendar() {
    const location = useLocation();
    const [signedIn, setSignedIn] = useState(false);
    const [currentWeek, setCurrentWeek] = useState(getStartOfWeek(new Date()));
    const [selectedFilter, setSelectedFilter] = useState(null);
    const [tasks, setTasks] = useState(tmpdata);

    useEffect(() => {
        if (Cookie.get("signed_in_user") !== undefined) {
            setSignedIn(Cookie.get("signed_in_user"));
            // API call to fetch activities and update tasks

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

    const isSameDay = (d1, d2) => {
        return d1.getFullYear() === d2.getFullYear() &&
            d1.getMonth() === d2.getMonth() &&
            d1.getDate() === d2.getDate();
    };

    const filteredTasks = tmpdata.filter(task => {
        const startDate = new Date(task.start_time);
        const endDate = new Date(task.end_time);
        return weekDays.some(day => isSameDay(day, startDate) || isSameDay(day, endDate));
    });

    const renderTaskInTimeSlot = (day, slot) => {
        const dayTasks = filteredTasks.filter(task => {
            const taskStart = new Date(task.start_time);
            const taskEnd = new Date(task.end_time);
            const slotHour = parseInt(slot.split(":")[0]);
            const slotMinutes = parseInt(slot.split(":")[1]);
    
            if (!isSameDay(taskStart, day) && !isSameDay(taskEnd, day)) {
                return false;
            }
    
            const slotTime = new Date(day);
            slotTime.setHours(slotHour, slotMinutes, 0, 0);
    
            return taskStart <= slotTime && taskEnd > slotTime;
        });
    
        return dayTasks.map((task, index) => (
            <b key={index} className="task-ribbon" style={{ backgroundColor: task.color }}>
                ⠀
            </b>
        ));
    };
    

    return (
        <div className="calendar-container">
            <div className="calendar-header">
                <button className="change-week" onClick={handlePrevWeek}>←</button>
                <h2>Week of {currentWeek.toDateString()}</h2>
                <button className="change-week" onClick={handleNextWeek}>→</button>
            </div>
            <div className="filters">
                <div>Filter:</div>
                {filters.map((filter, index) => (
                    <div
                        key={index}
                        onClick={() => setSelectedFilter(index)}
                        className={`${selectedFilter === index ? 'active-filter' : 'filter'}`}
                        style={{ backgroundColor: filter }}
                    >
                        ⠀
                    </div>
                ))}
                <div className="clear-filter" onClick={() => setSelectedFilter(null)}>Clear</div>
            </div>
            <div className="calendar-grid-wrapper">
                <div className="time-label-column">
                    {timeSlots.map((slot, slotIndex) => (
                        <div key={slotIndex} className="time-label">{slot}</div>
                    ))}
                </div>
                <div className="calendar-grid">
                    {weekDays.map((day, index) => (
                        <div key={index}>
                            <h3>{day.toDateString()}</h3>
                            <div className="calendar-day">
                                <div className="time-slots">
                                    {timeSlots.map((slot, slotIndex) => (
                                        <div key={slotIndex} className="time-slot">
                                            <div className="content-area">
                                                {renderTaskInTimeSlot(day, slot)}
                                            </div>
                                        </div>
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
