// src/pages/TeacherCourseDetail.jsx
// Course details for the owning teacher, including enrolled students.

import { useContext, useEffect, useState } from "react";
import { Link as RouterLink, useNavigate, useParams } from "react-router-dom";
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Tooltip,
  Typography,
} from "@mui/material";
import { UserContext } from "../context/UserContext";
import StatusChip from "../components/StatusChip";

export default function TeacherCourseDetail() {
  const { id } = useParams();
  const { api } = useContext(UserContext);
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    api(`/api/course/${id}`)
      .then(setCourse)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  async function handleDelete() {
    if (!window.confirm(`Delete "${course.name}"? This cannot be undone.`)) return;
    setError("");
    try {
      await api(`/api/course/${id}`, { method: "DELETE" });
      navigate("/teacher/courses", { replace: true });
    } catch (err) {
      setError(err.message);
    }
  }

  if (loading) return <CircularProgress />;
  if (!course) {
    return (
      <>
        <Alert severity="error" sx={{ mb: 2 }}>{error || "Course not found"}</Alert>
        <Button component={RouterLink} to="/teacher/courses">
          Back to my courses
        </Button>
      </>
    );
  }

  const hasStudents = course.students.length > 0;

  return (
    <>
      <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2, flexWrap: "wrap" }}>
        <Typography variant="h5" sx={{ flexGrow: 1 }}>
          {course.name}
        </Typography>
        <Button variant="outlined" component={RouterLink} to={`/teacher/courses/${id}/edit`}>
          Edit
        </Button>
        <Tooltip title={hasStudents ? "Cannot delete: students are enrolled" : ""}>
          <span>
            <Button variant="outlined" color="error" onClick={handleDelete} disabled={hasStudents}>
              Delete
            </Button>
          </span>
        </Tooltip>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <Paper sx={{ p: 3, mb: 3, display: "grid", gap: 1 }}>
        <Typography>
          <b>Status:</b> <StatusChip status={course.status} />
        </Typography>
        <Typography><b>Duration:</b> {course.duration} days</Typography>
        <Typography><b>Price:</b> {Number(course.price).toLocaleString()}</Typography>
        <Typography>
          <b>Seats:</b> {course.enrolledCount} / {course.maxStudent} enrolled
        </Typography>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, flexWrap: "wrap" }}>
          <b>Topics:</b>
          {course.topics.map((t) => (
            <Chip key={t} label={t} size="small" />
          ))}
        </Box>
      </Paper>

      <Typography variant="h6" gutterBottom>
        Enrolled students ({course.students.length})
      </Typography>
      {hasStudents ? (
        <Paper>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Username</TableCell>
                <TableCell>Email</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {course.students.map((s) => (
                <TableRow key={s.id}>
                  <TableCell>{s.username}</TableCell>
                  <TableCell>{s.email}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Paper>
      ) : (
        <Alert severity="info">No students have enrolled yet.</Alert>
      )}

      <Button component={RouterLink} to="/teacher/courses" sx={{ mt: 2 }}>
        Back to my courses
      </Button>
    </>
  );
}
