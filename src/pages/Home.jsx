// Home.jsx
import "./Home.scss";
import MoreHorizIcon from "@mui/icons-material/MoreHoriz";
import HomeIcon from "@mui/icons-material/Home";
import SearchIcon from "@mui/icons-material/Search";
import PersonIcon from "@mui/icons-material/Person";
import SignalCellularAltIcon from "@mui/icons-material/SignalCellularAlt";
import { Link, useNavigate } from "react-router-dom";
import PostModal from "../components/PostModal";
import { db, auth } from "../firebase";
import {
  collection,
  query,
  orderBy,
  onSnapshot,
  doc,
  getDoc,
  updateDoc,
} from "firebase/firestore";
import { useEffect, useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { ja } from "date-fns/locale";

const Home = () => {
  const [isPostOpen, setIsPostOpen] = useState(false);
  const [posts, setPosts] = useState([]);
  const [selectedImage, setSelectedImage] = useState(null);
  const [reactionTargetId, setReactionTargetId] = useState(null);
  const navigate = useNavigate();
  const currentUser = auth.currentUser;

  useEffect(() => {
    const q = query(collection(db, "posts"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const postList = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setPosts(postList);
    });
    return () => unsubscribe();
  }, []);

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
      [emoji]: alreadyReacted ? prev.filter((uid) => uid !== user.uid) : [...prev, user.uid],
    };

    await updateDoc(postRef, { reactions: newReactions });
    setReactionTargetId(null);
  };

  return (
    <div className="home">
      <header><h1>tukuru</h1></header>

      <div className="container">
        <button className="floating-post-button" onClick={() => setIsPostOpen(true)}>＋</button>
        <PostModal isOpen={isPostOpen} onClose={() => setIsPostOpen(false)} />

        {posts.map((post) => {
          const userId = currentUser?.uid;
          return (
            <div className="postItem" key={post.id}>
              <div className="userInfo">
                <img src={post.authorPhotoURL || "img/userIcon.png"} alt="User" className="userIcon" />
                <div className="userInfoRight">
                  <div className="userTop">
                    <p>{post.authorName || "匿名ユーザー"}</p>
                  </div>
                  <div className="userMeta">
                    <div className="icon"><p>{post.category}</p></div>
                    <p>{post.createdAt ? formatDistanceToNow(post.createdAt.toDate(), { addSuffix: true, locale: ja }) : "投稿中"}</p>
                  </div>
                </div>
              </div>
              {post.imageUrl && <img src={post.imageUrl} alt="投稿画像" className="postImage" onClick={() => setSelectedImage(post.imageUrl)} />}
              <p className="postText">{post.text}</p>
              <div className="postReactions">
                {post.reactions && Object.entries(post.reactions).map(([emoji, userList]) => {
                  if (userList.length === 0) return null;
                  const isMine = userList.includes(userId);
                  return (
                    <button
                      key={emoji}
                      className={`reactionItem ${isMine ? "myReaction" : "otherReaction"}`}
                      onClick={() => handleReactionSelect(post.id, emoji)}
                    >
                      {emoji} {userList.length}
                    </button>
                  );
                })}
                <button className="reactionAdd" onClick={() => setReactionTargetId(post.id)}>＋</button>
              </div>
            </div>
          );
        })}
      </div>

      <footer>
        <div className="footerNav">
          <Link to="/" className="footerNavItem active"><HomeIcon /><p className="footerNavItemText">ホーム</p></Link>
          <Link to="/search" className="footerNavItem"><SearchIcon /><p className="footerNavItemText">検索</p></Link>
          <Link to="/record" className="footerNavItem"><SignalCellularAltIcon /><p className="footerNavItemText">記録</p></Link>
          <Link to="/mypage" className="footerNavItem"><PersonIcon /><p className="footerNavItemText">マイページ</p></Link>
        </div>
      </footer>

      {selectedImage && (
        <div className="imageModal" onClick={() => setSelectedImage(null)}>
          <img src={selectedImage} alt="拡大画像" />
        </div>
      )}

      {reactionTargetId && (
        <div className="reactionModalOverlay" onClick={() => setReactionTargetId(null)}>
          <div className="reactionModalFloating" onClick={(e) => e.stopPropagation()}>
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

export default Home;
