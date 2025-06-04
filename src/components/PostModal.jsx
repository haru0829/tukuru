// PostModal.jsx
import React, { useState, useEffect } from "react";
import "./PostModal.scss";
import { db, storage, auth } from "../firebase";
import {
  collection,
  addDoc,
  serverTimestamp,
  updateDoc,
  doc,
  getDocs,
  query,
  where,
} from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { useNavigate } from "react-router-dom";
import Spinner from "./Spinner";

const categories = [
  { key: "illustration", label: "イラスト" },
  { key: "picture", label: "写真" },
  { key: "video", label: "映像" },
  { key: "music", label: "音楽" },
  { key: "literature", label: "文学" },
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
  const [media, setMedia] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [mediaType, setMediaType] = useState("");
  const [loading, setLoading] = useState(false);
  const [isHEVC, setIsHEVC] = useState(false);

  useEffect(() => {
    if (isEdit && existingPost) {
      setText(existingPost.text || "");
      setTags((existingPost.tags || []).join(" "));
      setSelectedCategory(existingPost.category || "");
      setPreviewUrl(existingPost.mediaUrl || existingPost.imageUrl || null);
      setMediaType(existingPost.mediaType || "image");
      setMedia(null);
    }
  }, [isEdit, existingPost]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const isHEVCFormat =
      file.type === "video/quicktime" ||
      file.name.toLowerCase().endsWith(".mov");
    setIsHEVC(isHEVCFormat);

    if (file.type.startsWith("video/")) {
      const url = URL.createObjectURL(file);
      const video = document.createElement("video");
      video.preload = "metadata";
      video.src = url;

      video.onloadedmetadata = () => {
        URL.revokeObjectURL(url);
        const duration = video.duration;
        if (duration > 30) {
          alert("30秒以内の動画のみアップロードできます。");
          e.target.value = "";
          return;
        }

        if (isHEVCFormat) {
          alert(
            "この動画はiPhone形式(.mov)の可能性があり、一部の端末でプレビューできませんが、投稿自体は可能です。"
          );
        }

        setMedia(file);
        setPreviewUrl(url);
        setMediaType("video");
      };

      video.onerror = () => {
        alert("動画の読み込みに失敗しました。");
        e.target.value = "";
      };
    } else {
      setMedia(file);
      setPreviewUrl(URL.createObjectURL(file));
      setMediaType("image");
      setIsHEVC(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const user = auth.currentUser;
      if (!user) {
        alert("ログインが必要です");
        return;
      }

      let mediaUrl = previewUrl;
      if (media) {
        const mediaRef = ref(storage, `posts/${Date.now()}_${media.name}`);
        await uploadBytes(mediaRef, media);
        mediaUrl = await getDownloadURL(mediaRef);
      }

      if (isEdit && existingPost) {
        const refDoc = doc(db, "posts", existingPost.id);
        await updateDoc(refDoc, {
          text,
          tags: tags.trim().split(/\s+/),
          category: selectedCategory,
          mediaUrl,
          mediaType,
          updatedAt: serverTimestamp(),
        });
        alert("投稿を更新しました！");
      } else {
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
          mediaUrl,
          mediaType,
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
      setMedia(null);
      setPreviewUrl(null);
      setMediaType("");
      setIsHEVC(false);
    } catch (err) {
      console.error("投稿エラー:", err);
      alert("投稿に失敗しました");
    } finally {
      setLoading(false);
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
              mediaType === "video" ? (
                isHEVC ? (
                  <div className="videoPlaceholder">
                    <p>この動画はプレビューできませんが、投稿は可能です。</p>
                  </div>
                ) : (
                  <video controls width="100%">
                    <source src={previewUrl} type="video/mp4" />
                    この端末では動画を再生できません
                  </video>
                )
              ) : (
                <img src={previewUrl} alt="preview" />
              )
            ) : (
              <span>画像または動画をアップロード</span>
            )}
            <input
              type="file"
              accept="image/*,video/mp4,video/quicktime,.mp4,.mov"
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
        {loading && <Spinner />}
      </div>
    </div>
  );
};

export default PostModal;
