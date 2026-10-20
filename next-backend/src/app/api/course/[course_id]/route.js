//src/app/api/course/[course_id]/route.js

import { getDb } from "@/lib/mongodb";
import { getUserFromHeaders } from "@/lib/auth";
import { COURSE_CANCEL, ROLE_STUDENT, ROLE_TEACHER } from "@/lib/constant";
import {
  isValidId,
  parseCourseInput,
  studentCoursePipeline,
  teacherCourseView,
  toObjectId,
} from "@/lib/course";
import { errorResponse, printExceptionLog, successResponse } from "@/lib/utils";

// GET /api/course/:course_id
//  teacher -> only their own course, including the enrolled students
//  student -> course details (404 for Cancel courses unless already enrolled)
export async function GET(req, { params }) {
  try {
    const { course_id } = await params;
    const me = getUserFromHeaders(req);

    if (!isValidId(course_id)) {
      return errorResponse("Invalid course id", 400);
    }

    const db = await getDb();
    const courseId = toObjectId(course_id);
    const meId = toObjectId(me.id);

    if (me.role === ROLE_TEACHER) {
      const course = await db.collection("courses").findOne({ _id: courseId });
      if (!course) return errorResponse("Course not found", 404);
      if (!course.teacherId.equals(meId)) {
        return errorResponse("You can only view your own courses", 403);
      }

      const students = await db
        .collection("users")
        .find(
          { _id: { $in: course.students } },
          { projection: { username: 1, email: 1 } },
        )
        .toArray();

      return successResponse(
        {
          ...teacherCourseView(course),
          students: students.map((s) => ({
            id: s._id.toString(),
            username: s.username,
            email: s.email,
          })),
        },
        200,
      );
    }

    if (me.role === ROLE_STUDENT) {
      const [course] = await db
        .collection("courses")
        .aggregate(studentCoursePipeline(meId, { _id: courseId }))
        .toArray();

      if (!course) return errorResponse("Course not found", 404);
      if (course.status === COURSE_CANCEL && !course.isEnrolled) {
        return errorResponse("Course not found", 404);
      }
      return successResponse(course, 200);
    }

    return errorResponse("Forbidden", 403);
  } catch (error) {
    printExceptionLog("GET /api/course/[course_id]", error);
    return errorResponse("Internal server error", 500);
  }
}

// PUT /api/course/:course_id -> teacher updates their own course
async function updateCourse(req, { params }) {
  try {
    const { course_id } = await params;
    const me = getUserFromHeaders(req);

    if (me.role !== ROLE_TEACHER) {
      return errorResponse("Only teachers can update courses", 403);
    }
    if (!isValidId(course_id)) {
      return errorResponse("Invalid course id", 400);
    }

    const body = await req.json().catch(() => null);
    const { error, data } = parseCourseInput(body);
    if (error) {
      return errorResponse(error, 400);
    }

    const db = await getDb();
    const courses = db.collection("courses");
    const courseId = toObjectId(course_id);

    const course = await courses.findOne({ _id: courseId });
    if (!course) return errorResponse("Course not found", 404);
    if (!course.teacherId.equals(toObjectId(me.id))) {
      return errorResponse("You can only update your own courses", 403);
    }
    if (data.maxStudent < course.students.length) {
      return errorResponse(
        `Max student cannot be lower than the ${course.students.length} student(s) already enrolled`,
        400,
      );
    }

    await courses.updateOne(
      { _id: courseId, teacherId: course.teacherId },
      { $set: { ...data, updatedAt: new Date() } },
    );

    const updated = await courses.findOne({ _id: courseId });
    return successResponse(teacherCourseView(updated), 200);
  } catch (error) {
    printExceptionLog("PUT /api/course/[course_id]", error);
    return errorResponse("Internal server error", 500);
  }
}

export const PUT = updateCourse;
export const PATCH = updateCourse;

// DELETE /api/course/:course_id -> own course, only when nobody is enrolled
export async function DELETE(req, { params }) {
  try {
    const { course_id } = await params;
    const me = getUserFromHeaders(req);

    if (me.role !== ROLE_TEACHER) {
      return errorResponse("Only teachers can delete courses", 403);
    }
    if (!isValidId(course_id)) {
      return errorResponse("Invalid course id", 400);
    }

    const db = await getDb();
    const courses = db.collection("courses");
    const courseId = toObjectId(course_id);
    const meId = toObjectId(me.id);

    // The "students.0 does not exist" condition makes the check and the
    // delete one atomic step, so a student cannot enroll in between.
    const result = await courses.deleteOne({
      _id: courseId,
      teacherId: meId,
      "students.0": { $exists: false },
    });
    if (result.deletedCount === 1) {
      return successResponse({ message: "Course deleted" }, 200);
    }

    const course = await courses.findOne({ _id: courseId });
    if (!course) return errorResponse("Course not found", 404);
    if (!course.teacherId.equals(meId)) {
      return errorResponse("You can only delete your own courses", 403);
    }
    return errorResponse(
      "Cannot delete a course that already has enrolled students",
      409,
    );
  } catch (error) {
    printExceptionLog("DELETE /api/course/[course_id]", error);
    return errorResponse("Internal server error", 500);
  }
}
