//src/app/api/course/route.js

import { getDb } from "@/lib/mongodb";
import { getUserFromHeaders } from "@/lib/auth";
import { COURSE_CANCEL, ROLE_STUDENT, ROLE_TEACHER } from "@/lib/constant";
import {
  parseCourseInput,
  studentCoursePipeline,
  teacherCourseView,
  toObjectId,
} from "@/lib/course";
import { errorResponse, printExceptionLog, successResponse } from "@/lib/utils";

// GET /api/course
//  teacher -> only their own courses
//  student -> every course except Cancel
//             ?search=<part of course name or teacher name>
//             ?enrolled=true -> only the courses the student is enrolled in
export async function GET(req) {
  try {
    const me = getUserFromHeaders(req);
    const db = await getDb();
    const courses = db.collection("courses");
    const meId = toObjectId(me.id);

    if (me.role === ROLE_TEACHER) {
      const list = await courses
        .find({ teacherId: meId })
        .sort({ createdAt: -1 })
        .toArray();
      return successResponse(list.map(teacherCourseView), 200);
    }

    if (me.role === ROLE_STUDENT) {
      const { searchParams } = new URL(req.url);
      const search = searchParams.get("search") || "";
      const enrolledOnly = searchParams.get("enrolled") === "true";

      // Cancelled courses never appear in the browse list. In "my courses"
      // an enrolled student still sees them (marked Cancel).
      const match = enrolledOnly
        ? { students: meId }
        : { status: { $ne: COURSE_CANCEL } };

      const list = await courses
        .aggregate(studentCoursePipeline(meId, match, search))
        .toArray();
      return successResponse(list, 200);
    }

    return errorResponse("Forbidden", 403);
  } catch (error) {
    printExceptionLog("GET /api/course", error);
    return errorResponse("Internal server error", 500);
  }
}

// POST /api/course -> only teachers can create a course
export async function POST(req) {
  try {
    const me = getUserFromHeaders(req);
    if (me.role !== ROLE_TEACHER) {
      return errorResponse("Only teachers can create courses", 403);
    }

    const body = await req.json().catch(() => null);
    const { error, data } = parseCourseInput(body);
    if (error) {
      return errorResponse(error, 400);
    }

    const db = await getDb();
    const doc = {
      ...data,
      teacherId: toObjectId(me.id),
      students: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    const result = await db.collection("courses").insertOne(doc);

    return successResponse(
      teacherCourseView({ ...doc, _id: result.insertedId }),
      201,
    );
  } catch (error) {
    printExceptionLog("POST /api/course", error);
    return errorResponse("Internal server error", 500);
  }
}
