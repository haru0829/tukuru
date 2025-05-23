import React, { useEffect } from "react";
import {
  GoogleAuthProvider,
  signInWithRedirect,
  getRedirectResult,
} from "firebase/auth";
import { auth } from "../firebase";
import { useNavigate } from "react-router-dom";
import "./Login.scss";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebase";

const Login = () => {
  const navigate = useNavigate();

  const handleLogin = () => {
    const provider = new GoogleAuthProvider();
    signInWithRedirect(auth, provider);
  };

  // リダイレクト後の処理
  useEffect(() => {
    const checkRedirectResult = async () => {
      try {
        const result = await getRedirectResult(auth);
        if (result && result.user) {
          const user = result.user;

          // Firestore にユーザー情報が登録されているか確認
          const userRef = doc(db, "users", user.uid);
          const userSnap = await getDoc(userRef);

          if (userSnap.exists()) {
            navigate("/"); // プロフィール済みならホーム
          } else {
            navigate("/user-setup"); // 初回ログインならプロフィール設定へ
          }
        }
      } catch (error) {
        alert("ログインに失敗しました");
        console.error(error);
      }
    };

    checkRedirectResult();
  }, [navigate]);

  return (
    <div className="loginPage">
      <img src="favicon.ico" alt="アプリロゴ" />
      <button onClick={handleLogin}>Googleでログイン</button>
    </div>
  );
};

export default Login;
