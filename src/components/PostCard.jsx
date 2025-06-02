import { formatDistanceToNow, isValid } from "date-fns";
import { ja } from "date-fns/locale";
import "./PostCard.scss";
import { useNavigate } from "react-router-dom";
import CodeIcon from "@mui/icons-material/Code";
import BrushIcon from "@mui/icons-material/Brush";
import MusicNoteIcon from "@mui/icons-material/MusicNote";
import MoreHorizIcon from "@mui/icons-material/MoreHoriz";
import React, { useState } from "react";

const PostCard = ({
  post,
  currentUser,
  onImageClick,
  onReact,
  reactionTargetId,
  setReactionTargetId,
  onEdit,
  onDelete,
  showMenu = false,
}) => {
  const navigate = useNavigate();
  const handleUserClick = () => {
    if (post.author?.id) {
      const accountId = post.author.id.replace(/^@/, "");
      navigate(`/user/@${accountId}`);
    }
  };

  const userId = currentUser?.uid;
  const [menuOpen, setMenuOpen] = useState(false);
  const isMyPost = currentUser?.uid === post.authorId;

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

  const mediaUrl = post.mediaUrl || post.imageUrl;
  const mediaType = post.mediaType || "image";

  // ✅ createdAt の安全な変換
  const rawDate = post.createdAt;
  const createdAt =
    rawDate instanceof Date
      ? rawDate
      : typeof rawDate?.toDate === "function"
      ? rawDate.toDate()
      : typeof rawDate === "string" || typeof rawDate === "number"
      ? new Date(rawDate)
      : null;

  const displayTime =
    createdAt && isValid(createdAt)
      ? formatDistanceToNow(createdAt, {
          addSuffix: true,
          locale: ja,
        })
      : "日時不明";

  return (
    <div className="postItem">
      <div className="postHeader">
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
              <p>{displayTime}</p>
            </div>
          </div>
        </div>
        {isMyPost && showMenu && (
          <div className="postMenuWrapper">
            <MoreHorizIcon
              className="menuIcon"
              onClick={() => setMenuOpen((prev) => !prev)}
            />
            {menuOpen && (
              <div className="postMenu">
                <button onClick={() => onEdit?.(post)}>編集</button>
                <button onClick={() => onDelete?.(post.id)}>削除</button>
              </div>
            )}
          </div>
        )}
      </div>

      {mediaUrl &&
        (mediaType === "video" ? (
          <video
            src={mediaUrl}
            controls
            className="postMedia"
            style={{ width: "100%", borderRadius: "12px", marginTop: "12px" }}
          />
        ) : (
          <img
            src={mediaUrl}
            alt="投稿画像"
            className="postImage"
            onClick={() => onImageClick?.(mediaUrl)}
          />
        ))}

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
