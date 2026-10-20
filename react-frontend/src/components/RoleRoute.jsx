// src/components/RoleRoute.jsx
// Only lets the given role through. This is for usability only: the
// backend API enforces the same rules and is the real protection.

import { useContext } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { UserContext } from "../context/UserContext";
import { homePathFor } from "../utils/paths";

export default function RoleRoute({ role }) {
  const { user } = useContext(UserContext);
  if (user?.role !== role) {
    return <Navigate to={homePathFor(user?.role)} replace />;
  }
  return <Outlet />;
}
