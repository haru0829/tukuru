import React, { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import HomeIcon from "@mui/icons-material/Home";
import SearchIcon from "@mui/icons-material/Search";
import PersonIcon from "@mui/icons-material/Person";
import SignalCellularAltIcon from "@mui/icons-material/SignalCellularAlt";
import Calendar from "../components/Calendar"; // Calendarコンポーネントのパスが正しいことを確認してください
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
import { db, auth } from "../firebase"; // Firebase設定のパスが正しいことを確認してください
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

// カテゴリごとの色定義
const categoryColors = {
  illustration: "#e53935",
  music: "#17b8a6",
  code: "#1e88e5",
};

const Record = () => {
  const [activeTab, setActiveTab] = useState("record"); // 現在アクティブなタブを管理 (現在は'record'のみ)
  const [posts, setPosts] = useState([]); // 取得した投稿データを保持
  const [postDaysThisMonth, setPostDaysThisMonth] = useState(0); // 今月の投稿日数
  const [totalPosts, setTotalPosts] = useState(0); // 累計投稿数
  const [thisWeekPosts, setThisWeekPosts] = useState(0); // 今週の投稿数
  const [currentStreak, setCurrentStreak] = useState(0); // 現在の連続投稿日数
  const [longestStreak, setLongestStreak] = useState(0); // 最長連続投稿日数

  useEffect(() => {
    const fetchPosts = async () => {
      const user = auth.currentUser;
      if (!user) {
        // ユーザーがログインしていない場合は処理を中断
        console.warn("User not logged in. Cannot fetch posts.");
        return;
      }

      try {
        const q = query(
          collection(db, "posts"),
          where("authorId", "==", user.uid),
          orderBy("createdAt", "asc") // 連続記録のために昇順で取得
        );
        const snapshot = await getDocs(q);
        const postList = snapshot.docs.map((doc) => ({
          ...doc.data(),
          id: doc.id,
          // FirestoreのTimestampオブジェクトをDateオブジェクトに変換
          createdAt: doc.data().createdAt?.toDate
            ? doc.data().createdAt.toDate()
            : new Date(doc.data().createdAt),
          category: doc.data().category,
        }));

        setPosts(postList);

        const now = new Date();
        const startMonth = startOfMonth(now);
        const endMonth = endOfMonth(now);

        // 投稿があったユニークな日付のセットを作成
        const uniquePostDates = new Set(
          postList.map((p) => format(p.createdAt, "yyyy-MM-dd"))
        );
        const sortedUniqueDates = Array.from(uniquePostDates)
          .map((dateStr) => new Date(dateStr))
          .sort((a, b) => b.getTime() - a.getTime()); // 新しい日付が先頭になるように降順でソート

        // 今月の投稿日数
        const postsThisMonth = sortedUniqueDates.filter(
          (date) => date >= startMonth && date <= endMonth
        );
        setPostDaysThisMonth(postsThisMonth.length);
        setTotalPosts(postList.length);

        // 今週の投稿数
        const thisWeekCount = postList.filter(
          (p) => isSameWeek(p.createdAt, now, { weekStartsOn: 1 }) // 週の始まりを月曜日に設定
        ).length;
        setThisWeekPosts(thisWeekCount);

        // 連続記録日数を計算
        let currentStreakCount = 0;
        let longestStreakCount = 0;

        if (sortedUniqueDates.length > 0) {
          let tempStreak = 1;
          longestStreakCount = 1;

          // 最新の投稿日が今日または昨日であれば、そこから現在の連続記録を計算
          const latestPostDate = sortedUniqueDates[0];
          const diffWithToday = differenceInCalendarDays(now, latestPostDate);

          if (diffWithToday === 0 || diffWithToday === 1) {
            // 今日の投稿があるか、昨日まで連続していた場合
            currentStreakCount = 1; // まず最新の日付をカウント
            for (let i = 1; i < sortedUniqueDates.length; i++) {
              const diff = differenceInCalendarDays(
                sortedUniqueDates[i - 1],
                sortedUniqueDates[i]
              );
              if (diff === 1) {
                currentStreakCount++;
              } else {
                break; // 連続が途切れたら終了
              }
            }
          }

          // 最長連続記録の計算 (全投稿日を対象)
          if (sortedUniqueDates.length > 0) {
            let tempLongest = 1;
            for (let i = 1; i < sortedUniqueDates.length; i++) {
              const diff = differenceInCalendarDays(
                sortedUniqueDates[i - 1],
                sortedUniqueDates[i]
              );
              if (diff === 1) {
                tempLongest++;
              } else {
                tempLongest = 1;
              }
              longestStreakCount = Math.max(longestStreakCount, tempLongest);
            }
          }
        }
        setCurrentStreak(currentStreakCount);
        setLongestStreak(longestStreakCount);
      } catch (error) {
        console.error("Error fetching posts:", error);
      }
    };

    fetchPosts();
  }, []); // 依存配列が空なので、コンポーネントのマウント時に一度だけ実行

  // 週間投稿グラフのデータを生成
  const weeklyChartData = useMemo(() => {
    // 過去7日間の日付配列を作成
    const last7Days = Array.from({ length: 7 }, (_, i) =>
      addDays(new Date(), i - 6)
    );

    return last7Days.map((date) => {
      // その日の投稿をフィルタリング
      const postsOfDay = posts.filter((p) => isSameDay(p.createdAt, date));

      // カテゴリごとの投稿数をカウントするための初期化
      const categoryCounts = Object.keys(categoryColors).reduce((acc, key) => {
        acc[key] = 0;
        return acc;
      }, {});

      // 投稿のカテゴリをカウント
      postsOfDay.forEach((p) => {
        if (p.category && categoryCounts[p.category] !== undefined) {
          categoryCounts[p.category]++;
        }
      });

      return {
        day: format(date, "M/d"), // 例: 5/20
        ...categoryCounts,
      };
    });
  }, [posts]); // postsデータが変更されたら再計算

  const now = new Date();
  const totalDaysThisMonth = endOfMonth(now).getDate(); // 今月の日数

  return (
    <>
      <SidebarNav />
      <header>
        <h1>tukuru</h1>
      </header>

      <div className="record">
        {/* タブ機能は今回は使用せず、記録ページを直接表示 */}
        {/* <div className="record-tabs">
        <button
          className={activeTab === "record" ? "active" : ""}
          onClick={() => setActiveTab("record")}
        >
          記録
        </button>
      </div> */}

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

              {/* 最長記録に近づいた場合のハイライト表示 */}
              {currentStreak > 0 && currentStreak + 1 === longestStreak && (
                <div className="record-highlight">
                  <p>💡 あと1日で自己最長記録を**更新**できます！</p>
                </div>
              )}
              {currentStreak === longestStreak && longestStreak > 0 && (
                <div className="record-highlight">
                  <p>🎉 自己最長記録を**更新中**です！</p>
                </div>
              )}
              {currentStreak === 0 &&
                longestStreak === 0 &&
                posts.length > 0 && (
                  <div className="record-highlight">
                    <p>🗓️ 最初の投稿を始めてみましょう！</p>
                  </div>
                )}

              <div className="calendar-section">
                <h3>カレンダー</h3>
                <Calendar
                  postRecords={posts}
                  categoryColors={categoryColors}
                />{" "}
                {/* categoryColorsを渡す */}
              </div>

              <div className="weekly-graph">
                <h3>週間投稿</h3>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart
                    data={weeklyChartData}
                    margin={{ left: 0, right: 0 }}
                  >
                    <CartesianGrid
                      strokeDasharray="3 3"
                      vertical={false}
                      stroke="#E0E0E0"
                    />{" "}
                    {/* 縦線を非表示、グリッド線色変更 */}
                    <XAxis
                      dataKey="day"
                      axisLine={false} // 軸線を非表示
                      tickLine={false} // 目盛り線を非表示
                      padding={{ left: 10, right: 10 }}
                      style={{ fontSize: "12px", fill: "#666" }} // ラベルのスタイル
                    />
                    <YAxis
                      allowDecimals={false}
                      axisLine={false}
                      tickLine={false}
                      width={30} // Y軸の幅を調整
                      style={{ fontSize: "12px", fill: "#666" }}
                    />
                    <Tooltip
                      cursor={{ fill: "rgba(0, 0, 0, 0.05)" }} // ツールチップの背景色
                      wrapperStyle={{
                        borderRadius: "8px",
                        boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                      }}
                      contentStyle={{
                        border: "none",
                        backgroundColor: "rgba(255, 255, 255, 0.95)",
                        borderRadius: "8px",
                      }}
                      labelStyle={{ color: "#1C1C1E", fontWeight: "bold" }}
                      itemStyle={{ color: "#666666" }}
                    />
                    {Object.keys(categoryColors).map((category) => (
                      <Bar
                        key={category}
                        dataKey={category}
                        stackId="a"
                        fill={categoryColors[category]}
                        barSize={12} // バーの太さ
                        radius={[4, 4, 0, 0]} // バーの角を丸くする
                      />
                    ))}
                  </BarChart>
                </ResponsiveContainer>
                <div className="category-legend">
                  {Object.entries(categoryColors).map(([category, color]) => (
                    <div key={category} className="legend-item">
                      <span
                        className="legend-color"
                        style={{ backgroundColor: color }}
                      ></span>
                      <span className="legend-label">
                        {category === "illustration"
                          ? "イラスト"
                          : category === "music"
                          ? "音楽"
                          : category === "code"
                          ? "コード"
                          : category}
                      </span>
                    </div>
                  ))}
                </div>
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
    </>
  );
};

export default Record;
