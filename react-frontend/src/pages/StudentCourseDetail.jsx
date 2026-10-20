// src/pages/StudentCourseDetail.jsx
// Course details for a student, with the Enroll button.

import { useContext, useEffect, useState } from "react";
import { Link as RouterLink, useParams } from "react-router-dom";
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Paper,
  Typography,
} from "@mui/material";
import { UserContext } from "../context/UserContext";
import StatusChip from "../components/StatusChip";

export default function StudentCourseDetail() {
  const { id } = useParams();
  const { api } = useContext(UserContext);
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  function loadCourse() {
    return api(`/api/course/${id}`).then(setCourse);
  }

  useEffect(() => {
    loadCourse()
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  async function handleEnroll() {
    setError("");
    setSuccess("");
    setEnrolling(true);
    try {
      await api(`/api/course/${id}/enroll`, { method: "POST" });
      setSuccess("You are now enrolled in this course.");
    } catch (err) {
      // The backend decides (closed, full, already enrolled...). Show why.
      setError(err.message);
    } finally {
      try {
        await loadCourse(); // refresh seats / enrolled state either way
      } catch {
        // keep the old data if the refresh fails
      }
      setEnrolling(false);
    }
  }

  if (loading) return <CircularProgress />;
  if (!course) {
    return (
      <>
        <Alert severity="error" sx={{ mb: 2 }}>{error || "Course not found"}</Alert>
        <Button component={RouterLink} to="/courses">
          Back to courses
        </Button>
      </>
    );
  }

  const full = course.enrolledCount >= course.maxStudent;
  const canEnroll = course.status === "Open" && !full && !course.isEnrolled;

  let hint = "";
  if (course.isEnrolled) hint = "You are already enrolled in this course.";
  else if (course.status === "Close") hint = "This course is closed for enrollment.";
  else if (course.status === "Cancel") hint = "This course has been cancelled.";
  else if (full) hint = "This course is full.";

  return (
    <>
      <Typography variant="h5" gutterBottom>
        {course.name}
      </Typography>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

      <Paper sx={{ p: 3, mb: 2, display: "grid", gap: 1 }}>
        <Typography>
          <b>Status:</b> <StatusChip status={course.status} />
        </Typography>
        <Typography><b>Teacher:</b> {course.teacherName}</Typography>
        <Typography><b>Duration:</b> {course.duration} days</Typography>
        <Typography><b>Price:</b> {Number(course.price).toLocaleString()}</Typography>
        <Typography>
          <b>Seats:</b> {course.enrolledCount} / {course.maxStudent} taken
        </Typography>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, flexWrap: "wrap" }}>
          <b>Topics:</b>
          {course.topics.map((t) => (
            <Chip key={t} label={t} size="small" />
          ))}
        </Box>
      </Paper>

      <Box sx={{ display: "flex", alignItems: "center", gap: 2, flexWrap: "wrap" }}>
        <Button variant="contained" onClick={handleEnroll} disabled={!canEnroll || enrolling}>
          {enrolling ? "Enrolling..." : "Enroll"}
        </Button>
        {hint && <Typography color="text.secondary">{hint}</Typography>}
        <Button component={RouterLink} to="/courses">
          Back to courses
        </Button>
      </Box>
    </>
  );
}
