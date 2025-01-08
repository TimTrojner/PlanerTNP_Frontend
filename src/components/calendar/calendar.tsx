import axios from 'axios'
import Cookie from 'js-cookie'
import React, { ChangeEvent, useEffect, useRef, useState } from 'react'
import '../../App.css'
import './calendar.css'
import { type Task } from '../../types/task'
import { CircleUserRound, LetterTextIcon } from 'lucide-react'

function getStartOfWeek(date: Date) {
  const dayOfWeek = date.getDay()
  const difference = date.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1)
  return new Date(date.setDate(difference))
}

function addDays(date: Date, days: number) {
  const newDate = new Date(date)
  newDate.setDate(date.getDate() + days)
  return newDate
}

// let filters = [
//   '#1abc9c',
//   '#2ecc71',
//   '#3498db',
//   '#9b59b6',
//   '#f1c40f',
//   '#e67e22',
//   '#e74c3c',
//   '#34495e',
//   '#95a5a6',
//   '#7f8c8d',
// ]

interface Filters {
  [color: string]: { subjectName: string; color: string }
}

let filters = {} as Filters

function Calendar() {
  const [signedIn, setSignedIn] = useState(false)
  const [currentWeek, setCurrentWeek] = useState(getStartOfWeek(new Date()))
  const [selectedFilter, setSelectedFilter] = useState<string | null>(null)
  const [tasks, setTasks] = useState<Task[]>([])
  const [schedules, setSchedules] = useState([])
  const fileInputRef = useRef(null)

  useEffect(() => {
    if (Cookie.get('signed_in_user') !== undefined) {
      const user = JSON.parse(Cookie.get('signed_in_user') as string)
      setSignedIn(user)

      // Fetch tasks and schedules in parallel
      Promise.all([
        axios.get(`${process.env.REACT_APP_API}/task/user/${user._id}/tasks`),
        axios.get(`${process.env.REACT_APP_API}/schedule/schedules/all`),
      ])
        .then(([taskResponse, scheduleResponse]) => {
          const userTasks = taskResponse.data.tasks
          const schedules = scheduleResponse.data.tasks // Assuming schedules are in 'tasks'

          // Map over schedules to match task properties
          const formattedSchedules: Task[] = schedules.map(
            (schedule: {
              name: string
              color: string
              start_time: string
              end_time: string
            }) => {
              filters[schedule.color] = {
                subjectName: schedule.name,
                color: schedule.color,
              }
              return {
                _id: user._id,
                color: schedule.color,
                name: schedule.name,
                startDateTime: schedule.start_time,
                endDateTime: schedule.end_time,
              }
            }
          )

          // Combine user tasks and formatted schedules into a single array
          const combinedTasks = [...userTasks, ...formattedSchedules]
          setTasks(combinedTasks)

          // Log the combined tasks array
          console.log('Fetched and combined tasks:', combinedTasks)
        })
        .catch((error) => {
          console.error('Error fetching tasks or schedules:', error)
        })
    } else {
      setSignedIn(false)
    }
  }, [])

  const handlePrevWeek = () => {
    setCurrentWeek(addDays(currentWeek, -7))
  }

  const handleNextWeek = () => {
    setCurrentWeek(addDays(currentWeek, 7))
  }

  const weekDays: Date[] = []
  for (let i = 0; i < 7; i++) {
    weekDays.push(addDays(currentWeek, i))
  }

  const timeSlots: string[] = []
  for (let i = 0; i < 24 * 2; i++) {
    const hours = Math.floor(i / 2)
    const minutes = i % 2 === 0 ? '00' : '30'
    timeSlots.push(`${hours.toString().padStart(2, '0')}:${minutes}`)
  }

  const isSameDay = (d1: Date, d2: Date) => {
    return (
      d1.getFullYear() === d2.getFullYear() &&
      d1.getMonth() === d2.getMonth() &&
      d1.getDate() === d2.getDate()
    )
  }

  const filteredTasks = tasks.filter((task) => {
    const startDate = new Date(task.startDateTime)
    const endDate = new Date(task.endDateTime)

    return weekDays.some(
      (day) => startDate <= day && endDate >= day // Checks if the task spans across the week
    )
  })

  const renderTaskInTimeSlot = (day: Date, slot: string) => {
    const dayTasks = tasks.filter((task) => {
      const taskStart = new Date(task.startDateTime)
      const taskEnd = new Date(task.endDateTime)
      const slotHour = parseInt(slot.split(':')[0])
      const slotMinutes = parseInt(slot.split(':')[1])

      const slotTime = new Date(day)
      slotTime.setHours(slotHour, slotMinutes, 0, 0)
      // Adjust to include entire range on the given day
      return taskStart <= slotTime && taskEnd > slotTime
    })

    return dayTasks.map((task, index) =>
      selectedFilter !== null &&
      task.color !== filters[selectedFilter].color ? null : (
        <p
          key={index}
          className="task-ribbon"
          style={{ backgroundColor: task.color }}
        >
          <b>{/*⠀*/ task.name}</b>
        </p>
      )
    )
  }

  const handleFileImport = (
    event: ChangeEvent<HTMLInputElement> & HTMLElement
  ) => {
    const file = event.target?.files?.[0]
    if (file && file.type === 'application/json') {
      const reader = new FileReader()
      reader.onload = (e) => {
        let res = e.target?.result
        if (res !== null) {
          const jsonData = JSON.parse(res as string)
          setTasks((prevTasks) => [...prevTasks, jsonData])
          console.log(jsonData)
        }
      }
      reader.readAsText(file)
    } else {
      alert('Please select a valid JSON file.')
    }
  }

  return (
    <div className="calendar-container">
      <div className="calendar-header">
        <button className="change-week" onClick={handlePrevWeek}>
          ←
        </button>
        <h2>Week of {currentWeek.toDateString()}</h2>
        <button className="change-week" onClick={handleNextWeek}>
          →
        </button>
      </div>
      <div className="filter-box">
        <div className="group-name">
          <label htmlFor="name" className="group-label">
            Name
          </label>
          <div className="group-wrapper">
            <div className="group-element-wrapper">
              <input
                id="name"
                name="name"
                type="text"
                placeholder="Enter the name"
                className="group-element"
              />
              <LetterTextIcon className="group-icon" />
            </div>
          </div>
        </div>
        <div className="group-select">
          <label htmlFor="study-program" className="group-label">
            Study program selection
          </label>
          <div className="group-wrapper">
            <select
              id="study-program"
              name="study-program"
              className="group-element"
              defaultValue=""
            >
              <option value="" disabled>
                Study program
              </option>
              {['Računalništvo', 'Informatika', 'Elektrotehnika'].map(
                (program, index) => (
                  <option key={index} value={program}>
                    {program}
                  </option>
                )
              )}
            </select>
            <CircleUserRound className="group-icon" />
          </div>
        </div>
        <div className="group-select">
          <label htmlFor="groups" className="group-label">
            Group selection
          </label>
          <div className="group-wrapper">
            <select
              id="groups"
              name="groups"
              className="group-element"
              defaultValue=""
            >
              <option value="" disabled>
                Groups
              </option>
              {['RV1', 'RV2', 'RV3'].map((group, index) => (
                <option key={index} value={group}>
                  {group}
                </option>
              ))}
            </select>
            <CircleUserRound className="group-icon" />
          </div>
        </div>
      </div>

      <div className="filters">
        <div>Filter:</div>
        {Object.values(filters).map(({ color, subjectName }, index) => {
          return (
            <React.Fragment key={index}>
              <p
                style={{
                  display: 'inline',
                  marginRight: '10px',
                  color: color,
                  textDecoration:
                    selectedFilter === color ? 'underline' : 'none',
                  fontSize: '0.8em',
                  WebkitTextStroke: '0.3px black',
                  WebkitTextFillColor: color,
                }}
              >
                {subjectName}
              </p>
              <div
                onClick={() => setSelectedFilter(color)}
                className={`${selectedFilter === color ? 'active-filter' : 'filter'}`}
                style={{ backgroundColor: color }}
              ></div>
            </React.Fragment>
          )
        })}
        <div className="clear-filter" onClick={() => setSelectedFilter(null)}>
          Clear
        </div>
      </div>
      <div className="calendar-grid-wrapper">
        <div className="time-label-column">
          {timeSlots.map((slot, slotIndex) => (
            <div key={slotIndex} className="time-label">
              {slot}
            </div>
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
      {signedIn ? (
        <div className="import-data">
          <span>Import your own schedule: </span>
          <input
            type="file"
            accept=".json"
            ref={fileInputRef}
            onChange={handleFileImport}
          />
        </div>
      ) : null}
    </div>
  )
}

export default Calendar
