import { Router } from 'express';
import guestRouter from './guest';
import managementRouter from './management';

const router = Router();

// Welcome message for the API
router.get('/', (req, res) => {
  res.json({ message: 'Welcome to the SelfServe API' });
});

// Guest API routes
router.use('/guest', guestRouter);

// Management API routes
router.use('/management', managementRouter);

export default router; 