// src/utils/paths.js

// Where each role lands after login.
export function homePathFor(role) {
  return role === "teacher" ? "/teacher/courses" : "/courses";
}
