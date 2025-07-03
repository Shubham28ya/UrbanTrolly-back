import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const AdminUserSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  encryptedPassword: { type: String, required: true },
  role: { type: String, enum: ['admin', 'qc'], required: true },
});

AdminUserSchema.methods.verifyPassword = async function (password) {
  return await bcrypt.compare(password, this.encryptedPassword);
};

export default mongoose.model('AdminUser', AdminUserSchema);
