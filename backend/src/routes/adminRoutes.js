const express = require('express');
const router = express.Router();
const {
  createTeacher,
  createSchoolAdmin,
  createStudent,
  createParent,
  getTeacherAdmins,
  getDashboardStats,
  getStudentsByClass,
  getClassAttendance,
  saveClassAttendance,
  promoteStudents
} = require('../controllers/adminController');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/role');

router.use(protect);
router.use(authorize('admin'));

router.post('/create-teacher', createTeacher);
router.post('/create-admin', createSchoolAdmin);
router.post('/create-student', createStudent);
router.post('/create-parent', createParent);
router.get('/teacher-admins', getTeacherAdmins);
router.get('/dashboard-stats', getDashboardStats);
router.get('/students', getStudentsByClass);
router.get('/attendance', getClassAttendance);
router.post('/attendance', saveClassAttendance);
router.post('/students/promote', promoteStudents);

module.exports = router;
