# How to Test the App

## Student Information

- **Student Name:** <FILL IN>
- **Student ID:** <FILL IN>

## Links

- **Frontend (deployed):** <FILL IN>
- **Backend (deployed):** <FILL IN>
- **Frontend repository:** <FILL IN>
- **Backend repository:** <FILL IN>
- **Screen recording:** <FILL IN>

## Test Credentials

Log in with the email (or the username) and the password.

| Role    | Username | Email              | Password      |
| ------- | -------- | ------------------ | ------------- |
| Teacher | teacher1 | teacher1@test.com  | `Teacher@123` |
| Teacher | teacher2 | teacher2@test.com  | `Teacher@123` |
| Teacher | teacher3 | teacher3@test.com  | `Teacher@123` |
| Student | student1 | student1@test.com  | `Student@123` |
| Student | student2 | student2@test.com  | `Student@123` |
| Student | student3 | student3@test.com  | `Student@123` |

## Prerequisites

- Node.js 20 or newer
- A MongoDB database (MongoDB Atlas free tier works)

## How to Run & Test

### 1. Backend Setup (`next-backend/`)

- `cd next-backend && npm install`
- Copy `.env.example` to `.env.local` and set:
  - `MONGODB_URI` – your MongoDB connection string
  - `JWT_SECRET` – any long random string
  - `FRONTEND_URL` – only needed when deployed (the frontend origin, no trailing slash)
- `npm run seed` – creates the 6 test users and some sample courses (safe to run again)
- `npm run dev` – API runs on http://localhost:3000

### 2. Frontend Setup (`react-frontend/`)

- `cd react-frontend && npm install`
- Copy `.env.example` to `.env` and set `VITE_API_URL` (`http://localhost:3000` locally, or the deployed backend URL)
- `npm run dev` – open http://localhost:5173

### 3. Testing Walkthrough

**Teacher (log in as `teacher1@test.com`)**

1. "My Courses" lists only teacher1's courses.
2. Click **Create course**, fill all fields (topics separated by commas), save.
3. Open a course: the details page shows the enrolled students.
4. **Edit** a course and change its status (Open / Close / Cancel).
5. **Delete** works only when nobody is enrolled (the button is disabled otherwise; the API also returns 409).

**Student (log in as `student1@test.com`)**

1. "All Courses" shows every course except Cancel. Search by part of a course name or the teacher name (e.g. `teacher2`).
2. Open a course and click **Enroll**. It works only when the status is Open and seats remain.
3. Try the rules: enroll twice (rejected), enroll in a Close course (rejected), fill "Advanced React" (max 2 students, so student3 gets "course is full").
4. "My Enrolled Courses" shows the courses you joined.

**Rules enforced by the API (not only the UI)**

- No token or an invalid token → `401`.
- A student creating, updating or deleting a course → `403`; a teacher enrolling → `403`.
- A teacher viewing, updating or deleting another teacher's course → `403`.
- Enroll when the course is Close, full, or already joined → `409`; Cancel → `404`.

### API summary

| Method | Path                           | Who      | Purpose                                  |
| ------ | ------------------------------ | -------- | ---------------------------------------- |
| POST   | `/api/auth/login`              | public   | Log in (sets httpOnly cookie)            |
| POST   | `/api/auth/logout`             | public   | Log out                                  |
| POST   | `/api/user`                    | public   | Register                                 |
| GET    | `/api/user`                    | any user | Current user                             |
| GET    | `/api/course`                  | any user | Teacher: own courses. Student: non-Cancel, `?search=`, `?enrolled=true` |
| POST   | `/api/course`                  | teacher  | Create course                            |
| GET    | `/api/course/:id`              | any user | Details (teacher: own only, with students) |
| PUT    | `/api/course/:id`              | teacher  | Update own course                        |
| DELETE | `/api/course/:id`              | teacher  | Delete own course if no students         |
| POST   | `/api/course/:id/enroll`       | student  | Enroll                                   |
