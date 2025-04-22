import UserRegistration from '../models/User.js';
import Counter from '../models/Counter.js';

 const register = async (req, res) => {
  try {
    const { name, email, password, number, location } = req.body;

    const existing = await UserRegistration.findOne({ email });
    if (existing) return res.status(400).json({ message: 'Email already in use' });

    // Increment the counter for userId
    const counter = await Counter.findOneAndUpdate(
      { name: 'userId' },
      { $inc: { value: 1 } },
      { new: true, upsert: true }
    );

    const user = await UserRegistration.create({
      userId: counter.value,
      name,
      email,
      password,
      number,
      location,
    });

    res.status(201).json({ user });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
export default register;
