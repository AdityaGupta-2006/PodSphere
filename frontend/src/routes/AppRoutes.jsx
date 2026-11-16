import { Routes, Route, Navigate } from "react-router-dom";

import Home from "../pages/public/Home";
import Login from "../pages/public/Login";
import Register from "../pages/public/Register";
import CreatorBookings from "../pages/creator/CreatorBookings";
import ProviderDashboard from "../pages/provider/ProviderDashboard";
import ProviderStudios from "../pages/provider/ProviderStudios";
import ProviderBookings from "../pages/provider/ProviderBookings";
import CreateEditStudio from "../pages/provider/CreateEditStudio";

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/creator/bookings" element={<CreatorBookings />} />
      <Route path="/creator/dashboard" element={<CreatorBookings />} />
      <Route path="/creator/studios" element={<Home />} />
      <Route path="/provider/dashboard" element={<ProviderDashboard />} />
      <Route path="/provider/studios" element={<ProviderStudios />} />
      <Route path="/provider/studios/new" element={<CreateEditStudio />} />
      <Route path="/provider/studios/:id/edit" element={<CreateEditStudio />} />
      <Route path="/provider/bookings" element={<ProviderBookings />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default AppRoutes;
