// src/pages/Login.jsx
import React from "react";
import {
  GoogleAuthProvider,
  signInWithPopup,
} from "firebase/auth";
import { auth, db } from "../firebase";
import { useNavigate } from "react-router-dom";
import { doc, getDoc } from "firebase/firestore";
import "./Login.scss";

const Login = () => {
  const navigate = useNavigate();

  const handleLogin = async () => {
    const provider = new GoogleAuthProvider();

    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      // Firestore にユーザーデータが存在するか確認
      const userRef = doc(db, "users", user.uid);
      const userSnap = await getDoc(userRef);

      if (userSnap.exists()) {
        navigate("/"); // 既存ユーザー：ホームへ
      } else {
        navigate("/user-setup"); // 初回ユーザー：プロフィール設定へ
      }
    } catch (error) {
      alert("ログインに失敗しました");
      console.error("ログインエラー:", error);
    }
  };

  return (
    <div className="loginPage">
      <img src="favicon.ico" alt="アプリロゴ" />
      <button onClick={handleLogin}>Googleでログイン</button>
    </div>
  );
};

export default Login;