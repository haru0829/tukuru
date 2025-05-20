import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { auth, db, storage } from "../firebase";
import {
  doc,
  setDoc,
  collection,
  query,
  where,
  getDocs,
} from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import "./UserSetup.scss";

const categories = ["イラスト", "音楽", "コード"];

const UserSetup = () => {
  const navigate = useNavigate();
  const [nickname, setNickname] = useState("");
  const [userId, setUserId] = useState("");
  const [bio, setBio] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [iconFile, setIconFile] = useState(null);
  const [iconPreview, setIconPreview] = useState(null);
  const [checkingId, setCheckingId] = useState(false);

  const validateUserId = async (rawId) => {
    const trimmed = rawId.trim().toLowerCase();
    const formattedId = `@${trimmed}`;

    if (!/^[a-zA-Z0-9_]{3,15}$/.test(trimmed)) {
      alert("ユーザーIDは英数字または_（3〜15文字）で入力してください");
      return null;
    }

    setCheckingId(true);
    const q = query(collection(db, "users"), where("id", "==", formattedId));
    const snapshot = await getDocs(q);
    setCheckingId(false);

    if (!snapshot.empty) {
      alert("このユーザーIDはすでに使われています");
      return null;
    }

    return formattedId;
  };

  const handleIconChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setIconFile(file);
      setIconPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!auth.currentUser) {
      alert("ログインしていません");
      return;
    }

    if (!nickname.trim() || !userId.trim() || !selectedCategory) {
      alert("すべての必須項目を入力してください");
      return;
    }

    const formattedId = await validateUserId(userId);
    if (!formattedId) return;

    const user = auth.currentUser;
    let photoURL = user.photoURL || "";

    try {
      if (iconFile) {
        const storageRef = ref(storage, `icons/${user.uid}`);
        await uploadBytes(storageRef, iconFile);
        photoURL = await getDownloadURL(storageRef);
      }

      await setDoc(doc(db, "users", user.uid), {
        uid: user.uid,
        email: user.email,
        name: nickname.trim(),
        id: formattedId, // "@xxx" に整形済
        bio: bio.trim(),
        category: selectedCategory,
        photoURL,
        createdAt: new Date(),
      });

      navigate("/");
    } catch (err) {
      console.error("保存エラー:", err);
      alert("ユーザー情報の保存に失敗しました");
    }
  };

  return (
    <div className="setup">
      <header>
        <h1>tukuru</h1>
      </header>
      <div className="userSetupContainer">
        <h2>プロフィール設定</h2>
        <form onSubmit={handleSubmit}>
          <label className="iconUpload">
            {iconPreview ? (
              <img src={iconPreview} alt="プレビュー" />
            ) : (
              <span>＋</span>
            )}
            <input type="file" accept="image/*" hidden onChange={handleIconChange} />
          </label>

          <label>
            ニックネーム <span className="required">*</span>
            <input
              type="text"
              placeholder="例: あきら"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
            />
          </label>

          <label>
            ユーザーID（@は不要） <span className="required">*</span>
            <input
              type="text"
              placeholder="例: example_user"
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
            />
          </label>

          <label>
            自己紹介（任意）
            <textarea
              placeholder="自己紹介など"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
            />
          </label>

          <p className="categoryText">
            創作カテゴリ <span className="required">*</span>
          </p>
          <div className="categorySelect">
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                className={selectedCategory === cat ? "selected" : ""}
                onClick={() => setSelectedCategory(cat)}
              >
                {cat}
              </button>
            ))}
          </div>

          <button type="submit" disabled={checkingId}>
            {checkingId ? "確認中..." : "保存してはじめる"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default UserSetup;
