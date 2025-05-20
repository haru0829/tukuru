// Search.jsx
import React, { useState, useEffect } from "react";
import "./Search.scss";
import HomeIcon from "@mui/icons-material/Home";
import SearchIcon from "@mui/icons-material/Search";
import PersonIcon from "@mui/icons-material/Person";
import SignalCellularAltIcon from "@mui/icons-material/SignalCellularAlt";
import { Link, useNavigate } from "react-router-dom";
import {
  collection,
  getDocs,
  doc,
  getDoc,
  updateDoc,
} from "firebase/firestore";
import { db, auth } from "../firebase";
import PostCard from "../components/PostCard";

const Search = () => {
  const [keyword, setKeyword] = useState("");
  const [posts, setPosts] = useState([]);
  const [filteredPosts, setFilteredPosts] = useState([]);
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [showAllUsers, setShowAllUsers] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [reactionTargetId, setReactionTargetId] = useState(null);
  const currentUser = auth.currentUser;
  const navigate = useNavigate();

  const popularTags = [
    "初心者歓迎",
    "夜描いた",
    "練習記録",
    "プロセス公開",
    "気まま投稿",
  ];
  const deepTopics = {
    music: [
      "カッティング練習",
      "ジャズマスター",
      "マスロック",
      "Cubase",
      "MIXテクニック",
    ],
    coding: ["React Hooks", "Firebase連携", "Next.js", "UI/UX設計", "状態管理"],
    illustration: ["厚塗り", "色収差", "資料探し", "ポージング", "ブラシ設定"],
  };

  useEffect(() => {
    const fetchPosts = async () => {
      const snapshot = await getDocs(collection(db, "posts"));
      const postList = await Promise.all(
        snapshot.docs.map(async (docSnap) => {
          const data = docSnap.data();
          let authorData = {};
          try {
            const userDoc = await getDoc(doc(db, "users", data.authorId));
            if (userDoc.exists()) {
              authorData = userDoc.data();
            }
          } catch (e) {
            console.error("ユーザー情報の取得に失敗", e);
          }

          return {
            id: docSnap.id,
            ...data,
            author: {
              name: authorData.name || data.authorName || "unknown",
              id: authorData.id || "@unknown",
              photoURL: authorData.photoURL || data.authorPhotoURL || "",
            },
          };
        })
      );
      setPosts(postList);
    };

    const fetchUsers = async () => {
      const snapshot = await getDocs(collection(db, "users"));
      const list = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setUsers(list);
    };
    fetchPosts();
    fetchUsers();
  }, []);

  useEffect(() => {
    const lower = keyword.toLowerCase();

    const filteredP = posts.filter((post) => {
      return (
        post.text?.toLowerCase().includes(lower) ||
        post.author?.name?.toLowerCase().includes(lower) ||
        post.author?.id?.toLowerCase().includes(lower) ||
        post.tags?.some((tag) => tag.toLowerCase().includes(lower))
      );
    });

    const matchedUsersMap = new Map();
    posts.forEach((post) => {
      if (post.authorName?.toLowerCase().includes(lower)) {
        matchedUsersMap.set(post.authorId, {
          id: post.authorId,
          authorName: post.authorName,
          photoURL: post.authorPhotoURL,
        });
      }
    });
    
    const filteredU = users.filter((user) => {
      return (
        user.name?.toLowerCase().includes(lower) ||
        user.id?.toLowerCase().includes(lower)
      );
    });

    setFilteredPosts(filteredP);
    setFilteredUsers(filteredU);
  }, [keyword, posts]);

  const handleReactionSelect = async (postId, emoji) => {
    const user = auth.currentUser;
    if (!user) return navigate("/login");

    const postRef = doc(db, "posts", postId);
    const postSnap = await getDoc(postRef);
    const data = postSnap.data();

    const prev = data.reactions?.[emoji] || [];
    const alreadyReacted = prev.includes(user.uid);

    const newReactions = {
      ...data.reactions,
      [emoji]: alreadyReacted
        ? prev.filter((uid) => uid !== user.uid)
        : [...prev, user.uid],
    };

    await updateDoc(postRef, { reactions: newReactions });

    const updatedSnap = await getDoc(postRef);
    const updatedData = updatedSnap.data();
    setPosts((prevPosts) =>
      prevPosts.map((p) =>
        p.id === postId ? { ...p, reactions: updatedData.reactions } : p
      )
    );
    setReactionTargetId(null);
  };

  return (
    <div className="search">
      <header className="search-header">
        <h1>tukuru</h1>
        <input
          type="text"
          className="search-input"
          placeholder="作品、タグ、ユーザー、話題を検索"
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
        />
      </header>

      <div className="container">
        {keyword ? (
          <>
            {filteredUsers.length > 0 && (
              <section className="section">
                <h2>ユーザー</h2>
                <div className="user-list">
                  {(showAllUsers
                    ? filteredUsers
                    : filteredUsers.slice(0, 3)
                  ).map((user) => (
                    <div key={user.id} className="user-card">
                      <img
                        src={user.photoURL || "img/userIcon.png"}
                        alt="user"
                        className="user-icon"
                      />
                      <p>{user.authorName}</p>
                    </div>
                  ))}
                  {filteredUsers.length > 3 && (
                    <button
                      className="show-more"
                      onClick={() => setShowAllUsers(!showAllUsers)}
                    >
                      {showAllUsers ? "閉じる" : "すべて見る"}
                    </button>
                  )}
                </div>
              </section>
            )}

            {filteredPosts.length > 0 ? (
              filteredPosts.map((post) => (
                <PostCard
                  key={post.id}
                  post={post}
                  currentUser={currentUser}
                  onImageClick={setSelectedImage}
                  onReact={handleReactionSelect}
                  reactionTargetId={reactionTargetId}
                  setReactionTargetId={setReactionTargetId}
                />
              ))
            ) : (
              <p className="noResults">該当する投稿は見つかりませんでした。</p>
            )}
          </>
        ) : (
          <>
            <section className="section">
              <h2>🏷 注目のタグ</h2>
              <div className="tag-list">
                {popularTags.map((tag) => (
                  <span
                    key={tag}
                    className="tag-chip"
                    onClick={() => setKeyword(tag)}
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            </section>

            <section className="section">
              <h2>💬 話題のキーワード</h2>
              {Object.entries(deepTopics).map(([genre, words]) => (
                <div key={genre} className="topic-group">
                  <h3 className="topic-title">{genre}</h3>
                  <div className="topic-tags">
                    {words.map((word) => (
                      <span
                        key={word}
                        className="tag-chip"
                        onClick={() => setKeyword(word)}
                      >
                        {word}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </section>
            <section className="section">
              {posts.slice(0, 5).map((post) => (
                <PostCard
                  key={post.id}
                  post={post}
                  currentUser={currentUser}
                  onImageClick={setSelectedImage}
                  onReact={handleReactionSelect}
                  reactionTargetId={reactionTargetId}
                  setReactionTargetId={setReactionTargetId}
                />
              ))}
            </section>
          </>
        )}
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

      {selectedImage && (
        <div className="imageModal" onClick={() => setSelectedImage(null)}>
          <img src={selectedImage} alt="拡大画像" />
        </div>
      )}

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
    </div>
  );
};

export default Search;
