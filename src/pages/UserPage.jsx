import React, { useEffect, useState } from "react";
import "./Mypage.scss";
import EditIcon from "@mui/icons-material/Edit";
import { Link, useNavigate, useParams } from "react-router-dom";
import HomeIcon from "@mui/icons-material/Home";
import SearchIcon from "@mui/icons-material/Search";
import PersonIcon from "@mui/icons-material/Person";
import SignalCellularAltIcon from "@mui/icons-material/SignalCellularAlt";
import CodeIcon from "@mui/icons-material/Code";
import BrushIcon from "@mui/icons-material/Brush";
import MusicNoteIcon from "@mui/icons-material/MusicNote";
import MoreHorizIcon from "@mui/icons-material/MoreHoriz";
import { auth, db } from "../firebase";
import {
  doc,
  getDoc,
  collection,
  query,
  where,
  getDocs,
  setDoc,
  deleteDoc,
} from "firebase/firestore";
import PostCard from "../components/PostCard";

const UserPage = () => {
  const [userData, setUserData] = useState(null);
  const [userPosts, setUserPosts] = useState([]);
  const [isFollowing, setIsFollowing] = useState(false);

  const currentUser = auth.currentUser;
  const navigate = useNavigate();
  const { uid } = useParams();

  // ユーザーデータ取得
  useEffect(() => {
    if (!uid) {
      navigate("/");
      return;
    }

    const fetchUser = async () => {
      const userRef = doc(db, "users", uid);
      const userSnap = await getDoc(userRef);
      if (userSnap.exists()) {
        setUserData(userSnap.data());
      }
    };

    fetchUser();
  }, [uid, navigate]);

  // 投稿取得
  useEffect(() => {
    if (!userData) return;

    const fetchUserPosts = async () => {
      const q = query(collection(db, "posts"), where("authorId", "==", uid));
      const snap = await getDocs(q);
      const posts = snap.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        author: {
          name: userData.name,
          id: userData.id,
          photoURL: userData.photoURL,
        },
      }));
      setUserPosts(posts);
    };

    fetchUserPosts();
  }, [userData, uid]);

  // 応援状態をチェック
  useEffect(() => {
    const checkFollowStatus = async () => {
      if (!currentUser || !uid || currentUser.uid === uid) return;
      const followDocRef = doc(db, "users", currentUser.uid, "following", uid);
      const docSnap = await getDoc(followDocRef);
      setIsFollowing(docSnap.exists());
    };
    checkFollowStatus();
  }, [uid, currentUser]);

  const toggleFollow = async () => {
    if (!currentUser || !uid || currentUser.uid === uid) return;

    const followDocRef = doc(db, "users", currentUser.uid, "following", uid);

    try {
      if (isFollowing) {
        await deleteDoc(followDocRef);
        setIsFollowing(false);
      } else {
        await setDoc(followDocRef, {
          followedAt: new Date(),
        });
        setIsFollowing(true);
      }
    } catch (error) {
      console.error("フォロー処理中にエラーが発生しました", error);
    }
  };

  if (!userData) {
    return (
      <div className="mypage">
        <p style={{ textAlign: "center", marginTop: "2rem" }}>読み込み中...</p>
      </div>
    );
  }

  const CATEGORIES = [
    { label: "コード", key: "code", class: "code", icon: <CodeIcon /> },
    {
      label: "イラスト",
      key: "illustration",
      class: "illustration",
      icon: <BrushIcon />,
    },
    { label: "音楽", key: "music", class: "music", icon: <MusicNoteIcon /> },
  ];
  const categoryCounts = CATEGORIES.map((cat) => {
    const count = userPosts.filter((p) => p.category === cat.key).length;
    return { ...cat, count };
  }).sort((a, b) => b.count - a.count);

  return (
    <div className="mypage2">
      <header className="mypage-header">
        <h1 className="logo">tukuru</h1>
      </header>

      <div className="profile-section">
        <div className="banner">
          {userData.bannerURL ? (
            <img
              className="banner-image"
              src={userData.bannerURL}
              alt="バナー画像"
            />
          ) : (
            <div className="banner-placeholder"></div>
          )}
        </div>

        <div className="icon-wrapper">
          <img
            className="user-icon"
            src={userData.photoURL || "img/userIcon.png"}
            alt="アイコン"
          />
        </div>

        <div className="user-info">
          <div className="name-row">
            <div className="nameflex">
              <p className="username">{userData.name}</p>
              {currentUser && currentUser.uid !== uid && (
                <button
                  className={`follow-button ${isFollowing ? "following" : ""}`}
                  onClick={toggleFollow}
                >
                  {isFollowing ? "応援中" : "応援する"}
                </button>
              )}
            </div>

            <p className="user-id">{userData.id}</p>

            <div className="days">
              {categoryCounts.map((cat) => (
                <div key={cat.key} className={`day-badge ${cat.class}`}>
                  {cat.icon}
                  <span>{cat.count}</span>
                </div>
              ))}
            </div>
          </div>

          <p className="intro">{userData.bio}</p>
        </div>
      </div>

      <div className="post-section">
        {userPosts.length === 0 ? (
          <p style={{ textAlign: "center", marginTop: "2rem" }}>
            投稿がまだありません。
          </p>
        ) : (
          userPosts.map((post, index) => (
            <PostCard
              key={post.id}
              post={{ ...post, dayNumber: index + 1 }}
              currentUser={currentUser}
              onImageClick={() => {}}
              onReact={() => {}}
              reactionTargetId={null}
              setReactionTargetId={() => {}}
            />
          ))
        )}
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
          <Link to="/record" className="footerNavItem">
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

export default UserPage;
