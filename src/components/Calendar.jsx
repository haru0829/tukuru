// src/components/Calendar.jsx
import React from "react";
import "./Calendar.scss";

const Calendar = ({ postDates = [] }) => {
  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth();

  const getDaysInMonth = (year, month) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getStartDay = (year, month) => {
    return new Date(year, month, 1).getDay();
  };

  const daysInMonth = getDaysInMonth(year, month);
  const startDay = getStartDay(year, month);

  const postDateSet = new Set(postDates.map(date => new Date(date).toDateString()));

  const calendarCells = [];

  for (let i = 0; i < startDay; i++) {
    calendarCells.push(<div key={"empty-" + i} className="calendar-cell empty"></div>);
  }

  for (let d = 1; d <= daysInMonth; d++) {
    const dateObj = new Date(year, month, d);
    const dateStr = dateObj.toDateString();
    const hasPost = postDateSet.has(dateStr);
    calendarCells.push(
      <div key={d} className={`calendar-cell ${hasPost ? "posted" : ""}`}>
        <span className="date-number">{d}</span>
        {hasPost && <div className="post-mark"></div>}
      </div>
    );
  }

  return (
    <div className="calendar">
      <div className="calendar-header">
        <h3>{year}年 {month + 1}月</h3>
      </div>
      <div className="calendar-grid">
        {calendarCells}
      </div>
    </div>
  );
};

export default Calendar;
