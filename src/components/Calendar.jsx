// src/components/Calendar.jsx
import React, { useState } from "react";
import "./Calendar.scss";

const Calendar = ({ postRecords = [] }) => {
  // 仮データ
  if (postRecords.length === 0) {
    postRecords = [
      { date: "2025-05-01", category: "illustration" },
      { date: "2025-05-01", category: "music" },
      { date: "2025-05-02", category: "code" },
      { date: "2025-05-04", category: "code" },
    ];
  }

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

  const getDaysInMonth = (year, month) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getStartDay = (year, month) => {
    return new Date(year, month, 1).getDay();
  };

  const daysInMonth = getDaysInMonth(currentYear, currentMonth);
  const startDay = getStartDay(currentYear, currentMonth);

  // 日付ごとにカテゴリをマッピング
  const dateCategoryMap = {};
  postRecords.forEach(({ date, category }) => {
    const key = new Date(date).toDateString();
    if (!dateCategoryMap[key]) {
      dateCategoryMap[key] = [];
    }
    dateCategoryMap[key].push(category);
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

    // 同カテゴリの重複投稿にも対応してドットを分けて表示
    const categoryCounts = categories.reduce((acc, cat) => {
      acc[cat] = (acc[cat] || 0) + 1;
      return acc;
    }, {});

    calendarCells.push(
      <div
        key={d}
        className={`calendar-cell ${Object.keys(categoryCounts)
          .map((c) => `has-${c}`)
          .join(" ")}`}
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
      <div className="calendar-grid">{calendarCells}</div>
    </div>
  );
};

export default Calendar;
