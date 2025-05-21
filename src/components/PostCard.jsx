// components/PostCard.jsx
import React from "react";
import { formatDistanceToNow } from "date-fns";
import { ja } from "date-fns/locale";
import "./PostCard.scss";
import { useNavigate } from "react-router-dom";
import CodeIcon from "@mui/icons-material/Code";
import BrushIcon from "@mui/icons-material/Brush";
import MusicNoteIcon from "@mui/icons-material/MusicNote";

const PostCard = ({
  post,
  currentUser,
  onImageClick,
  onReact,
  reactionTargetId,
  setReactionTargetId,
}) => {
  const navigate = useNavigate();
  const handleUserClick = () => {
    if (post.authorId) {
      navigate(`/user/${post.authorId}`);
    }
  };
  const userId = currentUser?.uid;

  const getCategoryClass = (category) => {
    switch (category) {
      case "code":
        return "code";
      case "illustration":
        return "illustration";
      case "music":
        return "music";
      default:
        return "other";
    }
  };

  const getCategoryIcon = (category) => {
    switch (category) {
      case "コード":
        return <CodeIcon />;
      case "イラスト":
        return <BrushIcon />;
      case "音楽":
        return <MusicNoteIcon />;
      default:
        return null;
    }
  };

  return (
    <div className="postItem">
      <div className="userInfo" onClick={handleUserClick}>
        <img
          src={post.author?.photoURL || "img/userIcon.png"}
          alt="User"
          className="userIcon"
        />
        <div className="userInfoRight">
          <div className="userTop">
            <p className="userName">{post.author?.name || "匿名ユーザー"}</p>
            <span className="userId">{post.author?.id}</span>
          </div>
          <div className="userMeta">
            <p>
              {post.createdAt
                ? formatDistanceToNow(post.createdAt.toDate(), {
                    addSuffix: true,
                    locale: ja,
                  })
                : "投稿中"}
            </p>
          </div>
        </div>
      </div>

      {post.imageUrl && (
        <img
          src={post.imageUrl}
          alt="投稿画像"
          className="postImage"
          onClick={() => onImageClick?.(post.imageUrl)}
        />
      )}

      <p className="postText">{post.text}</p>
      {post.tags && post.tags.length > 0 && (
        <div className="postTags">
          {post.tags
            .filter((tag) => tag && tag.trim() !== "")
            .map((tag, index) => (
              <span
                key={index}
                className="tag"
                onClick={() =>
                  navigate(`/search?tag=${encodeURIComponent(tag)}`)
                }
              >
                #{tag}
              </span>
            ))}
        </div>
      )}

      <div className="postReactions">
        {post.reactions &&
          Object.entries(post.reactions).map(([emoji, userList]) => {
            if (userList.length === 0) return null;
            const isMine = userList.includes(userId);
            return (
              <button
                key={emoji}
                className={`reactionItem ${
                  isMine ? "myReaction" : "otherReaction"
                }`}
                onClick={() => onReact?.(post.id, emoji)}
              >
                {emoji} {userList.length}
              </button>
            );
          })}
        <button
          className="reactionAdd"
          onClick={() => setReactionTargetId?.(post.id)}
        >
          ＋
        </button>
      </div>
    </div>
  );
};

export default PostCard;
