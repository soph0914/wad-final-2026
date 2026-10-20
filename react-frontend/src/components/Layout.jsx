// src/components/Layout.jsx
// Guards every page behind login and shows the top navigation bar.

import { useContext } from "react";
import { Link as RouterLink, Navigate, Outlet, useLocation } from "react-router-dom";
import {
  AppBar,
  Box,
  Button,
  Chip,
  CircularProgress,
  Container,
  Toolbar,
  Typography,
} from "@mui/material";
import { UserContext } from "../context/UserContext";

const NAV = {
  teacher: [{ label: "My Courses", to: "/teacher/courses" }],
  student: [
    { label: "All Courses", to: "/courses" },
    { label: "My Enrolled Courses", to: "/my-courses" },
  ],
};

export default function Layout() {
  const { user, loading, logout } = useContext(UserContext);
  const location = useLocation();

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", mt: 10 }}>
        <CircularProgress />
      </Box>
    );
  }
  if (!user) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  return (
    <>
      <AppBar position="static">
        <Toolbar sx={{ gap: 1, flexWrap: "wrap" }}>
          <Typography variant="h6" sx={{ mr: 2 }}>
            Online Course Service
          </Typography>
          {NAV[user.role]?.map((item) => (
            <Button key={item.to} color="inherit" component={RouterLink} to={item.to}>
              {item.label}
            </Button>
          ))}
          <Box sx={{ flexGrow: 1 }} />
          <Chip
            label={`${user.username} (${user.role})`}
            sx={{ bgcolor: "rgba(255,255,255,0.2)", color: "inherit" }}
          />
          <Button color="inherit" onClick={logout}>
            Logout
          </Button>
        </Toolbar>
      </AppBar>
      <Container sx={{ py: 3 }}>
        <Outlet />
      </Container>
    </>
  );
}
