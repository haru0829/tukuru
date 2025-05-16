import "./App.css";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import Home from "./pages/Home";
import Login from "./pages/Login";
import PostDetail from "./pages/PostDetail";
import Mypage from "./pages/Mypage";
import Search from "./pages/Search";
import Record from "./pages/Record";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />}></Route>
        <Route path="/search" element={<Search />}></Route>
        <Route path="/login" element={<Login />}></Route>
        <Route path="/record" element={<Record />}></Route>
        <Route path="/mypage" element={<Mypage />}></Route>
      </Routes>
    </Router>
  );
}

export default App;
