import React, { useState, useEffect, useRef } from "react";
import { useLocation, Link, useNavigate } from "react-router-dom";
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

  const scrollRefs = useRef({});

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
            data.tags = data.tags.filter((tag) => tag && tag.trim() !== "");
            data.tags.forEach((tag) => {
              tagCounter[tag] = (tagCounter[tag] || 0) + 1;
              if (data.category) {
                if (!catTagCounter[data.category])
                  catTagCounter[data.category] = {};
                catTagCounter[data.category][tag] =
                  (catTagCounter[data.category][tag] || 0) + 1;
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
    Object.values(scrollRefs.current).forEach((el) => {
      if (!el) return;

      let isDown = false;
      let startX = 0;
      let scrollLeft = 0;

      const onMouseDown = (e) => {
        isDown = true;
        startX = e.pageX;
        scrollLeft = el.scrollLeft;
        el.classList.add("dragging");
      };

      const onMouseMove = (e) => {
        if (!isDown) return;
        const x = e.pageX;
        const walk = (x - startX) * -1;
        el.scrollLeft = scrollLeft + walk;
      };

      const onMouseUp = () => {
        isDown = false;
        el.classList.remove("dragging");
      };

      el.addEventListener("mousedown", onMouseDown);
      el.addEventListener("mousemove", onMouseMove);
      el.addEventListener("mouseup", onMouseUp);
      el.addEventListener("mouseleave", onMouseUp);
    });
  }, []);

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

    const updateState = (stateSetter) => {
      stateSetter((prev) =>
        prev.map((p) => {
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
    };

    updateState(setPosts);
    updateState(setTrendingPosts);
    updateState(setAllPosts);

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
              <h2>今話題のタグ</h2>
              <ol className="x-tag-list">
                {popularTags.map((tag, index) => (
                  <li
                    key={tag}
                    className="x-tag-item"
                    onClick={() => setKeyword(tag)}
                  >
                    <p className="x-tag-rank">
                      {index + 1}. <span className="x-tag-name">#{tag}</span>
                    </p>
                    <p className="x-tag-meta">投稿数: 不明</p>
                  </li>
                ))}
              </ol>
            </section>

            <section className="section">
              {Object.entries(categoryTags).map(([cat, tags]) => (
                <div key={cat} className="x-category-block">
                  <h3 className={`x-category-title ${cat.toLowerCase()}`}>
                    {cat}
                  </h3>
                  <div
                    className="x-category-scroll"
                    ref={(el) => (scrollRefs.current[cat] = el)}
                  >
                    {tags.map((tag, index) => (
                      <div
                        key={tag}
                        className="x-tag-card"
                        onClick={() => setKeyword(tag)}
                      >
                        <p className="x-tag-card-rank">{index + 1}.</p>
                        <p className="x-tag-card-name">#{tag}</p>
                        <p className="x-tag-card-meta">人気タグ</p>
                      </div>
                    ))}
                  </div>
                  <p className="scroll-hint">横にスクロールできます →</p>
                </div>
              ))}
            </section>

            <section className="section">
              <h2>トレンドの投稿</h2>
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
                onClick={() => {
                  handleReactionSelect(reactionTargetId, emoji);
                }}
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
