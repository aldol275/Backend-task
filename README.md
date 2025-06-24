# Backend-task
#  Learning Progress Tracker API

A backend system built using Node.js, Express, and MongoDB that allows users to register, enroll in courses, track progress, and access analytics. Admins can manage courses. This project also includes secure JWT-based authentication and Swagger documentation.

---

##  Features

- ✅ User Registration and Login with JWT authentication
- 📘 Course Management (Admin only)
- 📥 Enroll / Unenroll from courses
- 📊 Track and View Course Progress
- 🔐 Role-based access control (Admin vs User)
- 📑 API Documentation using Swagger
- 🌱 MongoDB database integration (online/offline)
---

## 🛠️ Tech Stack

- **Backend**: Node.js, Express
- **Database**: MongoDB (Mongoose ODM)
- **Authentication**: JWT (jsonwebtoken), bcrypt
- **Documentation**: Swagger (OpenAPI)
- **Testing**: Thunder Client
---

## 📁 Project Structure
── Models/
│ ├── userModel.js
│ └── courseModel.js
├── Routes/
│ └── userRoute.js
├── Middlewares/
│ ├── validateToken.js
│ └── adminOnly.js
├── .env
├── .gitignore
├── index.js
├── connection.js
├── swagger.js
├── package.json
├── seed.js
├── README.md

Create a `.env` file in the root with the following:

```env
PORT=3002
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=adminpassword


1. Clone the Repository
git clone https://github.com/aldol275/Backend-task.git
cd Backend-task/Server

2. Install Dependencies
npm install

3.Run server
npm run dev

Server will start at: http://localhost:3002
Access Token (JWT)
After logging in, copy the accessToken and paste in Swagger Authorize popup as:
Bearer <accessToken>

Swagger Documentation
Visit:  http://localhost:3002/api-docs
