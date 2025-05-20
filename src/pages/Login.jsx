import React from "react";
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { auth } from "../firebase";
import { useNavigate } from "react-router-dom";
import "./Login.scss";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebase";

const Login = () => {
  const navigate = useNavigate();

  const handleLogin = async () => {
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      // Firestore にユーザー情報が登録されているか確認
      const userRef = doc(db, "users", user.uid);
      const userSnap = await getDoc(userRef);

      if (userSnap.exists()) {
        navigate("/"); // すでにプロフィール設定済みならホームへ
      } else {
        navigate("/setup"); // 初回ログインならプロフィール設定へ
      }
    } catch (error) {
      alert("ログインに失敗しました");
      console.error(error);
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
