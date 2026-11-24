import { Routes, Route, Navigate } from "react-router-dom";

import Home from "../pages/public/Home";
import Login from "../pages/public/Login";
import Register from "../pages/public/Register";

import CreatorDashboard from "../pages/creator/CreatorDashboard";
import BrowseStudios from "../pages/creator/BrowseStudios";
import CreatorBookings from "../pages/creator/CreatorBookings";
import BrowseEquipment from "../pages/creator/BrowseEquipment";
import EquipmentDetails from "../pages/creator/EquipmentDetails";
import CreatorRentals from "../pages/creator/CreatorRentals";

import ProviderDashboard from "../pages/provider/ProviderDashboard";
import ProviderStudios from "../pages/provider/ProviderStudios";
import ProviderBookings from "../pages/provider/ProviderBookings";
import CreateEditStudio from "../pages/provider/CreateEditStudio";
import ProviderEquipment from "../pages/provider/ProviderEquipment";
import CreateEditEquipment from "../pages/provider/CreateEditEquipment";
import ProviderRentals from "../pages/provider/ProviderRentals";

import ProtectedRoute from "./ProtectedRoute";

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* Creator Routes */}
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
        path="/creator/equipment"
        element={
          <ProtectedRoute allowedRoles={["creator"]}>
            <BrowseEquipment />
          </ProtectedRoute>
        }
      />
      <Route
        path="/creator/equipment/:id"
        element={
          <ProtectedRoute allowedRoles={["creator"]}>
            <EquipmentDetails />
          </ProtectedRoute>
        }
      />
      <Route
        path="/creator/rentals"
        element={
          <ProtectedRoute allowedRoles={["creator"]}>
            <CreatorRentals />
          </ProtectedRoute>
        }
      />

      {/* Provider Routes */}
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
      <Route
        path="/provider/equipment"
        element={
          <ProtectedRoute allowedRoles={["provider"]}>
            <ProviderEquipment />
          </ProtectedRoute>
        }
      />
      <Route
        path="/provider/equipment/new"
        element={
          <ProtectedRoute allowedRoles={["provider"]}>
            <CreateEditEquipment />
          </ProtectedRoute>
        }
      />
      <Route
        path="/provider/equipment/:id/edit"
        element={
          <ProtectedRoute allowedRoles={["provider"]}>
            <CreateEditEquipment />
          </ProtectedRoute>
        }
      />
      <Route
        path="/provider/rentals"
        element={
          <ProtectedRoute allowedRoles={["provider"]}>
            <ProviderRentals />
          </ProtectedRoute>
        }
      />

      {/* Alias Redirects */}
      <Route path="/browse-studios" element={<Navigate to="/creator/studios" replace />} />
      <Route path="/studios" element={<Navigate to="/creator/studios" replace />} />
      <Route path="/browse-equipment" element={<Navigate to="/creator/equipment" replace />} />
      <Route path="/equipment" element={<Navigate to="/creator/equipment" replace />} />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default AppRoutes;
