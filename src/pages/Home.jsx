import React from "react";
import "./Home.scss";
import MoreHorizIcon from "@mui/icons-material/MoreHoriz";
import HomeIcon from "@mui/icons-material/Home";
import SearchIcon from "@mui/icons-material/Search";
import PersonIcon from "@mui/icons-material/Person";
import { Link } from "react-router-dom";
import SignalCellularAltIcon from '@mui/icons-material/SignalCellularAlt';

const Home = () => {
  return (
    <div className="home">
      <header>
        <h1>tukuru</h1>
      </header>

      <div className="container">
        {/* 投稿カード（仮データ3件） */}
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
          <Link to="/" className="footerNavItem active">
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
          <Link to="/mypage" className="footerNavItem">
            <PersonIcon />
            <p className="footerNavItemText">マイページ</p>
          </Link>
        </div>
      </footer>
    </div>
  );
};

export default Home;
