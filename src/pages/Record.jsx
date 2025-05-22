import React, { useState, useEffect, useMemo } from "react";
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
import { collection, query, where, getDocs, orderBy } from "firebase/firestore";
import { db, auth } from "../firebase";
import {
  startOfMonth,
  endOfMonth,
  isSameWeek,
  isSameDay,
  differenceInCalendarDays,
  startOfWeek,
  addDays,
  format,
} from "date-fns";
import "./Record.scss";

const categoryColors = {
  "illustration": "#f9b8c4",
  "music": "#4fc3f7",
  "code": "#81c784",
};

/* バッジ機能は保留中のためコメントアウト
const commonBadges = [
  {
    title: "連続3日達成",
    description: "3日間連続で投稿した",
    icon: "🥉",
    unlocked: true,
  },
  {
    title: "連続7日達成",
    description: "7日間連続で投稿した",
    icon: "🥈",
    unlocked: true,
  },
  {
    title: "連続30日達成",
    description: "30日間連続で投稿した",
    icon: "🥇",
    unlocked: false,
  },
  {
    title: "初投稿",
    description: "初めて投稿した",
    icon: "🆕",
    unlocked: true,
  },
  {
    title: "10投稿達成",
    description: "合計10投稿達成",
    icon: "🔟",
    unlocked: true,
  },
  {
    title: "50投稿達成",
    description: "合計50投稿達成",
    icon: "🏆",
    unlocked: false,
  },
];

const categoryBadges = [
  {
    title: "初イラスト",
    description: "#初めて描いた を使用",
    icon: "🎨",
    unlocked: true,
  },
  {
    title: "音楽1曲",
    description: "#作曲 を使用",
    icon: "🎵",
    unlocked: false,
  },
  {
    title: "コード初投稿",
    description: "#初めてのコード を使用",
    icon: "💻",
    unlocked: true,
  },
  {
    title: "3カテゴリ達成",
    description: "3ジャンルに投稿",
    icon: "✨",
    unlocked: false,
  },
  {
    title: "夜投稿",
    description: "#夜描いた を使用",
    icon: "🌙",
    unlocked: true,
  },
  { title: "朝活", description: "朝6時台に投稿", icon: "☀️", unlocked: false },
];
*/

