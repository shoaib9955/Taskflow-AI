import { Navigate, Route, Routes } from "react-router-dom";

import Login from "../pages/auth/Login";
import Signup from "../pages/auth/Signup";

import Dashboard from "../pages/dashboard/Dashboard";

import Projects from "../pages/projects/Projects";
import ProjectDetail from "../pages/projects/ProjectDetail";

import Tasks from "../pages/tasks/Tasks";
import TaskDetails from "../pages/tasks/TaskDetails";

import ProtectedRoute from "./ProtectedRoute";
import AppLayout from "../components/layout/AppLayout";

import Team from "../pages/team/Team";
import Activity from "../pages/activity/Activity";
import Notifications from "../pages/notifications/Notifications";

import AIAssistant from "../pages/ai/AIAssistant";

import Settings from "../pages/settings/Settings";

import Guide from "../pages/guide/Guide";

const AppRoutes = () => {
  return (
    <Routes>

      <Route path="/login" element={<Login />} />

      <Route path="/signup" element={<Signup />} />

      <Route path="/guide" element={<Guide />} />

      <Route element={<ProtectedRoute />}>
        <Route element={<AppLayout />}>

          <Route path="/dashboard" element={<Dashboard />} />

          <Route path="/projects" element={<Projects />} />

          <Route path="/projects/:id" element={<ProjectDetail />} />

          <Route path="/tasks" element={<Tasks />} />

          <Route path="/tasks/:id" element={<TaskDetails />} />

          <Route path="/team" element={<Team />} />

          <Route path="/activity" element={<Activity />} />

          <Route path="/notifications" element={<Notifications />} />

          <Route path="/ai" element={<AIAssistant />} />

          <Route path="/settings" element={<Settings />} />
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
};

export default AppRoutes;
