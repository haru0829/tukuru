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

const Record = () => {
  const [activeTab, setActiveTab] = useState("record");

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
            <Calendar />
          </>
        )}

        {activeTab === "badges" && (
          <>
            <div className="badge-progress">
              <h3>バッジ進捗</h3>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={badgeProgress} layout="vertical" margin={{ left: 30 }}>
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
