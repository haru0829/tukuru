// src/pages/PostForm.jsx
import React, { useState } from "react";
import "./Post.scss";

const Post = () => {
  const [text, setText] = useState("");
  const [genre, setGenre] = useState("");
  const [tags, setTags] = useState("");
  const [image, setImage] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("投稿データ", { text, genre, tags, image });
    alert("投稿が完了しました（仮）");
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  return (
    <div className="post-form">
      <h2>今日の記録を投稿</h2>
      <form onSubmit={handleSubmit}>
      <label className="image-upload-block">
          {previewUrl ? (
            <img src={previewUrl} alt="プレビュー" className="preview" />
          ) : (
            <span>画像をアップロード</span>
          )}
          <input
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            hidden
          />
        </label>
        
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="今日は何をしましたか？"
        />

        <select value={genre} onChange={(e) => setGenre(e.target.value)}>
          <option value="">ジャンルを選択</option>
          <option value="illustration">イラスト</option>
          <option value="music">音楽</option>
          <option value="writing">文章</option>
          <option value="photography">写真</option>
          <option value="craft">手芸</option>
          <option value="coding">コード</option>
          <option value="cooking">料理</option>
        </select>

        <input
          type="text"
          value={tags}
          onChange={(e) => setTags(e.target.value)}
          placeholder="タグ（スペース区切り）"
        />

        <button type="submit">投稿する</button>
      </form>
    </div>
  );
};

export default Post;
