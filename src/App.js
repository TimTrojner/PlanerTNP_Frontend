import { BrowserRouter, Route, Routes } from "react-router-dom";
import "./App.css";
import Calendar from "./components/calendar/calendar";
import Navbar from "./components/navbar";
import Login from "./components/profile/login";
import Register from "./components/profile/register";
import TodoList from './components/profile/TodoList';

function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        <Route path="/" element={<Calendar />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/todos" element={<TodoList />} />

        {/*<Route path="/post-project" element={<PostProject />} />
        <Route path="/post-idea" element={<PostIdea />} /> */}
      </Routes>
    </BrowserRouter>
  );
}

export default App;
