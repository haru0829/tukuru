import React, { useState } from "react";
import "./PostModal.scss";
import { db, storage, auth } from "../firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { useNavigate } from "react-router-dom";

const categories = [
  { key: "illustration", label: "イラスト" },
  { key: "music", label: "音楽" },
  { key: "code", label: "コード" },
];

const PostModal = ({ isOpen, onClose }) => {
  const navigate = useNavigate();

  const [text, setText] = useState("");
  const [tags, setTags] = useState("");
  const [image, setImage] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [showLoginModal, setShowLoginModal] = useState(false);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      let imageUrl = "";
      if (image) {
        const imageRef = ref(storage, `posts/${Date.now()}_${image.name}`);
        await uploadBytes(imageRef, image);
        imageUrl = await getDownloadURL(imageRef);
      }

      const user = auth.currentUser;

      await addDoc(collection(db, "posts"), {
        text,
        tags: tags.trim().split(/\s+/),
        category: selectedCategory,
        imageUrl,
        createdAt: serverTimestamp(),
        authorId: user?.uid || "anonymous",
        authorName: user?.displayName || "unknown",
        authorPhotoURL: user?.photoURL || "",
      });

      alert("投稿が完了しました！");
      onClose();
      setText("");
      setTags("");
      setSelectedCategory("");
      setImage(null);
      setPreviewUrl(null);
    } catch (err) {
      console.error("投稿エラー:", err);
      alert("投稿に失敗しました");
    }
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
