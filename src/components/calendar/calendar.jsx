import Cookie from "js-cookie";
import { useEffect, useRef, useState } from "react";
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

const filters = [
    '#1abc9c', 
    '#2ecc71', 
    '#3498db', 
    '#9b59b6', 
    '#f1c40f', 
    '#e67e22', 
    '#e74c3c', 
    '#34495e', 
    '#95a5a6', 
    '#7f8c8d', 
  ];
  
const tmpdata = [
    { "task_name": "overflow: hidden;", "description": "neke neke", "color": '#e74c3c', "start_time": "2024-10-22T14:00:00", "end_time": "2024-10-22T16:00:00" },
    { "task_name": "task2", "description": "neke neke", "color": '#9b59b6', "start_time": "2024-10-22T14:00:00", "end_time": "2024-10-23T16:00:00" },
    { "task_name": "task3", "description": "neke neke", "color": "#2ecc71", "start_time": "2024-10-23T18:00:00", "end_time": "2024-10-24T20:00:00" },
    { "task_name": "task4", "description": "neke neke", "color": "#7f8c8d", "start_time": "2024-10-24T22:00:00", "end_time": "2024-10-25T23:00:00" }
];


function Calendar() {
    const location = useLocation();
    const [signedIn, setSignedIn] = useState(false);
    const [currentWeek, setCurrentWeek] = useState(getStartOfWeek(new Date()));
    const [selectedFilter, setSelectedFilter] = useState(null);
    const [tasks, setTasks] = useState(tmpdata);
    const fileInputRef = useRef(null);

    useEffect(() => {
        if (Cookie.get("signed_in_user") !== undefined) {
            setSignedIn(Cookie.get("signed_in_user"));
            /*axios.get("http://localhost:5551/tasks").then((response) => {
                setTasks(response.data);
            });*/
            setTasks(tmpdata);

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

    const filteredTasks = tasks.filter(task => {
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
            selectedFilter !== null && task.color !== filters[selectedFilter] ? null : (
                <p key={index} className="task-ribbon" style={{ backgroundColor: task.color }}>
                    <b>{/*⠀*/task.task_name}</b>
                </p>
            )
        ));
    };

    const handleFileImport = (event) => {
        const file = event.target.files[0];
        if (file && file.type === "application/json") {
            const reader = new FileReader();
            reader.onload = (e) => {
                const jsonData = JSON.parse(e.target.result);
                setTasks(prevTasks => [...prevTasks, jsonData]);
                console.log(jsonData);
            };
            reader.readAsText(file);
        } else {
            alert("Please select a valid JSON file.");
        }
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
            {signedIn !== false ? (
                <div className="import-data">
                    <span>Import your own schedule: </span>
                    <input
                        type="file"
                        accept=".json"
                        ref={fileInputRef}
                        onChange={handleFileImport}
                    />
                </div>) : null
            }
        </div>
    );
}

export default Calendar;
