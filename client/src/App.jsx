import { Routes, Route, Navigate } from "react-router-dom";
import RegisterPage from "./pages/RegisterPage/RegisterPage";
import LoginPage from "./pages/LoginPage/LoginPage";
import CreateProject from "./pages/CreateProject/CreateProject";
import Profile from "./pages/Profile/Profile";
import Posts from "./pages/Posts/Posts";
import ProfileView from "./pages/Profile/ProfileView";
import FollowRequests from "./pages/FollowRequests/FollowRequests";
import Settings from "./pages/Settings/Settings";
import ProjectChat from "./pages/ProjectChat/ProjectChat";
import InvitationDetail from "./pages/InvitationDetail/InvitationDetail";
import Search from "./pages/Search/Search";
import ProtectedRoute from "./components/ProtectedRoute";
import { isLoggedIn } from "./utils/session";

function App() {
  return (
    <Routes>
      <Route
        path="/"
        element={<Navigate to={isLoggedIn() ? "/my-posts" : "/login"} replace />}
      />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/create-project" element={<ProtectedRoute><CreateProject /></ProtectedRoute>} />
      <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
      <Route path="/my-posts" element={<ProtectedRoute><Posts /></ProtectedRoute>} />
      <Route path="/profile/:userId" element={<ProtectedRoute><ProfileView /></ProtectedRoute>} />
      <Route path="/follow-requests" element={<ProtectedRoute><FollowRequests /></ProtectedRoute>} />
      <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
      <Route path="/projects/:projectId/chat" element={<ProtectedRoute><ProjectChat /></ProtectedRoute>} />
      <Route path="/invitations/:notificationId" element={<ProtectedRoute><InvitationDetail /></ProtectedRoute>} />
      <Route path="/search" element={<ProtectedRoute><Search /></ProtectedRoute>} />
    </Routes>
  );
}

export default App;
