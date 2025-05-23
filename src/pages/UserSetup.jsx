import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { auth, db, storage } from "../firebase";
import {
  doc,
  setDoc,
  getDoc,
  collection,
  query,
  where,
  getDocs,
} from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import CodeIcon from "@mui/icons-material/Code";
import BrushIcon from "@mui/icons-material/Brush";
import MusicNoteIcon from "@mui/icons-material/MusicNote";
import "./UserSetup.scss";
import SidebarNav from "../components/SidebarNav";

const categories = ["イラスト", "音楽", "コード"];

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

const UserSetup = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const isEditMode = location.pathname === "/edit-profile";

  const [nickname, setNickname] = useState("");
  const [userId, setUserId] = useState("");
  const [bio, setBio] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [iconFile, setIconFile] = useState(null);
  const [iconPreview, setIconPreview] = useState(null);
  const [bannerFile, setBannerFile] = useState(null);
  const [bannerPreview, setBannerPreview] = useState(null);
  const [checkingId, setCheckingId] = useState(false);

  useEffect(() => {
    const loadUserData = async () => {
      const user = auth.currentUser;
      if (!user || !isEditMode) return;

      const userRef = doc(db, "users", user.uid);
      const snap = await getDoc(userRef);
      if (snap.exists()) {
        const data = snap.data();
        setNickname(data.name || "");
        setUserId(data.id?.replace(/^@/, "") || "");
        setBio(data.bio || "");
        setSelectedCategory(data.category || "");
        setIconPreview(data.photoURL || "");
        setBannerPreview(data.bannerURL || "");
      }
    };

    loadUserData();
  }, [isEditMode]);

  const validateUserId = async (rawId) => {
    const trimmed = rawId.trim().toLowerCase();
    const formattedId = `@${trimmed}`;

    if (!/^[a-zA-Z0-9_]{3,15}$/.test(trimmed)) {
      alert("ユーザーIDは英数字または_（3〜15文字）で入力してください");
      return null;
    }

    if (isEditMode) return formattedId;

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

  const handleBannerChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setBannerFile(file);
      setBannerPreview(URL.createObjectURL(file));
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
    let photoURL = iconPreview;
    let bannerURL = bannerPreview;

    try {
      if (iconFile) {
        const iconRef = ref(storage, `icons/${user.uid}`);
        await uploadBytes(iconRef, iconFile);
        photoURL = await getDownloadURL(iconRef);
      }

      if (bannerFile) {
        const bannerRef = ref(storage, `banners/${user.uid}`);
        await uploadBytes(bannerRef, bannerFile);
        bannerURL = await getDownloadURL(bannerRef);
      }

      await setDoc(doc(db, "users", user.uid), {
        uid: user.uid,
        email: user.email,
        name: nickname.trim(),
        id: formattedId,
        bio: bio.trim(),
        category: selectedCategory,
        photoURL,
        bannerURL,
        updatedAt: new Date(),
      }, { merge: true }); // ← merge: true で既存データ保持

      navigate("/mypage");
    } catch (err) {
      console.error("保存エラー:", err);
      alert("ユーザー情報の保存に失敗しました");
    }
  };

  return (
    <div className="setup mypage">
      <SidebarNav/>
      <header className="mypage-header">
        <h1>tukuru</h1>
      </header>

      <label className="banner">
        {bannerPreview ? (
          <img src={bannerPreview} alt="バナー" className="banner-image" />
        ) : (
          <div className="banner-placeholder">バナー画像をアップロード</div>
        )}
        <input type="file" accept="image/*" hidden onChange={handleBannerChange} />
      </label>

      <label className="icon-wrapper">
        <img
          className="user-icon"
          src={iconPreview || "img/userIcon.png"}
          alt="アイコン"
        />
        <span className="icon-plus">＋</span>
        <input type="file" accept="image/*" hidden onChange={handleIconChange} />
      </label>

      <div className="userSetupContainer">
        <h2>{isEditMode ? "プロフィールを編集" : "プロフィール設定"}</h2>
        <form onSubmit={handleSubmit}>
          <label>
            ニックネーム <span className="required">*</span>
            <input
              type="text"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
            />
          </label>

          <label>
            ユーザーID（@は不要） <span className="required">*</span>
            <input
              type="text"
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
              disabled={isEditMode} // 編集時は変更不可
            />
          </label>

          <label>
            自己紹介（任意）
            <textarea
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
            {checkingId
              ? "確認中..."
              : isEditMode
              ? "変更を保存"
              : "保存してはじめる"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default UserSetup;