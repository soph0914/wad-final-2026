// src/pages/StudentCourses.jsx
// Browse/search all courses (/courses) or show enrolled ones (/my-courses).

import { useContext, useEffect, useState } from "react";
import { Link as RouterLink } from "react-router-dom";
import {
  Alert,
  Box,
  Button,
  Card,
  CardActions,
  CardContent,
  Chip,
  CircularProgress,
  TextField,
  Typography,
} from "@mui/material";
import { UserContext } from "../context/UserContext";
import StatusChip from "../components/StatusChip";

export default function StudentCourses({ enrolledOnly = false }) {
  const { api } = useContext(UserContext);
  const [search, setSearch] = useState("");
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Re-query the backend shortly after the user stops typing.
  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(true);
      const params = new URLSearchParams();
      if (search.trim()) params.set("search", search.trim());
      if (enrolledOnly) params.set("enrolled", "true");
      const query = params.toString();

      api(`/api/course${query ? `?${query}` : ""}`)
        .then((data) => {
          setCourses(data);
          setError("");
        })
        .catch((err) => setError(err.message))
        .finally(() => setLoading(false));
    }, 300);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, enrolledOnly]);

  return (
    <>
      <Typography variant="h5" gutterBottom>
        {enrolledOnly ? "My Enrolled Courses" : "All Courses"}
      </Typography>

      <TextField
        label="Search by course name or teacher name"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        fullWidth
        sx={{ mb: 3, maxWidth: 500 }}
      />

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {loading && <CircularProgress size={28} />}

      {!loading && !error && courses.length === 0 && (
        <Alert severity="info">
          {enrolledOnly && !search
            ? "You are not enrolled in any courses yet."
            : "No courses found."}
        </Alert>
      )}

      <Box sx={{ display: "grid", gap: 2, gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))" }}>
        {courses.map((c) => (
          <Card key={c._id} variant="outlined">
            <CardContent>
              <Box sx={{ display: "flex", justifyContent: "space-between", gap: 1 }}>
                <Typography variant="h6">{c.name}</Typography>
                <StatusChip status={c.status} />
              </Box>
              <Typography color="text.secondary" gutterBottom>
                Teacher: {c.teacherName}
              </Typography>
              <Typography variant="body2">Duration: {c.duration} days</Typography>
              <Typography variant="body2">Price: {Number(c.price).toLocaleString()}</Typography>
              <Typography variant="body2">
                Seats: {c.enrolledCount} / {c.maxStudent}
              </Typography>
              {c.isEnrolled && (
                <Chip label="Enrolled" color="primary" size="small" sx={{ mt: 1 }} />
              )}
            </CardContent>
            <CardActions>
              <Button size="small" component={RouterLink} to={`/courses/${c._id}`}>
                View details
              </Button>
            </CardActions>
          </Card>
        ))}
      </Box>
    </>
  );
}
