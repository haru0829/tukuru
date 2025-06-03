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
import {
  collection,
  query,
  where,
  getDocs,
  orderBy,
  doc,
  getDoc,
} from "firebase/firestore";
import { db, auth } from "../firebase";
import {
  startOfMonth,
  endOfMonth,
  isSameWeek,
  isSameDay,
  differenceInCalendarDays,
  addDays,
  format,
} from "date-fns";
import "./Record.scss";
import SidebarNav from "../components/SidebarNav";
import PostCard from "../components/PostCard";

const categoryColors = {
  illustration: "#E85D9E",
  picture: "#FFB300",
  video: "#A77FEA",
  music: "#4A90E2",
  literature: "#E84C4C",
};

const Record = () => {
  const [posts, setPosts] = useState([]);
  const [postDaysThisMonth, setPostDaysThisMonth] = useState(0);
  const [totalPosts, setTotalPosts] = useState(0);
  const [thisWeekPosts, setThisWeekPosts] = useState(0);
  const [currentStreak, setCurrentStreak] = useState(0);
  const [longestStreak, setLongestStreak] = useState(0);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedDayPosts, setSelectedDayPosts] = useState([]);

  useEffect(() => {
    const fetchPosts = async () => {
      const user = auth.currentUser;
      if (!user) return;

      try {
        const userDoc = await getDoc(doc(db, "users", user.uid));
        const userData = userDoc.exists() ? userDoc.data() : {};

        const q = query(
          collection(db, "posts"),
          where("authorId", "==", user.uid),
          orderBy("createdAt", "asc")
        );
        const snapshot = await getDocs(q);
        const postList = snapshot.docs.map((doc) => {
          const data = doc.data();
          return {
            ...data,
            id: doc.id,
            createdAt: data.createdAt?.toDate
              ? data.createdAt.toDate()
              : new Date(data.createdAt),
            author: {
              name: userData.name || data.authorName || "unknown",
              id: userData.id || "@unknown",
              photoURL: userData.photoURL || data.authorPhotoURL || "",
            },
          };
        });

        setPosts(postList);

        const now = new Date();
        const startMonth = startOfMonth(now);
        const endMonth = endOfMonth(now);

        const uniquePostDates = new Set(
          postList.map((p) => format(p.createdAt, "yyyy-MM-dd"))
        );
        const sortedUniqueDates = Array.from(uniquePostDates)
          .map((d) => new Date(d))
          .sort((a, b) => b.getTime() - a.getTime());

        setPostDaysThisMonth(
          sortedUniqueDates.filter((d) => d >= startMonth && d <= endMonth)
            .length
        );
        setTotalPosts(postList.length);
        setThisWeekPosts(
          postList.filter((p) =>
            isSameWeek(p.createdAt, now, { weekStartsOn: 1 })
          ).length
        );

        let currentStreakCount = 0;
        let longestStreakCount = 1;
        if (sortedUniqueDates.length > 0) {
          const latest = sortedUniqueDates[0];
          const diff = differenceInCalendarDays(now, latest);
          if (diff === 0 || diff === 1) {
            currentStreakCount = 1;
            for (let i = 1; i < sortedUniqueDates.length; i++) {
              const d = differenceInCalendarDays(
                sortedUniqueDates[i - 1],
                sortedUniqueDates[i]
              );
              if (d === 1) currentStreakCount++;
              else break;
            }
          }

          let tempLongest = 1;
          for (let i = 1; i < sortedUniqueDates.length; i++) {
            const d = differenceInCalendarDays(
              sortedUniqueDates[i - 1],
              sortedUniqueDates[i]
            );
            if (d === 1) tempLongest++;
            else tempLongest = 1;
            longestStreakCount = Math.max(longestStreakCount, tempLongest);
          }
        }

        setCurrentStreak(currentStreakCount);
        setLongestStreak(longestStreakCount);
      } catch (e) {
        console.error("Error fetching posts", e);
      }
    };

    fetchPosts();
  }, []);

  const handleDateClick = (date) => {
    setSelectedDate(date);
    const filtered = posts.filter((p) => isSameDay(p.createdAt, date));
    setSelectedDayPosts(filtered);
  };

  const weeklyChartData = useMemo(() => {
    const last7Days = Array.from({ length: 7 }, (_, i) =>
      addDays(new Date(), i - 6)
    );
    return last7Days.map((date) => {
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
      return { day: format(date, "M/d"), ...categoryCounts };
    });
  }, [posts]);

  const now = new Date();
  const totalDaysThisMonth = endOfMonth(now).getDate();

  return (
    <>
      <SidebarNav />
      <div className="record">
        <header>
          <h1>tukuru</h1>
        </header>

        <div className="container">
          <div className="record-summary">
            <h3>今月の記録率</h3>
            <p>
              {postDaysThisMonth} / {totalDaysThisMonth} 日 記録
            </p>
            <progress value={postDaysThisMonth} max={totalDaysThisMonth} />
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

          <div className="calendar-section">
            <h3>カレンダー</h3>
            <Calendar
              postRecords={posts}
              onDateClick={handleDateClick}
              selectedDate={selectedDate}
            />
          </div>

          {selectedDate && (
            <div className="selected-day-posts">
              <h3>{format(selectedDate, "yyyy年M月d日")} の投稿</h3>
              {selectedDayPosts.length > 0 ? (
                selectedDayPosts.map((post) => (
                  <PostCard key={post.id} post={post} />
                ))
              ) : (
                <p>この日には投稿がありません。</p>
              )}
            </div>
          )}

          <div className="weekly-graph">
            <h3>週間投稿</h3>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={weeklyChartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="day" interval={0} angle={-10} />
                <YAxis allowDecimals={false} />
                <Tooltip />
                {Object.keys(categoryColors).map((cat) => (
                  <Bar
                    key={cat}
                    dataKey={cat}
                    stackId="a"
                    fill={categoryColors[cat]}
                    barSize={20}
                  />
                ))}
              </BarChart>
            </ResponsiveContainer>
          </div>
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
    </>
  );
};

export default Record;
