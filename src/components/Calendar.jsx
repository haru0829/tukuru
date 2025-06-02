// src/components/Calendar.jsx
import React, { useState } from "react";
import "./Calendar.scss";

const Calendar = ({ postRecords = [], onDateClick, selectedDate }) => {
  const today = new Date();
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());

  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentYear(currentYear - 1);
      setCurrentMonth(11);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentYear(currentYear + 1);
      setCurrentMonth(0);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  };

  const getDaysInMonth = (year, month) =>
    new Date(year, month + 1, 0).getDate();
  const getStartDay = (year, month) => new Date(year, month, 1).getDay();

  const daysInMonth = getDaysInMonth(currentYear, currentMonth);
  const startDay = getStartDay(currentYear, currentMonth);

  const dateCategoryMap = {};
  postRecords.forEach(({ createdAt, category }) => {
    if (!createdAt || !category) return;
    const date = createdAt.toDate ? createdAt.toDate() : createdAt;
    const dateStr = date.toDateString();
    if (!dateCategoryMap[dateStr]) {
      dateCategoryMap[dateStr] = [];
    }
    dateCategoryMap[dateStr].push(category);
  });

  const calendarCells = [];

  for (let i = 0; i < startDay; i++) {
    calendarCells.push(
      <div key={"empty-" + i} className="calendar-cell empty"></div>
    );
  }

  for (let d = 1; d <= daysInMonth; d++) {
    const dateObj = new Date(currentYear, currentMonth, d);
    const dateStr = dateObj.toDateString();
    const categories = dateCategoryMap[dateStr] || [];

    const isSelected =
      selectedDate && dateObj.toDateString() === selectedDate.toDateString();

    const categoryCounts = categories.reduce((acc, cat) => {
      acc[cat] = (acc[cat] || 0) + 1;
      return acc;
    }, {});

    calendarCells.push(
      <div
        key={d}
        className={`calendar-cell ${isSelected ? "selected" : ""} ${Object.keys(
          categoryCounts
        )
          .map((c) => `has-${c}`)
          .join(" ")}`}
        onClick={() => onDateClick?.(dateObj)}
      >
        <span className="date-number">{d}</span>
        <div className="dot-wrapper">
          {Object.entries(categoryCounts).flatMap(([cat, count]) =>
            [...Array(count)].map((_, i) => (
              <span
                key={`${cat}-${i}`}
                className={`post-dot post-dot-${cat}`}
              ></span>
            ))
          )}
        </div>
      </div>
    );
  }

  const weekdays = ["日", "月", "火", "水", "木", "金", "土"];

  return (
    <div className="calendar">
      <div className="calendar-header">
        <div className="calendar-nav">
          <button onClick={handlePrevMonth}>←</button>
          <h3>
            {currentYear}年 {currentMonth + 1}月
          </h3>
          <button onClick={handleNextMonth}>→</button>
        </div>
      </div>
      <div className="calendar-weekdays">
        {weekdays.map((day, index) => (
          <div key={index}>{day}</div>
        ))}
      </div>
      <div className="calendar-grid">{calendarCells}</div>
    </div>
  );
};

export default Calendar;
