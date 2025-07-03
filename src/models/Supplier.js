import mongoose from 'mongoose';
import bcrypt from 'bcrypt';


const supplierRegistrationSchema = new mongoose.Schema({
  userId:{type:Number},
  email: { type: String, required: true, unique: true, lowercase: true },
  role:{type: String},
  isEmailVerified: { type: Boolean, default: false },
  password: {
    type: String,
    required: function () { return this.authProvider === 'local'; }
  },
  number: {
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
supplierRegistrationSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (err) {
    next(err);
  }
});

export default mongoose.model('SupplierRegistration', supplierRegistrationSchema);


