import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import AdminUser from './src/models/Adminuser.js';

const createAdminUser = async () => {
  await mongoose.connect('mongodb://localhost:27017/Vastram'); // 👈 Replace with your DB name

  const hashedPassword = await bcrypt.hash('shubhamY@28', 10);

  const existing = await AdminUser.findOne({ email: 'theurbantrolly@gmail.com' });
  if (existing) {
    console.log('Admin user already exists.');
  } else {
    const admin = new AdminUser({
      email: 'theurbantrolly@gmail.com',
      encryptedPassword: hashedPassword,
      role: 'admin',
    });
    await admin.save();
    console.log('Admin user created successfully.');
  }

  mongoose.disconnect();
};

createAdminUser();
