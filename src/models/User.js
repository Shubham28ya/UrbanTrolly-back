import mongoose from 'mongoose';
import bcrypt from 'bcrypt';


const userRegistrationSchema = new mongoose.Schema({
  userId:{type:Number},
  name:  { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  isEmailVerified: { type: Boolean, default: false },
  password: {
    type: String,
    required: function () { return this.authProvider === 'local'; }
  },
  number: {
    type: String,
    required: function () { return this.authProvider === 'local'; }
  },
  location: {
    type: String,
    required: function () { return this.authProvider === 'local'; }
  },
  otpCode: { type: String },
  otpExpire: { type: Date },
  resetPasswordToken: { type: String },
  resetPasswordExpire: { type: Date },
  authProvider: { type: String, enum: ['local', 'google'], default: 'local' },

}, { timestamps: true });
// Pre-save middleware to hash password
userRegistrationSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (err) {
    next(err);
  }
});

export default mongoose.model('UserRegistration', userRegistrationSchema);


