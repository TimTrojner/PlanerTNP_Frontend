import { BrowserRouter, Route, Routes } from "react-router-dom";
import "./App.css";
import About from "./components/about/about";
import InterestingInfo from "./components/about/interesting_info";
import Footer from "./components/footer/footer";
import Home from "./components/Home/Home";
import IdeaCenter from "./components/Idea_center/Idea_center";
import Navbar from "./components/navbar";
import Login from "./components/profile/login";
import PostIdea from "./components/profile/postIdea";
import PostProject from "./components/profile/postProject";
import Profile from "./components/profile/profile";
import Register from "./components/profile/register";

function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/idea-center" element={<IdeaCenter />} />
        <Route path="/about" element={<About />} />
        <Route path="/interesting-info" element={<InterestingInfo />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/post-project" element={<PostProject />} />
        <Route path="/post-idea" element={<PostIdea />} />
      </Routes>
      <Footer />
    </BrowserRouter>
  );
}

export default App;
