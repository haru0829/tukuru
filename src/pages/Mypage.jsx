import React, { useEffect, useState } from "react";
import "./Mypage.scss";
import EditIcon from "@mui/icons-material/Edit";
import { Link, useNavigate } from "react-router-dom";
import HomeIcon from "@mui/icons-material/Home";
import SearchIcon from "@mui/icons-material/Search";
import PersonIcon from "@mui/icons-material/Person";
import SignalCellularAltIcon from "@mui/icons-material/SignalCellularAlt";
import ModeEditIcon from "@mui/icons-material/ModeEdit";
import PhotoCameraIcon from "@mui/icons-material/PhotoCamera";
import VideocamIcon from "@mui/icons-material/Videocam";
import PaletteIcon from "@mui/icons-material/Palette";
import MusicNoteIcon from "@mui/icons-material/MusicNote";
import { auth, db } from "../firebase";
import {
  doc,
  getDoc,
  collection,
  query,
  where,
  getDocs,
  updateDoc,
} from "firebase/firestore";
import PostCard from "../components/PostCard";
import SidebarNav from "../components/SidebarNav";
import { deleteDoc } from "firebase/firestore"; // もし未インポートなら追加
import PostModal from "../components/PostModal";

const Mypage = () => {
  const [userData, setUserData] = useState(null);
  const [userPosts, setUserPosts] = useState([]);
  const [reactionTargetId, setReactionTargetId] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [postToEdit, setPostToEdit] = useState(null);

  const currentUser = auth.currentUser;
  const navigate = useNavigate();

  useEffect(() => {
    if (!currentUser) {
      navigate("/login");
      return;
    }

    const fetchUser = async () => {
      const userRef = doc(db, "users", currentUser.uid);
      const userSnap = await getDoc(userRef);
      if (userSnap.exists()) {
        setUserData(userSnap.data());
      }
    };

    fetchUser();
  }, [currentUser, navigate]);
  const fetchUserPosts = async () => {
    if (!userData || !currentUser) return;

    const q = query(
      collection(db, "posts"),
      where("authorId", "==", currentUser.uid)
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

  useEffect(() => {
    if (!userData) return;
    fetchUserPosts();
  }, [userData]);

  useEffect(() => {
    if (!userData) return;
    fetchUserPosts();
  }, [userData]);

  if (!userData) {
    return (
      <div className="mypage">
        <p style={{ textAlign: "center", marginTop: "2rem" }}>読み込み中...</p>
      </div>
    );
  }

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
      icon: <ModeEditIcon />,
    },
  ];

  const categoryCounts = CATEGORIES.map((cat) => {
    const count = userPosts.filter((p) => p.category === cat.key).length;
    return { ...cat, count };
  }).sort((a, b) => b.count - a.count);

  const handleEdit = (post) => {
    setPostToEdit(post);
    setEditModalOpen(true);
  };

  const handleDelete = async (postId) => {
    if (!window.confirm("この投稿を削除しますか？")) return;
    try {
      await deleteDoc(doc(db, "posts", postId));
      setUserPosts((prev) => prev.filter((p) => p.id !== postId));
    } catch (err) {
      console.error("削除エラー:", err);
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
          <button
            className="edit-button"
            onClick={() => navigate("/edit-profile")}
          >
            <EditIcon />
          </button>
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
            <p className="username">{userData.name}</p>
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
              onImageClick={setSelectedImage}
              onReact={handleReactionSelect}
              reactionTargetId={reactionTargetId}
              setReactionTargetId={setReactionTargetId}
              onEdit={handleEdit}
              onDelete={handleDelete}
              showMenu={true} // ← これで三点リーダーが表示される
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
          <Link to="/" className="footerNavItem">
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
          <Link to="/mypage" className="footerNavItem active">
            <PersonIcon />
            <p className="footerNavItemText">マイページ</p>
          </Link>
        </div>
      </footer>
      <PostModal
        isOpen={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        isEdit={true}
        existingPost={postToEdit}
        onSuccess={fetchUserPosts} // 再読み込みなど
      />
    </div>
  );
};

export default Mypage;
