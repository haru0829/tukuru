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

const commonBadges = [
  { title: "連続3日達成", description: "3日間連続で投稿した", icon: "🥉", unlocked: true },
  { title: "連続7日達成", description: "7日間連続で投稿した", icon: "🥈", unlocked: true },
  { title: "連続30日達成", description: "30日間連続で投稿した", icon: "🥇", unlocked: false },
  { title: "初投稿", description: "初めて投稿した", icon: "🆕", unlocked: true },
  { title: "10投稿達成", description: "合計10投稿達成", icon: "🔟", unlocked: true },
  { title: "50投稿達成", description: "合計50投稿達成", icon: "🏆", unlocked: false },
];

const categoryBadges = [
  { title: "初イラスト", description: "#初めて描いた を使用", icon: "🎨", unlocked: true },
  { title: "音楽1曲", description: "#作曲 を使用", icon: "🎵", unlocked: false },
  { title: "コード初投稿", description: "#初めてのコード を使用", icon: "💻", unlocked: true },
  { title: "3カテゴリ達成", description: "3ジャンルに投稿", icon: "✨", unlocked: false },
  { title: "夜投稿", description: "#夜描いた を使用", icon: "🌙", unlocked: true },
  { title: "朝活", description: "朝6時台に投稿", icon: "☀️", unlocked: false },
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
  ],
];

const Record = () => {
  const [activeTab, setActiveTab] = useState("record");
  const [weekIndex, setWeekIndex] = useState(1);
  const [selectedBadge, setSelectedBadge] = useState(null);
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
        {/* 記録タブ */}
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
                  <button onClick={handlePrevWeek} disabled={weekIndex === 0}>
                    ←
                  </button>
                  <span>Week {weekIndex + 1}</span>
                  <button
                    onClick={handleNextWeek}
                    disabled={weekIndex === weeklyDataSets.length - 1}
                  >
                    →
                  </button>
                </div>
              </div>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart
                  data={weeklyDataSets[weekIndex]}
                  margin={{ left: 0, right: 0 }}
                >
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

        {/* バッジタブ */}
        {activeTab === "badges" && (
          <>

            <div className="badge-grid-section">
              <h3>共通バッジ</h3>
              <div className="badge-grid">
                {commonBadges.map((badge, index) => (
                  <div
                    key={`common-${index}`}
                    className={`badge-item ${badge.unlocked ? "unlocked" : "locked"}`}
                    onClick={() => setSelectedBadge(badge)}
                  >
                    <div className="badge-circle">{badge.icon}</div>
                    <div className="badge-title">{badge.unlocked ? badge.title : "？"}</div>
                  </div>
                ))}
              </div>

              <h3>カテゴリ別バッジ</h3>
              <div className="badge-grid">
                {categoryBadges.map((badge, index) => (
                  <div
                    key={`cat-${index}`}
                    className={`badge-item ${badge.unlocked ? "unlocked" : "locked"}`}
                    onClick={() => setSelectedBadge(badge)}
                  >
                    <div className="badge-circle">{badge.icon}</div>
                    <div className="badge-title">{badge.unlocked ? badge.title : "？"}</div>
                  </div>
                ))}
              </div>
            </div>

            {selectedBadge && (
              <div
                className="badge-modal-overlay"
                onClick={() => setSelectedBadge(null)}
              >
                <div
                  className="badge-modal"
                  onClick={(e) => e.stopPropagation()}
                >
                  <h4>{selectedBadge.unlocked ? selectedBadge.title : "？？？"}</h4>
                  <p>{selectedBadge.unlocked ? selectedBadge.description : "条件は非公開です。"}</p>
                  <button onClick={() => setSelectedBadge(null)}>閉じる</button>
                </div>
              </div>
            )}
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
