import { Routes, Route, Navigate } from "react-router-dom";

import Home from "../pages/public/Home";
import Login from "../pages/public/Login";
import Register from "../pages/public/Register";

import CreatorDashboard from "../pages/creator/CreatorDashboard";
import BrowseStudios from "../pages/creator/BrowseStudios";
import CreatorBookings from "../pages/creator/CreatorBookings";

import ProviderDashboard from "../pages/provider/ProviderDashboard";
import ProviderStudios from "../pages/provider/ProviderStudios";
import ProviderBookings from "../pages/provider/ProviderBookings";
import CreateEditStudio from "../pages/provider/CreateEditStudio";

import ProtectedRoute from "./ProtectedRoute";

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      <Route
        path="/creator/dashboard"
        element={
          <ProtectedRoute allowedRoles={["creator"]}>
            <CreatorDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/creator/studios"
        element={
          <ProtectedRoute allowedRoles={["creator"]}>
            <BrowseStudios />
          </ProtectedRoute>
        }
      />
      <Route
        path="/creator/bookings"
        element={
          <ProtectedRoute allowedRoles={["creator"]}>
            <CreatorBookings />
          </ProtectedRoute>
        }
      />

      <Route
        path="/provider/dashboard"
        element={
          <ProtectedRoute allowedRoles={["provider"]}>
            <ProviderDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/provider/studios"
        element={
          <ProtectedRoute allowedRoles={["provider"]}>
            <ProviderStudios />
          </ProtectedRoute>
        }
      />
      <Route
        path="/provider/studios/new"
        element={
          <ProtectedRoute allowedRoles={["provider"]}>
            <CreateEditStudio />
          </ProtectedRoute>
        }
      />
      <Route
        path="/provider/studios/:id/edit"
        element={
          <ProtectedRoute allowedRoles={["provider"]}>
            <CreateEditStudio />
          </ProtectedRoute>
        }
      />
      <Route
        path="/provider/bookings"
        element={
          <ProtectedRoute allowedRoles={["provider"]}>
            <ProviderBookings />
          </ProtectedRoute>
        }
      />

      <Route path="/browse-studios" element={<Navigate to="/creator/studios" replace />} />
      <Route path="/studios" element={<Navigate to="/creator/studios" replace />} />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default AppRoutes;
