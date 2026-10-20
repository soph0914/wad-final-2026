// src/lib/course.js
// Helpers shared by the course endpoints.

import { ObjectId } from "mongodb";
import { COURSE_OPEN, COURSE_STATUSES } from "./constant";

export function isValidId(id) {
  return typeof id === "string" && /^[a-f\d]{24}$/i.test(id);
}

export function toObjectId(id) {
  return new ObjectId(id);
}

function escapeRegex(text) {
  return text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

// Validates a create/update body. Returns { error } or { data }.
export function parseCourseInput(body) {
  if (!body || typeof body !== "object") {
    return { error: "Invalid request body" };
  }

  const name = typeof body.name === "string" ? body.name.trim() : "";
  if (!name) return { error: "Course name is required" };

  const duration = Number(body.duration);
  if (!Number.isInteger(duration) || duration < 1) {
    return { error: "Duration must be a whole number of days (1 or more)" };
  }

  let topics = body.topics;
  if (typeof topics === "string") topics = topics.split(",");
  if (!Array.isArray(topics)) return { error: "Topics must be a list" };
  topics = topics
    .map((t) => (typeof t === "string" ? t.trim() : ""))
    .filter(Boolean);
  if (topics.length === 0) return { error: "At least one topic is required" };

  const price = Number(body.price);
  if (body.price === "" || body.price === null || !Number.isFinite(price) || price < 0) {
    return { error: "Price must be a number (0 or more)" };
  }

  const maxStudent = Number(body.maxStudent);
  if (!Number.isInteger(maxStudent) || maxStudent < 1) {
    return { error: "Max student must be a whole number (1 or more)" };
  }

  const status = body.status === undefined ? COURSE_OPEN : body.status;
  if (!COURSE_STATUSES.includes(status)) {
    return { error: "Status must be Open, Close or Cancel" };
  }

  return { data: { name, duration, topics, price, maxStudent, status } };
}

// Course shape returned to students: no student list, with teacher name,
// seat count and whether the current student is enrolled.
export function studentCoursePipeline(userObjectId, match, search) {
  const pipeline = [
    { $match: match },
    {
      $lookup: {
        from: "users",
        localField: "teacherId",
        foreignField: "_id",
        as: "teacher",
      },
    },
    { $unwind: "$teacher" },
    {
      $addFields: {
        teacherName: "$teacher.username",
        enrolledCount: { $size: "$students" },
        isEnrolled: { $in: [userObjectId, "$students"] },
      },
    },
  ];

  const term = typeof search === "string" ? search.trim() : "";
  if (term) {
    const rx = new RegExp(escapeRegex(term), "i");
    pipeline.push({ $match: { $or: [{ name: rx }, { teacherName: rx }] } });
  }

  pipeline.push(
    { $project: { teacher: 0, students: 0, teacherId: 0 } },
    { $sort: { createdAt: -1 } },
  );
  return pipeline;
}

// Course shape returned to the owning teacher.
export function teacherCourseView(course) {
  const { students = [], ...rest } = course;
  return { ...rest, enrolledCount: students.length };
}
