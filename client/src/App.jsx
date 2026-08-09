import { Routes, Route } from "react-router-dom";
import LandingPage from "./pages/LandingPage/LandingPage";
import RegisterPage from "./pages/RegisterPage/RegisterPage";
import LoginPage from "./pages/LoginPage/LoginPage";
import Dashboard from "./pages/Dashboard/Dashboard";
import CreateProject from "./pages/CreateProject/CreateProject";
import Profile from "./pages/Profile/Profile";
import Posts from "./pages/Posts/Posts";
import ProfileView from "./pages/Profile/ProfileView";
import FollowRequests from "./pages/FollowRequests/FollowRequests";
import Settings from "./pages/Settings/Settings";
import ProjectChat from "./pages/ProjectChat/ProjectChat";
import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
      <Route path="/create-project" element={<ProtectedRoute><CreateProject /></ProtectedRoute>} />
      <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
      <Route path="/my-posts" element={<ProtectedRoute><Posts /></ProtectedRoute>} />
      <Route path="/profile/:userId" element={<ProtectedRoute><ProfileView /></ProtectedRoute>} />
      <Route path="/follow-requests" element={<ProtectedRoute><FollowRequests /></ProtectedRoute>} />
      <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
      <Route path="/projects/:projectId/chat" element={<ProtectedRoute><ProjectChat /></ProtectedRoute>} />
    </Routes>
  );
}

export default App;
