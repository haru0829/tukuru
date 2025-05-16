import React, { useState } from "react";
import "./PostModal.scss";

const categories = [
  { key: "illustration", label: "イラスト" },
  { key: "music", label: "音楽" },
  { key: "code", label: "コード" },
];

const PostModal = ({ isOpen, onClose }) => {
  const [text, setText] = useState("");
  const [tags, setTags] = useState("");
  const [image, setImage] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState("");

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log({ text, tags, image, selectedCategory });
    alert("投稿しました（仮）");
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="modalOverlay" onClick={onClose}>
      <div className="modalContent" onClick={(e) => e.stopPropagation()}>
        <button className="closeBtn" onClick={onClose}>
          ×
        </button>
        <h2>投稿する</h2>
        <form onSubmit={handleSubmit}>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="今日は何をしましたか？"
          />

          <div className="categorySelect">
            {categories.map((cat) => (
              <button
                key={cat.key}
                type="button"
                className={`categoryBtn ${
                  selectedCategory === cat.key ? "selected" : ""
                }`}
                onClick={() => setSelectedCategory(cat.key)}
              >
                {cat.label}
              </button>
            ))}
          </div>

          <label className="imageUpload">
            {previewUrl ? (
              <img src={previewUrl} alt="preview" />
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

          <input
            type="text"
            placeholder="タグ（スペース区切り）"
            value={tags}
            onChange={(e) => setTags(e.target.value)}
          />

          <button type="submit" className="submitBtn">
            投稿する
          </button>
        </form>
      </div>
    </div>
  );
};

export default PostModal;
