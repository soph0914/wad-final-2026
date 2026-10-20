// src/components/StatusChip.jsx

import { Chip } from "@mui/material";

const COLORS = { Open: "success", Close: "warning", Cancel: "error" };

export default function StatusChip({ status }) {
  return <Chip size="small" label={status} color={COLORS[status] || "default"} />;
}
