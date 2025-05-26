import "./App.css";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import Home from "./pages/Home";
import Mypage from "./pages/Mypage";
import Search from "./pages/Search";
import Record from "./pages/Record";
import Login from "./pages/Login";
import { onAuthStateChanged } from "firebase/auth";
import { useEffect, useState } from "react";
import { auth } from "./firebase";
import UserSetup from "./pages/UserSetup";
import UserPage from "./pages/UserPage";
import EditPost from "./components/EditPost";

function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setLoading(false); // ログイン状態の反映が完了
    });
    return () => unsubscribe();
  }, []);

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />}></Route>
        <Route path="/search" element={<Search />}></Route>
        <Route path="/login" element={<Login />}></Route>
        <Route path="/record" element={<Record />}></Route>
        <Route path="/mypage" element={<Mypage />}></Route>
        <Route path="/user-setup" element={<UserSetup />}></Route>
        <Route path="/user/:uid" element={<UserPage />} />
        <Route path="/edit-profile" element={<UserSetup />} />
        <Route path="/edit-post/:id" element={<EditPost />} />
      </Routes>
    </Router>
  );
}

export default App;