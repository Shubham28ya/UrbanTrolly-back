// import mongoose from 'mongoose';

// const userSchema = new mongoose.Schema({
//   name: String,
//   email: String,
//   password: String,
//   role: { type: String, enum: ['admin', 'vendor', 'user'], default: 'user' },
// });

// // Use `export default` to export the model
// export default mongoose.model('Service', userSchema);


import mongoose from 'mongoose';
import bcrypt from 'bcrypt';

const userRegistrationSchema = new mongoose.Schema({
  userId: { type: Number, unique: true }, // <-- custom ID

  name: {
    type: String,
    required: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email address'],
  },
  password: {
    type: String,
    required: true,
    minlength: 6,
  },
  number: {
    type: String,
    required: true,
    match: [/^\d{10}$/, 'Please provide a valid 10-digit phone number'],
  },
  location: {
    type: String,
    required: true,
    trim: true,
  },
  role: {
    type: String,
    enum: ['admin', 'vendor', 'user'],
    default: 'user',
  },
}, {
  timestamps: true,
});

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


