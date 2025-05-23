import React from "react";
import { Link, useLocation } from "react-router-dom";
import HomeIcon from "@mui/icons-material/Home";
import SearchIcon from "@mui/icons-material/Search";
import SignalCellularAltIcon from "@mui/icons-material/SignalCellularAlt";
import PersonIcon from "@mui/icons-material/Person";
import "./SidebarNav.scss";

const SidebarNav = () => {
  const location = useLocation();
  const isActive = (path) => location.pathname === path;

  return (
    <>
      {/* PC: 左サイドバー */}
      <nav className="sidebar-nav">
        <h1 className="logo">tukuru</h1>
        <ul>
          <li>
            <Link to="/" className={isActive("/") ? "active" : ""}>
              <HomeIcon /> ホーム
            </Link>
          </li>
          <li>
            <Link to="/search" className={isActive("/search") ? "active" : ""}>
              <SearchIcon /> 検索
            </Link>
          </li>
          <li>
            <Link to="/record" className={isActive("/record") ? "active" : ""}>
              <SignalCellularAltIcon /> 記録
            </Link>
          </li>
          <li>
            <Link to="/mypage" className={isActive("/mypage") ? "active" : ""}>
              <PersonIcon /> マイページ
            </Link>
          </li>
        </ul>
      </nav>

      {/* モバイル用：フッター */}
      <footer className="mobile-footer">
        <div className="footerNav">
          <Link
            to="/"
            className={`footerNavItem ${isActive("/") ? "active" : ""}`}
          >
            <HomeIcon />
            <p className="footerNavItemText">ホーム</p>
          </Link>
          <Link
            to="/search"
            className={`footerNavItem ${isActive("/search") ? "active" : ""}`}
          >
            <SearchIcon />
            <p className="footerNavItemText">検索</p>
          </Link>
          <Link
            to="/record"
            className={`footerNavItem ${isActive("/record") ? "active" : ""}`}
          >
            <SignalCellularAltIcon />
            <p className="footerNavItemText">記録</p>
          </Link>
          <Link
            to="/mypage"
            className={`footerNavItem ${isActive("/mypage") ? "active" : ""}`}
          >
            <PersonIcon />
            <p className="footerNavItemText">マイページ</p>
          </Link>
        </div>
      </footer>
    </>
  );
};

export default SidebarNav;
