const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
  schoolId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'School',
    required: function () { return this.role !== 'platform_admin'; }
  },
  firstName: { type: String, required: true, trim: true },
  middleName: { type: String, trim: true, default: '' },
  lastName: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['platform_admin', 'admin', 'teacher', 'student', 'parent'], required: true },
  className: {
    type: String,
    trim: true,
    required: function () { return this.role === 'student'; }
  },
  studentNumber: { type: String, trim: true, default: '' },
  homeAddress: { type: String, trim: true, default: '' },
  stateOfOrigin: { type: String, trim: true, default: '' },
  previousSchool: { type: String, trim: true, default: '' },
  emergencyContact: { type: String, trim: true, default: '' },
  parentEmail: { type: String, trim: true, lowercase: true, default: '' },
  parentTitle: { type: String, trim: true, default: '' },
  parentFullName: { type: String, trim: true, default: '' },
  parentPhone: { type: String, trim: true, default: '' },
  parentOccupation: { type: String, trim: true, default: '' },
  allergies: { type: String, trim: true, default: '' },
  medicalRecords: { type: String, trim: true, default: '' },
  specialLearningRequirements: { type: String, trim: true, default: '' },
  dateOfBirth: { type: Date, default: null },
  points: { type: Number, default: 0, min: 0 },
  level: { type: String, trim: true, default: '' },
  phone: { type: String, trim: true, default: '' },
  children: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }], // Populated only if role === parent
  parents: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],   // Populated only if role === student
  isActive: { type: Boolean, default: true },
  profilePicture: { type: String, default: '' }
}, { timestamps: true });

// Auto-encrypt user password hashes prior to database document persistence
UserSchema.pre('save', async function () {
  if (!this.isModified('password')) return;
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

UserSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', UserSchema);
