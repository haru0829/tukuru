import React from "react";
import "./PostCard.scss"; // スタイルがまだなければ空でもOK

const PostCard = ({ user = "User", dayCount = 1, location = "不明", timeAgo = "1時間前", text = "", imageUrl = "img/programming.png" }) => {
  return (
    <div className="postItem">
      <div className="userInfo">
        <img src="img/userIcon.png" alt="user icon" />
        <div className="userInfoRight">
          <div className="userTop">
            <p>{user}</p>
          </div>
          <div className="userMeta">
            <p>Day{dayCount}</p>
            <p>{location}</p>
            <p>{timeAgo}</p>
          </div>
        </div>
      </div>

      <img src={imageUrl} alt="投稿画像" className="postImage" />

      <p className="postText">{text}</p>

      <div className="postReactions">
        <button className="reactionBtn">ジャバジャバ 20</button>
        <button className="reactionAdd">＋</button>
      </div>
    </div>
  );
};

export default PostCard;
