// components/PostCard.jsx
import React from "react";
import { formatDistanceToNow } from "date-fns";
import { ja } from "date-fns/locale";
import "./PostCard.scss";

const PostCard = ({
  post,
  currentUser,
  onImageClick,
  onReact,
  reactionTargetId,
  setReactionTargetId,
}) => {
  const userId = currentUser?.uid;

  return (
    <div className="postItem">
      <div className="userInfo">
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
            <div className="icon">
              <p>{post.category}</p>
            </div>
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