const Record = () => {
  const [activeTab, setActiveTab] = useState("record");
  const [selectedBadge, setSelectedBadge] = useState(null);
  const [posts, setPosts] = useState([]);
  const [postDaysThisMonth, setPostDaysThisMonth] = useState(0);
  const [totalPosts, setTotalPosts] = useState(0);
  const [thisWeekPosts, setThisWeekPosts] = useState(0);
  const [currentStreak, setCurrentStreak] = useState(0);
  const [longestStreak, setLongestStreak] = useState(0);

  useEffect(() => {
    const fetchPosts = async () => {
      const user = auth.currentUser;
      if (!user) return;

      const q = query(
        collection(db, "posts"),
        where("authorId", "==", user.uid),
        orderBy("createdAt")
      );
      const snapshot = await getDocs(q);
      const postList = snapshot.docs.map((doc) => ({
        ...doc.data(),
        id: doc.id,
        createdAt: doc.data().createdAt?.toDate?.() || doc.data().createdAt,
        category: doc.data().category,
      }));

      setPosts(postList);

      const now = new Date();
      const startMonth = startOfMonth(now);
      const endMonth = endOfMonth(now);

      const uniqueDateStrings = [
        ...new Set(postList.map((p) => p.createdAt.toDateString())),
      ];
      const dateObjects = uniqueDateStrings
        .map((str) => new Date(str))
        .sort((a, b) => b - a);

      const postsThisMonth = dateObjects.filter(
        (date) => date >= startMonth && date <= endMonth
      );
      setPostDaysThisMonth(postsThisMonth.length);
      setTotalPosts(postList.length);

      const thisWeek = postList.filter((p) =>
        isSameWeek(p.createdAt, now, { weekStartsOn: 1 })
      );
      setThisWeekPosts(thisWeek.length);

      let streak = 1;
      let maxStreak = 1;
      for (let i = 1; i < dateObjects.length; i++) {
        const diff = differenceInCalendarDays(
          dateObjects[i - 1],
          dateObjects[i]
        );
        if (diff === 1) {
          streak++;
          maxStreak = Math.max(maxStreak, streak);
        } else {
          streak = 1;
        }
      }

      const todayDiff = differenceInCalendarDays(now, dateObjects[0]);
      setCurrentStreak(todayDiff === 0 || todayDiff === 1 ? streak : 0);
      setLongestStreak(maxStreak);
    };

    fetchPosts();
  }, []);

  const weeklyChartData = useMemo(() => {
    return Array.from({ length: 7 }, (_, i) => {
      const date = addDays(new Date(), i - 6);
      const postsOfDay = posts.filter((p) => isSameDay(p.createdAt, date));

      const categoryCounts = Object.keys(categoryColors).reduce((acc, key) => {
        acc[key] = 0;
        return acc;
      }, {});

      postsOfDay.forEach((p) => {
        if (p.category && categoryCounts[p.category] !== undefined) {
          categoryCounts[p.category]++;
        }
      });

      return {
        day: format(date, "M/d"),
        ...categoryCounts,
      };
    });
  }, [posts]);

  const now = new Date();
  const totalDaysThisMonth = endOfMonth(now).getDate();

  return (
    <div className="record">
      <header>
        <h1>tukuru</h1>
      </header>
{/* 
      <div className="record-tabs">
        {/* <button
          className={activeTab === "record" ? "active" : ""}
          onClick={() => setActiveTab("record")}
        >
          記録
        </button> */}
        {/* バッジ機能は保留中
        <button
          className={activeTab === "badges" ? "active" : ""}
          onClick={() => setActiveTab("badges")}
        >
          バッジ
        </button>
        */}
      {/* </div> */} 

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

            <div className="record-stats-grid">
              <div className="stat-card">
                <div className="stat-value">{thisWeekPosts} 件</div>
                <div className="stat-label">今週の投稿数</div>
              </div>
              <div className="stat-card">
                <div className="stat-value">{totalPosts} 件</div>
                <div className="stat-label">累計投稿数</div>
              </div>
              <div className="stat-card">
                <div className="stat-value">{currentStreak} 日</div>
                <div className="stat-label">連続記録日数</div>
              </div>
              <div className="stat-card">
                <div className="stat-value">{longestStreak} 日</div>
                <div className="stat-label">最長記録日数</div>
              </div>
            </div>

            {currentStreak + 1 === longestStreak && (
              <div className="record-highlight">
                <p>あと1日で自己最長記録を超えます！</p>
              </div>
            )}

            <div className="calendar-section">
              <h3>カレンダー</h3>
              <Calendar postRecords={posts} />
            </div>

            <div className="weekly-graph">
              <div className="weekly-graph-header">
                <h3>週間投稿</h3>
              </div>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={weeklyChartData} margin={{ left: 0, right: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="day" />
                  <YAxis allowDecimals={false} />
                  <Tooltip />
                  {Object.keys(categoryColors).map((category) => (
                    <Bar
                      key={category}
                      dataKey={category}
                      stackId="a"
                      fill={categoryColors[category]}
                    />
                  ))}
                </BarChart>
              </ResponsiveContainer>
            </div>
          </>
        )}

        {/* バッジ機能は保留中
        {activeTab === "badges" && (
          <>
            <div className="badge-grid-section">
              <h3>共通バッジ</h3>
              <div className="badge-grid">
                {commonBadges.map((badge, index) => (
                  <div
                    key={`common-${index}`}
                    className={`badge-item ${
                      badge.unlocked ? "unlocked" : "locked"
                    }`}
                    onClick={() => setSelectedBadge(badge)}
                  >
                    <div className="badge-circle">{badge.icon}</div>
                    <div className="badge-title">
                      {badge.unlocked ? badge.title : "？"}
                    </div>
                  </div>
                ))}
              </div>

              <h3>カテゴリ別バッジ</h3>
              <div className="badge-grid">
                {categoryBadges.map((badge, index) => (
                  <div
                    key={`cat-${index}`}
                    className={`badge-item ${
                      badge.unlocked ? "unlocked" : "locked"
                    }`}
                    onClick={() => setSelectedBadge(badge)}
                  >
                    <div className="badge-circle">{badge.icon}</div>
                    <div className="badge-title">
                      {badge.unlocked ? badge.title : "？"}
                    </div>
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
                  <h4>
                    {selectedBadge.unlocked ? selectedBadge.title : "？？？"}
                  </h4>
                  <p>
                    {selectedBadge.unlocked
                      ? selectedBadge.description
                      : "条件は非公開です。"}
                  </p>
                  <button onClick={() => setSelectedBadge(null)}>閉じる</button>
                </div>
              </div>
            )}
          </>
        )} */}
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
