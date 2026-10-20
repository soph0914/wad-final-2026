// src/pages/LoginPage.jsx

import { useContext, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { Alert, Box, Button, Paper, TextField, Typography } from "@mui/material";
import { UserContext } from "../context/UserContext";
import { homePathFor } from "../utils/paths";

export default function LoginPage() {
  const { user, loading, login } = useContext(UserContext);
  const navigate = useNavigate();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  if (!loading && user) {
    return <Navigate to={homePathFor(user.role)} replace />;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      const loggedIn = await login(identifier, password);
      navigate(homePathFor(loggedIn.role), { replace: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Box sx={{ display: "flex", justifyContent: "center", mt: 10, px: 2 }}>
      <Paper sx={{ p: 4, width: "100%", maxWidth: 400 }} elevation={3}>
        <Typography variant="h5" gutterBottom>
          Online Course Service
        </Typography>
        <Typography color="text.secondary" sx={{ mb: 2 }}>
          Please log in to continue.
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Box component="form" onSubmit={handleSubmit} sx={{ display: "grid", gap: 2 }}>
          <TextField
            label="Email or username"
            value={identifier}
            onChange={(e) => setIdentifier(e.target.value)}
            autoComplete="username"
            required
            autoFocus
          />
          <TextField
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
            required
          />
          <Button type="submit" variant="contained" size="large" disabled={submitting}>
            {submitting ? "Logging in..." : "Log in"}
          </Button>
        </Box>
      </Paper>
    </Box>
  );
}
