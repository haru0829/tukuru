// src/pages/Search.jsx
import React, { useState } from "react";
import "./Search.scss";
import PaletteIcon from "@mui/icons-material/Palette";
import HeadphonesIcon from "@mui/icons-material/Headphones";
import CreateIcon from "@mui/icons-material/Create";
import PhotoCameraIcon from "@mui/icons-material/PhotoCamera";
import HandymanIcon from "@mui/icons-material/Handyman";
import CodeIcon from "@mui/icons-material/Code";
import RestaurantMenuIcon from "@mui/icons-material/RestaurantMenu";
import { Link } from "react-router-dom";
import HomeIcon from "@mui/icons-material/Home";
import SearchIcon from "@mui/icons-material/Search";
import PersonIcon from "@mui/icons-material/Person";
import SignalCellularAltIcon from '@mui/icons-material/SignalCellularAlt';


const Search = () => {
  const [keyword, setKeyword] = useState("");

  const genres = [
    {
      key: "illustration",
      icon: <PaletteIcon />,
      label: "イラスト",
      colorClass: "bg-illust",
    },
    {
      key: "music",
      icon: <HeadphonesIcon />,
      label: "音楽",
      colorClass: "bg-music",
    },
    {
      key: "coding",
      icon: <CodeIcon />,
      label: "コード",
      colorClass: "bg-code",
    },
  ];

  const popularTags = [
    "初心者歓迎",
    "夜描いた",
    "練習記録",
    "プロセス公開",
    "気まま投稿",
  ];

  return (
    <div className="search">
      <header className="search-header">
        <h1>tukuru</h1>
        <input
          type="text"
          className="search-input"
          placeholder="タグ・ジャンル・ユーザーを検索"
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
        />
      </header>

      <div className="container">
        <section className="genreSection">
          <h3>ジャンルで探す</h3>
          <div className="genreCircleButtons">
            {genres.map((genre) => (
              <button
                key={genre.key}
                className={`genreCircleBtn ${genre.colorClass}`}
              >
                <div className="genreIcon">{genre.icon}</div>
                <p className="genreText">{genre.label}</p>
              </button>
            ))}
          </div>
        </section>

        <section className="tagSection">
          <h3>注目のタグ</h3>
          <div className="tagList">
            {popularTags.map((tag) => (
              <span key={tag} className="tagChip">
                #{tag}
              </span>
            ))}
          </div>
        </section>
      </div>

      <footer>
        <div className="footerNav">
          <Link to="/" className="footerNavItem">
            <HomeIcon />
            <p className="footerNavItemText">ホーム</p>
          </Link>
          <Link to="/search" className="footerNavItem active">
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

export default Search;
