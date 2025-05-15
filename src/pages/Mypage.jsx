import React from "react";
import "./Mypage.scss";
import EditIcon from "@mui/icons-material/Edit";
import { Link } from "react-router-dom";
import HomeIcon from "@mui/icons-material/Home";
import SearchIcon from "@mui/icons-material/Search";
import PersonIcon from "@mui/icons-material/Person";
import SignalCellularAltIcon from "@mui/icons-material/SignalCellularAlt";
import ComputerIcon from "@mui/icons-material/Computer";
import MoreHorizIcon from "@mui/icons-material/MoreHoriz";

const Mypage = () => {
  const user = {
    name: "User",
    day: 10,
    location: "茨城県、つくば市",
    tags: ["かけだしプログラマー", "初心者", "パソコンカタカタ", "結局python"],
    intro:
      "今年からプログラミング始めました！プログラミングやってる方たちぜひ仲良くしてください〜pythonを頑張ってます。",
  };

  return (
    <div className="mypage">
      <header className="mypage-header">
        <h1 className="logo">tukuru</h1>
      </header>

      <div className="profile-section">
        <div className="banner">
          <button className="edit-button">
            <EditIcon />
          </button>
        </div>
        <div className="icon-wrapper">
          <img className="user-icon" src="img/userIcon.png" alt="" />
        </div>

        <div className="user-info">
          <div className="name-row">
            <p className="username">{user.name}</p>
            <div className="day-badge">
              <div className="icon">
                <ComputerIcon />
                Day {user.day}
              </div>
            </div>
          </div>
          <p className="intro">{user.intro}</p>

          <div className="tags">
            {user.tags.map((tag, index) => (
              <span key={index} className="tag">
                {tag}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="post-section">
        {[1, 2, 3].map((_, index) => (
          <div className="postItem" key={index}>
            <div className="userInfo">
              <img src="img/userIcon.png" alt="User Icon" />
              <div className="userInfoRight">
                <div className="userTop">
                  <p>User</p>
                  <MoreHorizIcon />
                </div>
                <div className="userMeta">
                  <p className="day">Day90</p>
                  <p>東京都, 渋谷区</p>
                  <p>3時間前</p>
                </div>
              </div>
            </div>

            <img
              src="img/programming.png"
              alt="投稿画像"
              className="postImage"
            />

            <p className="postText">
              午前中エラー地獄、午後でちょっと復活。
              気づいたら90日目だったらしい。びっくり。
            </p>

            <div className="postReactions">
              <button className="reactionAdd">＋</button>
            </div>
          </div>
        ))}
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
          <Link to="/report" className="footerNavItem">
            <SignalCellularAltIcon />
            <p className="footerNavItemText">記録</p>
          </Link>
          <Link to="/mypage" className="footerNavItem active">
            <PersonIcon />
            <p className="footerNavItemText">マイページ</p>
          </Link>
        </div>
      </footer>
    </div>
  );
};

export default Mypage;
