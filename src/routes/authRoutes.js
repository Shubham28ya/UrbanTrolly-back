import express from 'express';
import register from '../controllers/AuthController.js'; // Make sure the path is correct!

const router = express.Router();

// Your route
router.post('/register', register);

export default router;

