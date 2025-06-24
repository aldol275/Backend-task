const express = require("express")
const router = express.Router();
const bcrypt = require("bcrypt")
const User = require("../Models/userModel")
const Course = require("../Models/coursemodel")
const validate = require("../Middlewares/validToken")
const adminOnly = require("../Middlewares/adminOnly")
const jwt = require("jsonwebtoken")
require('dotenv').config()


// testing
router.route("/get").get(async (req,res)=>{
    const all_user = await User.find({})
    res.status(200).json(all_user)
})


/**
 * @swagger
 * /api/users/register:
 *   post:
 *     summary: Register a new user
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *               - password
 *             properties:
 *               name:
 *                 type: string
 *                 example: Aryan Solanki
 *               email:
 *                 type: string
 *                 example: aryan@example.com
 *               password:
 *                 type: string
 *                 example: password123
 *     responses:
 *       201:
 *         description: User successfully registered
 *       400:
 *         description: Bad request - missing fields or email already registered
 */

router.route("/register").post(async (req,res)=>{
    const {name, email, password} = req.body;

    if(!name || !email || !password){
        res.status(400);
        throw new Error("all fields mandatory")
    }

    const userAvailable = await User.findOne({email});

    if(userAvailable){
        res.status(400)
        throw new Error("already registered")
    }
    else{
        const hashedPassword = await bcrypt.hash(password,10);
        const newUser = await User.create({
            name,
            email,
            password: hashedPassword,
        })

        if(newUser){
            res.status(201).json({_id: newUser.id, name:newUser.name})
        }

        else{
            throw new Error("invalid user")
        }
    }

})




/**
 * @swagger
 * /api/users/login:
 *   post:
 *     summary: Login a user and return a JWT token
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 example: admin@example.com
 *               password:
 *                 type: string
 *                 example: admin123
 *     responses:
 *       200:
 *         description: Successfully logged in
 *       400:
 *         description: Invalid email or password
 */

router.route("/login").post(async (req, res) => {
  const {email, password} = req.body;

  if (!email || !password) {
    throw new Error("User not found");
  }

  // If it's admin,we compare directly
  if (
    email === process.env.ADMIN_EMAIL &&
    password === process.env.ADMIN_PASSWORD
  ) {
    const accessToken = jwt.sign(
      {
        user: {
          name: "Admin",
          email,
          id: "admin-env",
          role: "Admin"
        },
      },
      process.env.JWT_SECRET,
      { expiresIn: "30m" }
    );

    return res.json({
      accessToken,
      message: "Login successful as Admin"
    });
  }

  // Otherwise, proceed with normal DB user login
  const user = await User.findOne({ email });

  if (user && (await bcrypt.compare(password, user.password))) {
    const accessToken = jwt.sign(
      {
        user: {
          name: user.name,
          email: user.email,
          id: user.id,
          role: user.role || "User"
        },
      },
      process.env.JWT_SECRET,
      { expiresIn: "30m" }
    );

    res.json({
      accessToken,
      message: `Login successful as ${user.role || "User"}`
    });
  } else {
    throw new Error("Invalid email or password");
  }
});



// get all courses
router.route("/courses").get(async (req,res)=>{
    const all_courses = await Course.find({})
    res.status(200).json(all_courses)
})



//enroll into course
/**
 * @swagger
 * /api/users/enroll/{courseCode}:
 *   post:
 *     summary: Enroll the authenticated user in a course
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: courseCode
 *         required: true
 *         schema:
 *           type: string
 *         description: Course code to enroll in (e.g., JS102)
 *     responses:
 *       200:
 *         description: Successfully enrolled
 *       400:
 *         description: Already enrolled or bad request
 *       401:
 *         description: Unauthorized
 */



