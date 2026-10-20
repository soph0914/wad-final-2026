// src/pages/TeacherCourses.jsx
// The teacher's own course list.

import { useContext, useEffect, useState } from "react";
import { Link as RouterLink } from "react-router-dom";
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import { UserContext } from "../context/UserContext";
import StatusChip from "../components/StatusChip";

export default function TeacherCourses() {
  const { api } = useContext(UserContext);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    api("/api/course")
      .then(setCourses)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
        <Typography variant="h5" sx={{ flexGrow: 1 }}>
          My Courses
        </Typography>
        <Button variant="contained" component={RouterLink} to="/teacher/courses/new">
          Create course
        </Button>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {loading && <CircularProgress />}

      {!loading && !error && courses.length === 0 && (
        <Alert severity="info">You have not created any courses yet.</Alert>
      )}

      {courses.length > 0 && (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Course name</TableCell>
                <TableCell align="right">Duration (days)</TableCell>
                <TableCell align="right">Price</TableCell>
                <TableCell align="right">Enrolled / Max</TableCell>
                <TableCell>Status</TableCell>
                <TableCell />
              </TableRow>
            </TableHead>
            <TableBody>
              {courses.map((c) => (
                <TableRow key={c._id} hover>
                  <TableCell>{c.name}</TableCell>
                  <TableCell align="right">{c.duration}</TableCell>
                  <TableCell align="right">{Number(c.price).toLocaleString()}</TableCell>
                  <TableCell align="right">
                    {c.enrolledCount} / {c.maxStudent}
                  </TableCell>
                  <TableCell>
                    <StatusChip status={c.status} />
                  </TableCell>
                  <TableCell align="right">
                    <Button size="small" component={RouterLink} to={`/teacher/courses/${c._id}`}>
                      View
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </>
  );
}
