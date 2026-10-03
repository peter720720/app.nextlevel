const mongoose = require('mongoose');
const User = require('../models/User');
const School = require('../models/School');
const Attendance = require('../models/Attendance');

const studentClasses = [
  'Pre-nursery',
  'Nursery 1',
  'Nursery 2',
  'Nursery 3',
  'Primary 1',
  'Primary 2',
  'Primary 3',
  'Primary 4',
  'Primary 5',
  'Primary 6',
  'JSS 1',
  'JSS 2',
  'JSS 3',
  'SS1 - Science',
  'SS1 - Arts',
  'SS1 - Commercial',
  'SS2 - Science',
  'SS2 - Arts',
  'SS2 - Commercial',
  'SS3 - Science',
  'SS3 - Arts',
  'SS3 - Commercial',
];

exports.getDashboardStats = async (req, res) => {
  try {
    const schoolId = req.user.schoolId;
    const school = await School.findById(schoolId).select('subscriptionExpiresAt planPackage');
    if (!school) {
      return res.status(404).json({ success: false, message: 'School profile not found.' });
    }

    const [teacherAdminCount, studentCount] = await Promise.all([
      User.countDocuments({
        schoolId,
        role: { $in: ['admin', 'teacher'] },
        _id: { $ne: req.user._id }
      }),
      User.countDocuments({ schoolId, role: 'student' })
    ]);

    const birthdayUsers = await User.find({
      schoolId,
      role: { $in: ['admin', 'teacher', 'student', 'parent'] },
      dateOfBirth: { $type: 'date' }
    }).select('firstName middleName lastName email phone role className parentEmail profilePicture dateOfBirth');

    const today = new Date();
    const todayUtc = Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate());
    const todayBirthdays = [];
    const upcomingBirthdays = [];

    birthdayUsers.forEach((user) => {
      const dateOfBirth = new Date(user.dateOfBirth);
      let nextBirthday = Date.UTC(today.getUTCFullYear(), dateOfBirth.getUTCMonth(), dateOfBirth.getUTCDate());
      if (nextBirthday < todayUtc) {
        nextBirthday = Date.UTC(today.getUTCFullYear() + 1, dateOfBirth.getUTCMonth(), dateOfBirth.getUTCDate());
      }
      const daysUntil = Math.round((nextBirthday - todayUtc) / (24 * 60 * 60 * 1000));
      const birthday = {
        id: user._id,
        firstName: user.firstName,
        middleName: user.middleName,
        lastName: user.lastName,
        email: user.email,
        phone: user.phone,
        role: user.role,
        className: user.className,
        parentEmail: user.parentEmail,
        profilePicture: user.profilePicture,
        dateOfBirth: user.dateOfBirth,
        daysUntil
      };

      if (daysUntil === 0) todayBirthdays.push(birthday);
      else if (daysUntil <= 30) upcomingBirthdays.push(birthday);
    });
    upcomingBirthdays.sort((left, right) => left.daysUntil - right.daysUntil);

    const millisecondsRemaining = school.subscriptionExpiresAt
      ? new Date(school.subscriptionExpiresAt).getTime() - Date.now()
      : 0;
    const daysLeft = Math.max(0, Math.ceil(millisecondsRemaining / (24 * 60 * 60 * 1000)));

    res.json({
      success: true,
      data: {
        teacherAdminCount,
        studentCount,
        daysLeft,
        usedSpaceMb: 0,
        planPackage: school.planPackage,
        todayBirthdays,
        upcomingBirthdays
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

exports.createTeacher = async (req, res) => {
  try {
    const { firstName, lastName, email, password, dateOfBirth, phone } = req.body;
    const teacher = await User.create({
      schoolId: req.user.schoolId,
      firstName, lastName, email, password, phone, dateOfBirth: dateOfBirth || null, role: 'teacher'
    });
    const safeTeacher = teacher.toObject();
    delete safeTeacher.password;
    res.status(201).json({ success: true, data: safeTeacher });
  } catch (err) { res.status(400).json({ success: false, error: err.message }); }
};

exports.createSchoolAdmin = async (req, res) => {
  try {
    const { firstName, lastName, email, password, dateOfBirth, phone } = req.body;
    const admin = await User.create({
      schoolId: req.user.schoolId,
      firstName, lastName, email, password, phone, dateOfBirth: dateOfBirth || null, role: 'admin'
    });
    const safeAdmin = admin.toObject();
    delete safeAdmin.password;
    res.status(201).json({ success: true, data: safeAdmin });
  } catch (err) { res.status(400).json({ success: false, error: err.message }); }
};

exports.getTeacherAdmins = async (req, res) => {
  try {
    const users = await User.find({
      schoolId: req.user.schoolId,
      role: { $in: ['admin', 'teacher'] }
    })
      .select('firstName middleName lastName email phone role dateOfBirth profilePicture isActive createdAt')
      .sort({ createdAt: -1, lastName: 1 });

    res.json({ success: true, data: users });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

exports.createStudent = async (req, res) => {
  try {
    const {
      firstName, middleName, lastName, email, password, parentIds, parentEmail,
      className, dateOfBirth, studentNumber, homeAddress, stateOfOrigin,
      previousSchool, emergencyContact, parentTitle, parentFullName, parentPhone, parentOccupation,
      allergies, medicalRecords, specialLearningRequirements
    } = req.body;
    if (!studentClasses.includes(className)) {
      return res.status(400).json({ success: false, message: 'Select a valid student class.' });
    }
    const student = await User.create({
      schoolId: req.user.schoolId,
      firstName,
      middleName,
      lastName,
      email,
      password,
      role: 'student',
      className,
      parentEmail,
      dateOfBirth: dateOfBirth || null,
      studentNumber,
      homeAddress,
      stateOfOrigin,
      previousSchool,
      emergencyContact,
      parentTitle,
      parentFullName,
      parentPhone,
      parentOccupation,
      allergies,
      medicalRecords,
      specialLearningRequirements,
      parents: parentIds || []
    });
    if (parentIds && parentIds.length > 0) {
      await User.updateMany(
        { _id: { $in: parentIds }, schoolId: req.user.schoolId, role: 'parent' },
        { $addToSet: { children: student._id } }
      );
    }
    res.status(201).json({
      success: true,
      data: {
        id: student._id,
        firstName: student.firstName,
        middleName: student.middleName,
        lastName: student.lastName,
        email: student.email,
        className: student.className,
        parentEmail: student.parentEmail,
        studentNumber: student.studentNumber,
        homeAddress: student.homeAddress,
        stateOfOrigin: student.stateOfOrigin,
        previousSchool: student.previousSchool,
        emergencyContact: student.emergencyContact,
        parentTitle: student.parentTitle,
        parentFullName: student.parentFullName,
        parentPhone: student.parentPhone,
        parentOccupation: student.parentOccupation,
        allergies: student.allergies,
        medicalRecords: student.medicalRecords,
        specialLearningRequirements: student.specialLearningRequirements,
        points: student.points,
        level: student.level,
        profilePicture: student.profilePicture,
        dateOfBirth: student.dateOfBirth
      }
    });
  } catch (err) { res.status(400).json({ success: false, error: err.message }); }
};

exports.getStudentsByClass = async (req, res) => {
  try {
    const { className } = req.query;
    if (!studentClasses.includes(className)) {
      return res.status(400).json({ success: false, message: 'Select a valid student class.' });
    }

    const students = await User.find({
      schoolId: req.user.schoolId,
      role: 'student',
      className
    })
      .select('firstName middleName lastName email parentEmail points level profilePicture createdAt')
      .sort({ lastName: 1, firstName: 1 });

    res.json({ success: true, data: students });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

const parseAttendanceDate = (value) => {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
  const date = new Date(`${value}T00:00:00.000Z`);
  return Number.isNaN(date.getTime()) || date.toISOString().slice(0, 10) !== value ? null : date;
};

exports.getClassAttendance = async (req, res) => {
  try {
    const { className } = req.query;
    const date = parseAttendanceDate(req.query.date);
    if (!studentClasses.includes(className) || !date) {
      return res.status(400).json({ success: false, message: 'Select a valid class and attendance date.' });
    }

    const students = await User.find({
      schoolId: req.user.schoolId,
      role: 'student',
      className
    })
      .select('firstName middleName lastName')
      .sort({ lastName: 1, firstName: 1 });

    const records = await Attendance.find({
      schoolId: req.user.schoolId,
      className,
      date,
      studentId: { $in: students.map((student) => student._id) }
    }).select('studentId status');
    const statusByStudentId = new Map(records.map((record) => [String(record.studentId), record.status]));

    res.json({
      success: true,
      data: students.map((student) => ({
        id: student._id,
        firstName: student.firstName,
        middleName: student.middleName,
        lastName: student.lastName,
        status: statusByStudentId.get(String(student._id)) || ''
      }))
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

exports.saveClassAttendance = async (req, res) => {
  try {
    const { className, date: dateValue, records } = req.body;
    const date = parseAttendanceDate(dateValue);
    if (!studentClasses.includes(className) || !date || !Array.isArray(records)) {
      return res.status(400).json({ success: false, message: 'Submit a valid class, date, and attendance list.' });
    }
    if (records.some((record) => (
      !record ||
      !mongoose.isValidObjectId(record.studentId) ||
      !['present', 'absent'].includes(record.status)
    ))) {
      return res.status(400).json({ success: false, message: 'Mark every student present or absent before saving.' });
    }

    const submittedIds = records.map((record) => String(record.studentId));
    if (new Set(submittedIds).size !== submittedIds.length) {
      return res.status(400).json({ success: false, message: 'Each student can only be included once.' });
    }

    const students = await User.find({
      schoolId: req.user.schoolId,
      role: 'student',
      className
    }).select('_id');

    const rosterIds = new Set(students.map((student) => String(student._id)));
    if (
      records.length !== students.length ||
      submittedIds.some((studentId) => !rosterIds.has(studentId))
    ) {
      return res.status(400).json({ success: false, message: 'Mark every student in this class exactly once.' });
    }

    if (records.length) {
      await Attendance.bulkWrite(records.map(({ studentId, status }) => ({
        updateOne: {
          filter: { schoolId: req.user.schoolId, studentId, date },
          update: {
            $set: {
              className,
              status,
              markedBy: req.user._id
            }
          },
          upsert: true
        }
      })));
    }

    res.json({ success: true, message: 'Attendance saved successfully.', savedCount: records.length });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

exports.promoteStudents = async (req, res) => {
  try {
    const { studentIds, className } = req.body;
    if (!Array.isArray(studentIds) || studentIds.length === 0 || !studentClasses.includes(className)) {
      return res.status(400).json({ success: false, message: 'Select students and a valid destination class.' });
    }

    const result = await User.updateMany(
      { _id: { $in: studentIds }, schoolId: req.user.schoolId, role: 'student' },
      { $set: { className } }
    );
    res.json({ success: true, modifiedCount: result.modifiedCount });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

exports.createParent = async (req, res) => {
  try {
    const { firstName, lastName, email, password, dateOfBirth } = req.body;
    const parent = await User.create({
      schoolId: req.user.schoolId,
      firstName, lastName, email, password, dateOfBirth: dateOfBirth || null, role: 'parent'
    });
    res.status(201).json({ success: true, data: parent });
  } catch (err) { res.status(400).json({ success: false, error: err.message }); }
};
