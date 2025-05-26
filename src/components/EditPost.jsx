// pages/EditPost.jsx
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "./PostModal.scss"; // PostModal と同じ UI を再利用
import { db, storage, auth } from "../firebase";
import {
  doc,
  getDoc,
  updateDoc,
  serverTimestamp,
  collection,
  getDocs,
  query,
  where,
} from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

const categories = [
  { key: "illustration", label: "イラスト" },
  { key: "music", label: "音楽" },
  { key: "code", label: "コード" },
];

const EditPost = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [text, setText] = useState("");
  const [tags, setTags] = useState("");
  const [image, setImage] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPost = async () => {
      const refDoc = doc(db, "posts", id);
      const snap = await getDoc(refDoc);
      if (!snap.exists()) {
        alert("投稿が存在しません");
        return navigate("/");
      }
      const data = snap.data();
      if (auth.currentUser?.uid !== data.authorId) {
        alert("編集権限がありません");
        return navigate("/");
      }
      setText(data.text || "");
      setTags((data.tags || []).join(" "));
      setSelectedCategory(data.category || "");
      setPreviewUrl(data.imageUrl || null);
      setLoading(false);
    };

    fetchPost();
  }, [id, navigate]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      const refDoc = doc(db, "posts", id);
      let imageUrl = previewUrl;

      if (image) {
        const imageRef = ref(storage, `posts/${Date.now()}_${image.name}`);
        await uploadBytes(imageRef, image);
        imageUrl = await getDownloadURL(imageRef);
      }

      await updateDoc(refDoc, {
        text,
        tags: tags.trim().split(/\s+/),
        category: selectedCategory,
        imageUrl,
        updatedAt: serverTimestamp(),
      });

      alert("投稿を更新しました！");
      navigate("/mypage");
    } catch (err) {
      console.error("更新エラー:", err);
      alert("投稿の更新に失敗しました");
    }
  };

  if (loading) return <p style={{ padding: "2rem" }}>読み込み中...</p>;

  return (
    <div className="modalOverlay" style={{ display: "flex" }}>
      <div className="modalContent" onClick={(e) => e.stopPropagation()}>
        <h2>投稿を編集</h2>
        <form onSubmit={handleUpdate}>
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
            保存する
          </button>
        </form>
      </div>
    </div>
  );
};

export default EditPost;