router.route("/enroll/:courseCode").post(validate, async (req, res) => {
  const courseCode = req.params.courseCode;
  const userId = req.user.id;

  try {
    const course = await Course.findOne({ courseId: courseCode });
    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check if already enrolled
    const alreadyEnrolled = user.enrolledCourses.some(
      (c) => c.courseId === course.courseId
    );
    if (alreadyEnrolled) {
      return res.status(400).json({ message: "Already enrolled in this course" });
    }

    // Add course with progress: 0
    user.enrolledCourses.push({ courseId: course.courseId, progress: 0 });
    await user.save();

    res.status(200).json({ message: `Enrolled in ${course.courseId}`, enrolledCourses: user.enrolledCourses });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});


//unenroll from course
/**
 * @swagger
 * /api/users/unenroll/{courseCode}:
 *   delete:
 *     summary: Unenroll the authenticated user from a course
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: courseCode
 *         required: true
 *         schema:
 *           type: string
 *         description: Course code to unenroll from (e.g., JS102)
 *     responses:
 *       200:
 *         description: Successfully unenrolled
 *       400:
 *         description: Not enrolled or bad request
 *       401:
 *         description: Unauthorized
 */



router.route("/unenroll/:courseCode").delete(validate, async (req, res) => {
  const courseCode = req.params.courseCode;
  const userId = req.user.id;

  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check if the course with this code exists
    const course = await Course.findOne({ courseId: courseCode });
    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    // Check if user is enrolled in that course
    const isEnrolled = user.enrolledCourses.some(
      (c) => c.courseId === course.courseId
    );
    if (!isEnrolled) {
      return res.status(400).json({ message: "User is not enrolled in this course" });
    }

    // Remove the course from enrolledCourses array
    user.enrolledCourses = user.enrolledCourses.filter(
      (c) => c.courseId !== course.courseId
    );

    await user.save();

    res.status(200).json({ message: `Successfully unenrolled from course ${courseCode}` });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});


// see the progress

/**
 * @swagger
 * /api/users/courses/{id}:
 *   get:
 *     summary: Get progress of the user in a specific course
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Course ID (e.g., CSE101)
 *     responses:
 *       200:
 *         description: Successfully retrieved progress
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 courseId:
 *                   type: string
 *                   example: "CSE101"
 *                 progress:
 *                   type: integer
 *                   example: 40
 *       401:
 *         description: Unauthorized (JWT missing or invalid)
 *       404:
 *         description: Course not found in user's enrolled list
 */


router.route("/courses/:id").get(validate, async (req, res) => {
  const courseId = req.params.id;      
  const userId = req.user.id;          

  try {
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Find the course progress entry
    const courseProgress = user.enrolledCourses.find(
      (course) => course.courseId === courseId
    );

    if (!courseProgress) {
      return res.status(404).json({ message: `User is not enrolled in course ${courseId}` });
    }

    res.status(200).json({
      courseId: courseProgress.courseId,
      progress: courseProgress.progress
    });

  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

/**
 * @swagger
 * /api/users/add:
 *   post:
 *     summary: Add a new course (Admin only)
 *     tags: [Courses]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - courseId
 *               - name
 *             properties:
 *               courseId:
 *                 type: string
 *                 example: "NODE201"
 *               name:
 *                 type: string
 *                 example: "Node.js for Backend Development"
 *     responses:
 *       201:
 *         description: Course successfully added
 *       400:
 *         description: Missing or invalid data
 *       401:
 *         description: Unauthorized (not logged in)
 *       403:
 *         description: Forbidden (not an admin)
 */

router.route("/add").post(validate, adminOnly, async (req, res) => {
  const { courseId, name } = req.body;

  if (!courseId || !name) {
    return res.status(400).json({ message: "Please provide courseId and name" });
  }

  try {
    const existing = await Course.findOne({ courseId });
     if(existing) {
       return res.status(400).json({ message: "Course with this ID already exists" });
    }

    const newCourse = await Course.create({ courseId, name });

    res.status(201).json({
      message: "Course added successfully",
      course: newCourse
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

module.exports = router;