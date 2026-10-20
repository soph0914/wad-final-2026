// scripts/seed.mjs
// Creates the test users and a few sample courses. Safe to run more than once.
//   npm run seed          (reads MONGODB_URI from .env.local)

import { MongoClient } from "mongodb";
import bcrypt from "bcrypt";

const uri = process.env.MONGODB_URI;
if (!uri) {
  console.error("MONGODB_URI is not set (put it in .env.local)");
  process.exit(1);
}

const TEACHER_PASSWORD = "Teacher@123";
const STUDENT_PASSWORD = "Student@123";

const users = [
  { username: "teacher1", email: "teacher1@test.com", role: "teacher", password: TEACHER_PASSWORD },
  { username: "teacher2", email: "teacher2@test.com", role: "teacher", password: TEACHER_PASSWORD },
  { username: "teacher3", email: "teacher3@test.com", role: "teacher", password: TEACHER_PASSWORD },
  { username: "student1", email: "student1@test.com", role: "student", password: STUDENT_PASSWORD },
  { username: "student2", email: "student2@test.com", role: "student", password: STUDENT_PASSWORD },
  { username: "student3", email: "student3@test.com", role: "student", password: STUDENT_PASSWORD },
];

const courses = [
  { teacher: "teacher1", name: "Web Development Basics", duration: 30, topics: ["HTML", "CSS", "JavaScript"], price: 1500, maxStudent: 30, status: "Open" },
  { teacher: "teacher1", name: "Advanced React", duration: 20, topics: ["Hooks", "Context", "Routing"], price: 2500, maxStudent: 2, status: "Open" },
  { teacher: "teacher1", name: "Intro to Databases", duration: 15, topics: ["SQL", "MongoDB"], price: 1200, maxStudent: 25, status: "Close" },
  { teacher: "teacher2", name: "Node.js and APIs", duration: 25, topics: ["Express", "REST", "Authentication"], price: 2000, maxStudent: 20, status: "Open" },
  { teacher: "teacher2", name: "Next.js in Practice", duration: 18, topics: ["Routing", "API Routes", "Deployment"], price: 2200, maxStudent: 15, status: "Open" },
  { teacher: "teacher3", name: "Cloud Deployment", duration: 10, topics: ["Vercel", "Environment Variables"], price: 900, maxStudent: 40, status: "Open" },
  { teacher: "teacher3", name: "Legacy PHP (Cancelled)", duration: 12, topics: ["PHP", "MySQL"], price: 700, maxStudent: 20, status: "Cancel" },
];

const client = new MongoClient(uri);
try {
  await client.connect();
  const db = await client.db(process.env.MONGODB_DB || "online_course");
  const usersCol = db.collection("users");
  const coursesCol = db.collection("courses");

  await usersCol.createIndex({ email: 1 }, { unique: true });
  await usersCol.createIndex({ username: 1 }, { unique: true });

  const idByUsername = {};
  for (const u of users) {
    const passwordHash = await bcrypt.hash(u.password, 10);
    await usersCol.updateOne(
      { email: u.email },
      {
        $set: { username: u.username, role: u.role, password: passwordHash },
        $setOnInsert: { createdAt: new Date() },
      },
      { upsert: true },
    );
    const doc = await usersCol.findOne({ email: u.email });
    idByUsername[u.username] = doc._id;
  }

  for (const c of courses) {
    const { teacher, ...fields } = c;
    // $setOnInsert for students keeps existing enrollments when re-seeding.
    await coursesCol.updateOne(
      { name: c.name, teacherId: idByUsername[teacher] },
      {
        $set: { ...fields, teacherId: idByUsername[teacher], updatedAt: new Date() },
        $setOnInsert: { students: [], createdAt: new Date() },
      },
      { upsert: true },
    );
  }

  console.log(`Seeded ${users.length} users and ${courses.length} courses.`);
} finally {
  await client.close();
}
