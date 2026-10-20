//src/app/api/course/[course_id]/enroll/route.js

import { getDb } from "@/lib/mongodb";
import { getUserFromHeaders } from "@/lib/auth";
import { COURSE_CANCEL, COURSE_OPEN, ROLE_STUDENT } from "@/lib/constant";
import { isValidId, toObjectId } from "@/lib/course";
import { errorResponse, printExceptionLog, successResponse } from "@/lib/utils";

// POST /api/course/:course_id/enroll
// Enrolls the logged-in student. All business rules are checked here:
//  - only students
//  - course status must be Open
//  - not enrolled already
//  - seats left according to maxStudent
export async function POST(req, { params }) {
  try {
    const { course_id } = await params;
    const me = getUserFromHeaders(req);

    if (me.role !== ROLE_STUDENT) {
      return errorResponse("Only students can enroll in courses", 403);
    }
    if (!isValidId(course_id)) {
      return errorResponse("Invalid course id", 400);
    }

    const db = await getDb();
    const courses = db.collection("courses");
    const courseId = toObjectId(course_id);
    const meId = toObjectId(me.id);

    // One atomic update: every rule is part of the filter, so two students
    // taking the last seat at the same time cannot both succeed.
    const result = await courses.updateOne(
      {
        _id: courseId,
        status: COURSE_OPEN,
        students: { $ne: meId },
        $expr: { $lt: [{ $size: "$students" }, "$maxStudent"] },
      },
      { $addToSet: { students: meId }, $set: { updatedAt: new Date() } },
    );

    if (result.modifiedCount === 1) {
      return successResponse({ message: "Enrolled successfully" }, 200);
    }

    // Nothing changed: work out which rule failed to return a clear message.
    const course = await courses.findOne({ _id: courseId });
    if (!course || course.status === COURSE_CANCEL) {
      return errorResponse("Course not found", 404);
    }
    if (course.students.some((s) => s.equals(meId))) {
      return errorResponse("You are already enrolled in this course", 409);
    }
    if (course.status !== COURSE_OPEN) {
      return errorResponse("This course is closed for enrollment", 409);
    }
    return errorResponse("This course is full", 409);
  } catch (error) {
    printExceptionLog("POST /api/course/[course_id]/enroll", error);
    return errorResponse("Internal server error", 500);
  }
}
