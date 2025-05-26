import React, { useState } from "react";
import "./PostModal.scss";
import { db, storage, auth } from "../firebase";
import { collection, addDoc, serverTimestamp, updateDoc, doc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { useNavigate } from "react-router-dom";
import { getDocs, query, where } from "firebase/firestore";
import { useEffect } from "react";

const categories = [
  { key: "illustration", label: "イラスト" },
  { key: "music", label: "音楽" },
  { key: "code", label: "コード" },
];

const PostModal = ({
  isOpen,
  onClose,
  isEdit = false,
  existingPost = null,
  onSuccess = () => {},
}) => {
  const navigate = useNavigate();

  const [text, setText] = useState("");
  const [tags, setTags] = useState("");
  const [image, setImage] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [showLoginModal, setShowLoginModal] = useState(false);

  useEffect(() => {
    if (isEdit && existingPost) {
      setText(existingPost.text || "");
      setTags((existingPost.tags || []).join(" "));
      setSelectedCategory(existingPost.category || "");
      setPreviewUrl(existingPost.imageUrl || null);
      setImage(null); // 上書き防止
    }
  }, [isEdit, existingPost]);

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
      const user = auth.currentUser;
      if (!user) {
        alert("ログインが必要です");
        return;
      }

      let imageUrl = previewUrl;
      if (image) {
        const imageRef = ref(storage, `posts/${Date.now()}_${image.name}`);
        await uploadBytes(imageRef, image);
        imageUrl = await getDownloadURL(imageRef);
      }

      if (isEdit && existingPost) {
        const refDoc = doc(db, "posts", existingPost.id);
        await updateDoc(refDoc, {
          text,
          tags: tags.trim().split(/\s+/),
          category: selectedCategory,
          imageUrl,
          updatedAt: serverTimestamp(),
        });
        alert("投稿を更新しました！");
      } else {
        // 新規投稿
        const q = query(
          collection(db, "posts"),
          where("authorId", "==", user.uid),
          where("category", "==", selectedCategory)
        );
        const snapshot = await getDocs(q);
        const categoryDayCount = snapshot.size + 1;

        await addDoc(collection(db, "posts"), {
          text,
          tags: tags.trim().split(/\s+/),
          category: selectedCategory,
          categoryDayCount,
          imageUrl,
          createdAt: serverTimestamp(),
          authorId: user.uid,
          authorName: user.displayName || "unknown",
          authorPhotoURL: user.photoURL || "",
        });

        alert("投稿が完了しました！");
      }

      onClose();
      onSuccess();
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
