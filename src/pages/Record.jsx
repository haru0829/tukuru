// src/pages/Record.jsx
import React, { useState } from "react";
import { Link } from "react-router-dom";
import HomeIcon from "@mui/icons-material/Home";
import SearchIcon from "@mui/icons-material/Search";
import PersonIcon from "@mui/icons-material/Person";
import SignalCellularAltIcon from "@mui/icons-material/SignalCellularAlt";
import Calendar from "../components/Calendar";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import "./Record.scss";

const badgeProgress = [
  { name: "イラスト", value: 7 },
  { name: "音楽", value: 3 },
  { name: "コード", value: 5 },
];

const weeklyDataSets = [
  [
    { day: "5/6", count: 1 },
    { day: "5/7", count: 0 },
    { day: "5/8", count: 3 },
    { day: "5/9", count: 2 },
    { day: "5/10", count: 2 },
    { day: "5/11", count: 1 },
    { day: "5/12", count: 0 },
  ],
  [
    { day: "5/13", count: 2 },
    { day: "5/14", count: 1 },
    { day: "5/15", count: 0 },
    { day: "5/16", count: 3 },
    { day: "5/17", count: 2 },
    { day: "5/18", count: 4 },
    { day: "5/19", count: 1 },
  ]
];

const Record = () => {
  const [activeTab, setActiveTab] = useState("record");
  const [weekIndex, setWeekIndex] = useState(1);
  const postDaysThisMonth = 17;
  const totalDaysThisMonth = 30;
  const totalPosts = 123;
  const thisWeekPosts = 13;
  const currentStreak = 6;
  const longestStreak = 13;

  const handlePrevWeek = () => {
    setWeekIndex((prev) => Math.max(0, prev - 1));
  };

  const handleNextWeek = () => {
    setWeekIndex((prev) => Math.min(weeklyDataSets.length - 1, prev + 1));
  };

  return (
    <div className="record">
      <header>
        <h1>tukuru</h1>
      </header>

      <div className="record-tabs">
        <button
          className={activeTab === "record" ? "active" : ""}
          onClick={() => setActiveTab("record")}
        >
          記録
        </button>
        <button
          className={activeTab === "badges" ? "active" : ""}
          onClick={() => setActiveTab("badges")}
        >
          バッジ
        </button>
      </div>

      <div className="container">
        {activeTab === "record" && (
          <>
            <div className="record-summary">
              <h3>今月の記録率</h3>
              <p>
                {postDaysThisMonth} / {totalDaysThisMonth} 日 記録
              </p>
              <progress
                value={postDaysThisMonth}
                max={totalDaysThisMonth}
              ></progress>
            </div>

            <div className="record-counts">
              <p>今週の投稿数: {thisWeekPosts} 件</p>
              <p>累計投稿数: {totalPosts} 件</p>
              <p>連続記録日数: {currentStreak} 日</p>
              <p>最長記録日数: {longestStreak} 日</p>
            </div>

            <div className="record-highlight">
              <p>あと1日で自己最長記録を超えます！</p>
            </div>

            <div className="calendar-section">
              <h3>カレンダー</h3>
              <Calendar />
            </div>

            <div className="weekly-graph">
              <div className="weekly-graph-header">
                <h3>週間投稿</h3>
                <div className="week-nav">
                  <button onClick={handlePrevWeek} disabled={weekIndex === 0}>←</button>
                  <span>Week {weekIndex + 1}</span>
                  <button onClick={handleNextWeek} disabled={weekIndex === weeklyDataSets.length - 1}>→</button>
                </div>
              </div>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={weeklyDataSets[weekIndex]} margin={{ left: 0, right: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="day" />
                  <YAxis allowDecimals={false} />
                  <Tooltip />
                  <Bar dataKey="count" fill="#4da1d9" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </>
        )}

        {activeTab === "badges" && (
          <>
            <div className="badge-progress">
              <h3>バッジ進捗</h3>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart
                  data={badgeProgress}
                  layout="vertical"
                  margin={{ left: 30 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" domain={[0, 10]} />
                  <YAxis type="category" dataKey="name" />
                  <Tooltip />
                  <Bar dataKey="value" fill="#DD2E1E" />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="badge-grid">
              {[...Array(9)].map((_, i) => (
                <div key={i} className="badge-item">
                  🏅 バッジ {i + 1}
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      <footer>
        <div className="footerNav">
          <Link to="/" className="footerNavItem">
            <HomeIcon />
            <p className="footerNavItemText">ホーム</p>
          </Link>
          <Link to="/search" className="footerNavItem">
            <SearchIcon />
            <p className="footerNavItemText">検索</p>
          </Link>
          <Link to="/record" className="footerNavItem active">
            <SignalCellularAltIcon />
            <p className="footerNavItemText">記録</p>
          </Link>
          <Link to="/mypage" className="footerNavItem">
            <PersonIcon />
            <p className="footerNavItemText">マイページ</p>
          </Link>
        </div>
      </footer>
    </div>
  );
};

export default Record;
