import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import {
  collection,
  query,
  getDocs,
  orderBy,
  doc,
  getDoc,
  updateDoc,
} from "firebase/firestore";
import { db, auth } from "../firebase";
import PostCard from "../components/PostCard";
import "./Search.scss";
import HomeIcon from "@mui/icons-material/Home";
import SearchIcon from "@mui/icons-material/Search";
import PersonIcon from "@mui/icons-material/Person";
import SignalCellularAltIcon from "@mui/icons-material/SignalCellularAlt";
import { Link, useNavigate } from "react-router-dom";

const Search = () => {
  const [posts, setPosts] = useState([]);
  const [selectedImage, setSelectedImage] = useState(null);
  const [reactionTargetId, setReactionTargetId] = useState(null);
  const [keyword, setKeyword] = useState("");
  const [allPosts, setAllPosts] = useState([]);
  const [popularTags, setPopularTags] = useState([]);
  const [categoryTags, setCategoryTags] = useState({});
  const [trendingPosts, setTrendingPosts] = useState([]);
  const location = useLocation();
  const navigate = useNavigate();
  const currentUser = auth.currentUser;
  const queryParams = new URLSearchParams(location.search);
  const tag = queryParams.get("tag");

  useEffect(() => {
    const fetchPosts = async () => {
      const snapshot = await getDocs(
        query(collection(db, "posts"), orderBy("createdAt", "desc"))
      );

      const tagCounter = {};
      const catTagCounter = {};
      const postList = await Promise.all(
        snapshot.docs.map(async (docSnap) => {
          const data = docSnap.data();
          const postId = docSnap.id;

          let authorData = {};
          try {
            const userDoc = await getDoc(doc(db, "users", data.authorId));
            if (userDoc.exists()) {
              authorData = userDoc.data();
            }
          } catch (e) {
            console.error("著者情報の取得に失敗:", e);
          }

          if (Array.isArray(data.tags)) {
            data.tags = data.tags.filter(tag => tag && tag.trim() !== "");
            data.tags.forEach((tag) => {
              tagCounter[tag] = (tagCounter[tag] || 0) + 1;
              if (data.category) {
                if (!catTagCounter[data.category]) catTagCounter[data.category] = {};
                catTagCounter[data.category][tag] = (catTagCounter[data.category][tag] || 0) + 1;
              }
            });
          }

          return {
            id: postId,
            ...data,
            author: {
              name: authorData.name || "unknown",
              id: authorData.id || "@unknown",
              photoURL: authorData.photoURL || "",
            },
          };
        })
      );

      const sortedTags = Object.entries(tagCounter)
        .sort((a, b) => b[1] - a[1])
        .map(([tag]) => tag);

      const sortedCatTags = {};
      for (const cat in catTagCounter) {
        sortedCatTags[cat] = Object.entries(catTagCounter[cat])
          .sort((a, b) => b[1] - a[1])
          .slice(0, 5)
          .map(([tag]) => tag);
      }

      const sortedPosts = [...postList].sort(
        (a, b) =>
          Object.values(b.reactions || {}).flat().length -
          Object.values(a.reactions || {}).flat().length
      );

      setAllPosts(postList);
      setPopularTags(sortedTags.slice(0, 10));
      setCategoryTags(sortedCatTags);
      setTrendingPosts(sortedPosts.slice(0, 10));

      if (tag) {
        setKeyword(tag);
      }
    };
    fetchPosts();
  }, [location.search, tag]);

  useEffect(() => {
    const lower = keyword.trim().toLowerCase();
    if (lower === "") {
      setPosts([]);
      return;
    }
    const filtered = allPosts.filter(
      (post) =>
        post.text?.toLowerCase().includes(lower) ||
        post.tags?.some((t) => t.toLowerCase().includes(lower))
    );
    setPosts(filtered);
  }, [keyword, allPosts]);

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

  const isFiltered = keyword.trim() !== "";

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
        {isFiltered ? (
          <section className="section">
            <h2>検索結果</h2>
            {posts.length === 0 ? (
              <p>該当する投稿が見つかりませんでした。</p>
            ) : (
              posts.map((post) => (
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
            )}
          </section>
        ) : (
          <>
            <section className="section">
              <h2>🏷 今話題のタグ</h2>
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
              <h2>💬 カテゴリ別人気タグ</h2>
              {Object.entries(categoryTags).map(([cat, tags]) => (
                <div key={cat} className="topic-group">
                  <h3 className="topic-title">{cat}</h3>
                  <div className="topic-tags">
                    {tags.map((tag) => (
                      <span
                        key={tag}
                        className="tag-chip"
                        onClick={() => setKeyword(tag)}
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </section>

            <section className="section">
              <h2>📈 トレンドの投稿</h2>
              {trendingPosts.map((post) => (
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
