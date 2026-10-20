# How to Test the App

## Student Information

- **Student Name:** Lin Lin Wai
- **Student ID:** 6643008

## Links

- **Frontend (deployed):** https://wad-final-2026-4vdd.vercel.app
- **Backend (deployed):** https://wad-final-2026.vercel.app
- **Frontend repository:** https://github.com/soph0914/wad-final-2026.git
- **Backend repository:** https://github.com/soph0914/wad-final-2026.git
- **Screen recording:** https://assumptionuniversity-my.sharepoint.com/personal/u6643008_au_edu/_layouts/15/stream.aspx?id=%2Fpersonal%2Fu6643008%5Fau%5Fedu%2FDocuments%2FRecordings%2FMeeting%20with%20LIN%20LIN%20WAI%20%2D%2D20261020%5F100522%2DMeeting%20Recording%2Emp4&referrer=StreamWebApp%2EWeb&
referrerScenario=AddressBarCopied%2Eview%2E7fb1dd5e%2D739e%2D4031%2D88ad%2Dc842d771766f

https://assumptionuniversity-my.sharepoint.com/personal/u6643008_au_edu/_layouts/15/stream.aspx?id=%2Fpersonal%2Fu6643008%5Fau%5Fedu%2FDocuments%2FRecordings%2FMeeting%20with%20LIN%20LIN%20WAI%20%2D%2D20261020%5F111014%2DMeeting%20Recording%2Emp4&referrer=StreamWebApp%2EWeb&referrerScenario=AddressBarCopied%2Eview%2Ebfb96f07%2D0c3e%2D49ba%2Da2a8%2D18c559faff21

https://assumptionuniversity-my.sharepoint.com/personal/u6643008_au_edu/_layouts/15/stream.aspx?id=%2Fpersonal%2Fu6643008%5Fau%5Fedu%2FDocuments%2FRecordings%2FMeeting%20with%20LIN%20LIN%20WAI%20%2D%2D20261020%5F120612%2DMeeting%20Recording%2Emp4&referrer=StreamWebApp%2EWeb&referrerScenario=AddressBarCopied%2Eview%2E05b143a6%2D7fa4%2D4df6%2Dba0b%2Da67fd26b68aa



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
