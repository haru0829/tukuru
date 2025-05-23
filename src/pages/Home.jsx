import "./Home.scss";
import { Link, useNavigate } from "react-router-dom";
import PostModal from "../components/PostModal";
import PostCard from "../components/PostCard";
import { db, auth } from "../firebase";
import {
  collection,
  query,
  orderBy,
  onSnapshot,
  doc,
  getDoc,
  getDocs,
  updateDoc,
} from "firebase/firestore";
import { useEffect, useState } from "react";
import SidebarNav from "../components/SidebarNav";

const Home = () => {
  const [isPostOpen, setIsPostOpen] = useState(false);
  const [posts, setPosts] = useState([]);
  const [selectedImage, setSelectedImage] = useState(null);
  const [reactionTargetId, setReactionTargetId] = useState(null);
  const [activeTab, setActiveTab] = useState("recommend");
  const [followingIds, setFollowingIds] = useState([]);

  const navigate = useNavigate();
  const currentUser = auth.currentUser;

  useEffect(() => {
    const fetchFollowing = async () => {
      if (!currentUser) return;
      const snap = await getDocs(
        collection(db, "users", currentUser.uid, "following")
      );
      const ids = snap.docs.map((doc) => doc.id);
      setFollowingIds(ids);
    };

    fetchFollowing();
  }, [currentUser]);

  useEffect(() => {
    const q = query(collection(db, "posts"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(q, async (snapshot) => {
      const postList = await Promise.all(
        snapshot.docs.map(async (docSnap) => {
          const postData = docSnap.data();
          const postId = docSnap.id;

          let authorData = {};
          try {
            const userDoc = await getDoc(doc(db, "users", postData.authorId));
            if (userDoc.exists()) {
              authorData = userDoc.data();
            }
          } catch (e) {
            console.error("ユーザーデータ取得失敗", e);
          }

          return {
            id: postId,
            ...postData,
            authorId: postData.authorId,
            tags: postData.tags || [],
            author: {
              name: authorData.name || postData.authorName || "unknown",
              id: authorData.id || "@unknown",
              photoURL: authorData.photoURL || postData.authorPhotoURL || "",
            },
          };
        })
      );

      const filteredPosts =
        activeTab === "following"
          ? postList.filter((post) => followingIds.includes(post.authorId))
          : postList;

      setPosts(filteredPosts);
    });

    return () => unsubscribe();
  }, [activeTab, followingIds]);

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
    setReactionTargetId(null);
  };

  return (
    <>
      <SidebarNav />

<div className="main-wrapper">
  
</div>
      <div className="home">
        <header>
          <h1>tukuru</h1>
        </header>
        <div className="home-tabs">
          <button
            className={activeTab === "recommend" ? "active" : ""}
            onClick={() => setActiveTab("recommend")}
          >
            みんなの投稿
          </button>
          <button
            className={activeTab === "following" ? "active" : ""}
            onClick={() => setActiveTab("following")}
          >
            応援中
          </button>
        </div>
        <div className="container">
          <button
            className="floating-post-button"
            onClick={() => {
              if (!auth.currentUser) {
                alert("ログインが必要です");
                navigate("/login");
                return;
              }
              setIsPostOpen(true);
            }}
          >
            ＋
          </button>
          <PostModal isOpen={isPostOpen} onClose={() => setIsPostOpen(false)} />

          {posts.map((post) => (
            <PostCard
              key={post.id}
              post={post}
              currentUser={currentUser}
              onImageClick={setSelectedImage}
              onReact={handleReactionSelect}
              reactionTargetId={reactionTargetId}
              setReactionTargetId={setReactionTargetId}
              tags={post.tags}
            />
          ))}
        </div>

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
              {["👍", "🎉", "🔥", "💡"].map((emoji) => (
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
    </>
  );
};

export default Home;
