import { Routes, Route } from "react-router-dom";
import LandingPage from "./pages/LandingPage/LandingPage";
import RegisterPage from "./pages/RegisterPage/RegisterPage";
import LoginPage from "./pages/LoginPage/LoginPage";
import Dashboard from "./pages/Dashboard/Dashbiard";
import CreateProject from "./pages/CreateProject/CreateProject";
import Profile from "./pages/Profile/Profile";
import Posts from "./pages/Posts/Posts";

function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/create-project" element={<CreateProject />} />
      <Route path="/profile" element={<Profile />} />
      <Route path="/my-posts" element={<Posts />} />
    </Routes>
  );
}

export default App;