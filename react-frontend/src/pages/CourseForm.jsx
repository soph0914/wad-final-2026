// src/pages/CourseForm.jsx
// Create a course (/teacher/courses/new) or edit one (/teacher/courses/:id/edit).

import { useContext, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  MenuItem,
  Paper,
  TextField,
  Typography,
} from "@mui/material";
import { UserContext } from "../context/UserContext";

const EMPTY = {
  name: "",
  duration: "",
  topics: "",
  price: "",
  maxStudent: "",
  status: "Open",
};

export default function CourseForm() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const { api } = useContext(UserContext);
  const navigate = useNavigate();

  const [form, setForm] = useState(EMPTY);
  const [loading, setLoading] = useState(isEdit);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!isEdit) return;
    api(`/api/course/${id}`)
      .then((c) =>
        setForm({
          name: c.name,
          duration: String(c.duration),
          topics: c.topics.join(", "),
          price: String(c.price),
          maxStudent: String(c.maxStudent),
          status: c.status,
        }),
      )
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const set = (field) => (e) => setForm({ ...form, [field]: e.target.value });

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      const payload = {
        name: form.name,
        duration: Number(form.duration),
        topics: form.topics.split(",").map((t) => t.trim()).filter(Boolean),
        price: Number(form.price),
        maxStudent: Number(form.maxStudent),
        status: form.status,
      };
      const saved = isEdit
        ? await api(`/api/course/${id}`, { method: "PUT", body: payload })
        : await api("/api/course", { method: "POST", body: payload });
      navigate(`/teacher/courses/${saved._id}`);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) return <CircularProgress />;

  return (
    <Paper sx={{ p: 3, maxWidth: 600 }}>
      <Typography variant="h5" gutterBottom>
        {isEdit ? "Edit course" : "Create course"}
      </Typography>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <Box component="form" onSubmit={handleSubmit} sx={{ display: "grid", gap: 2 }}>
        <TextField label="Course name" value={form.name} onChange={set("name")} required />
        <TextField
          label="Duration (days)"
          type="number"
          value={form.duration}
          onChange={set("duration")}
          slotProps={{ htmlInput: { min: 1, step: 1 } }}
          required
        />
        <TextField
          label="Topics"
          value={form.topics}
          onChange={set("topics")}
          helperText="Separate multiple topics with commas, e.g. HTML, CSS, JavaScript"
          required
        />
        <TextField
          label="Price"
          type="number"
          value={form.price}
          onChange={set("price")}
          slotProps={{ htmlInput: { min: 0, step: "any" } }}
          required
        />
        <TextField
          label="Max students"
          type="number"
          value={form.maxStudent}
          onChange={set("maxStudent")}
          slotProps={{ htmlInput: { min: 1, step: 1 } }}
          required
        />
        <TextField select label="Status" value={form.status} onChange={set("status")}>
          <MenuItem value="Open">Open</MenuItem>
          <MenuItem value="Close">Close</MenuItem>
          <MenuItem value="Cancel">Cancel</MenuItem>
        </TextField>

        <Box sx={{ display: "flex", gap: 1 }}>
          <Button type="submit" variant="contained" disabled={submitting}>
            {submitting ? "Saving..." : isEdit ? "Save changes" : "Create course"}
          </Button>
          <Button onClick={() => navigate(-1)}>Cancel</Button>
        </Box>
      </Box>
    </Paper>
  );
}
