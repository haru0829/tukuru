import React, { useEffect, useState } from "react";
import "./Mypage.scss";
import { Link, useNavigate, useParams } from "react-router-dom";
import HomeIcon from "@mui/icons-material/Home";
import SearchIcon from "@mui/icons-material/Search";
import PersonIcon from "@mui/icons-material/Person";
import SignalCellularAltIcon from "@mui/icons-material/SignalCellularAlt";
import BrushIcon from "@mui/icons-material/Brush";
import PhotoCameraIcon from "@mui/icons-material/PhotoCamera";
import VideocamIcon from "@mui/icons-material/Videocam";
import PaletteIcon from "@mui/icons-material/Palette";
import MusicNoteIcon from "@mui/icons-material/MusicNote";
import { auth, db } from "../firebase";
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  getDoc,
  setDoc,
  deleteDoc,
  updateDoc,
} from "firebase/firestore";
import PostCard from "../components/PostCard";
import SidebarNav from "../components/SidebarNav";

const UserPage = () => {
  const [userData, setUserData] = useState(null);
  const [userPosts, setUserPosts] = useState([]);
  const [userDocId, setUserDocId] = useState(null);
  const [isFollowing, setIsFollowing] = useState(false);
  const [reactionTargetId, setReactionTargetId] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);

  const currentUser = auth.currentUser;
  const navigate = useNavigate();
  const { uid } = useParams();
  const cleanUid = uid.replace(/^@/, "");

  useEffect(() => {
    if (uid && !uid.startsWith("@")) {
      navigate(`/user/@${uid}`, { replace: true });
    }
  }, [uid, navigate]);

  useEffect(() => {
    if (!cleanUid) return;
    const fetchUser = async () => {
      const q = query(
        collection(db, "users"),
        where("id", "==", `@${cleanUid}`)
      );
      const snap = await getDocs(q);
      if (!snap.empty) {
        setUserData(snap.docs[0].data());
        setUserDocId(snap.docs[0].id);
      } else {
        setUserData(null);
      }
    };
    fetchUser();
  }, [cleanUid]);

  useEffect(() => {
    if (!userDocId || !userData) return;
    const fetchUserPosts = async () => {
      const q = query(
        collection(db, "posts"),
        where("authorId", "==", userDocId)
      );
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
  }, [userDocId, userData]);

  useEffect(() => {
    const checkFollowStatus = async () => {
      if (!currentUser || !userDocId || currentUser.uid === userDocId) return;
      const followDocRef = doc(
        db,
        "users",
        currentUser.uid,
        "following",
        userDocId
      );
      const docSnap = await getDoc(followDocRef);
      setIsFollowing(docSnap.exists());
    };
    checkFollowStatus();
  }, [userDocId, currentUser]);

  const toggleFollow = async () => {
    if (!currentUser || !userDocId || currentUser.uid === userDocId) return;
    const followDocRef = doc(
      db,
      "users",
      currentUser.uid,
      "following",
      userDocId
    );
    try {
      if (isFollowing) {
        await deleteDoc(followDocRef);
        setIsFollowing(false);
      } else {
        await setDoc(followDocRef, { followedAt: new Date() });
        setIsFollowing(true);
      }
    } catch (err) {
      console.error("フォローエラー:", err);
    }
  };

  const handleReactionSelect = async (postId, emoji) => {
    const user = auth.currentUser;
    if (!user) return navigate("/login");

    setUserPosts((prevPosts) =>
      prevPosts.map((p) => {
        if (p.id !== postId) return p;
        const prevList = p.reactions?.[emoji] || [];
        const already = prevList.includes(user.uid);
        const newReactions = {
          ...p.reactions,
          [emoji]: already
            ? prevList.filter((uid) => uid !== user.uid)
            : [...prevList, user.uid],
        };
        return { ...p, reactions: newReactions };
      })
    );

    try {
      const postRef = doc(db, "posts", postId);
      const snap = await getDoc(postRef);
      const data = snap.data();
      const prev = data.reactions?.[emoji] || [];
      const already = prev.includes(user.uid);
      const newReactions = {
        ...data.reactions,
        [emoji]: already
          ? prev.filter((uid) => uid !== user.uid)
          : [...prev, user.uid],
      };
      await updateDoc(postRef, { reactions: newReactions });
    } catch (err) {
      console.error("リアクション更新エラー:", err);
    }

    setReactionTargetId(null);
  };

  const CATEGORIES = [
    {
      label: "イラスト",
      key: "illustration",
      class: "illustration",
      icon: <PaletteIcon />,
    },
    {
      label: "写真",
      key: "picture",
      class: "picture",
      icon: <PhotoCameraIcon />,
    },
    { label: "映像", key: "video", class: "video", icon: <VideocamIcon /> },
    { label: "音楽", key: "music", class: "music", icon: <MusicNoteIcon /> },
    {
      label: "文芸",
      key: "literature",
      class: "literature",
      icon: <BrushIcon />,
    },
  ];
  const categoryCounts = CATEGORIES.map((cat) => {
    const count = userPosts.filter((p) => p.category === cat.key).length;
    return { ...cat, count };
  }).sort((a, b) => b.count - a.count);

  if (!userData) {
    return (
      <div className="mypage">
        <p style={{ textAlign: "center", marginTop: "2rem" }}>読み込み中...</p>
      </div>
    );
  }

  return (
    <div className="mypage2">
      <SidebarNav />
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
              onClick={() => setSelectedImage(userData.bannerURL)}
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
            onClick={() => setSelectedImage(userData.photoURL)}
          />
        </div>

        <div className="user-info">
          <div className="name-row">
            <div className="nameflex">
              <p className="username">{userData.name}</p>
              {currentUser && currentUser.uid !== userDocId && (
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
              {categoryCounts
                .filter((cat) => cat.count > 0)
                .map((cat) => (
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
              onImageClick={setSelectedImage} // ← これが重要
              onReact={handleReactionSelect}
              reactionTargetId={reactionTargetId}
              setReactionTargetId={setReactionTargetId}
            />
          ))
        )}
      </div>

      {reactionTargetId && (
        <div
          className="reactionModalOverlay"
          onClick={() => setReactionTargetId(null)}
        >
          <div
            className="reactionModalFloating"
            onClick={(e) => e.stopPropagation()}
          >
            {["😊", "👍", "🎉", "🔥", "💡"].map((emoji) => (
              <button
                key={emoji}
                className="reactionEmojiBtn"
                onClick={() => handleReactionSelect(reactionTargetId, emoji)}
              >
                {emoji}
              </button>
            ))}
          </div>
        </div>
      )}
      {selectedImage && (
        <div className="imageModal" onClick={() => setSelectedImage(null)}>
          <img src={selectedImage} alt="拡大画像" />
        </div>
      )}

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
