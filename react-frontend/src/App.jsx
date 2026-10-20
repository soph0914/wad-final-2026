//src/App.jsx

import { useContext } from "react";
import { HashRouter, Navigate, Route, Routes } from "react-router-dom";
import { UserContext } from "./context/UserContext";
import Layout from "./components/Layout";
import RoleRoute from "./components/RoleRoute";
import { homePathFor } from "./utils/paths";
import LoginPage from "./pages/LoginPage";
import TeacherCourses from "./pages/TeacherCourses";
import CourseForm from "./pages/CourseForm";
import TeacherCourseDetail from "./pages/TeacherCourseDetail";
import StudentCourses from "./pages/StudentCourses";
import StudentCourseDetail from "./pages/StudentCourseDetail";

function HomeRedirect() {
  const { user } = useContext(UserContext);
  return <Navigate to={homePathFor(user?.role)} replace />;
}

export default function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />

        <Route element={<Layout />}>
          <Route index element={<HomeRedirect />} />

          <Route element={<RoleRoute role="teacher" />}>
            <Route path="/teacher/courses" element={<TeacherCourses />} />
            <Route path="/teacher/courses/new" element={<CourseForm />} />
            <Route path="/teacher/courses/:id" element={<TeacherCourseDetail />} />
            <Route path="/teacher/courses/:id/edit" element={<CourseForm />} />
          </Route>

          <Route element={<RoleRoute role="student" />}>
            <Route path="/courses" element={<StudentCourses />} />
            <Route path="/courses/:id" element={<StudentCourseDetail />} />
            <Route path="/my-courses" element={<StudentCourses enrolledOnly />} />
          </Route>
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </HashRouter>
  );
}
