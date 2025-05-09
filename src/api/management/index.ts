import { Router, NextFunction } from 'express';
import requestsRouter from './requests';
import hotelRouter from './hotel';
import feedbackRouter from './feedback';
import messagesRouter from './messages';
import employeesRouter from './employees';
import diningRouter from './dining';
import reservationRequestsRouter from './reservation-requests';
import generalRouter from './general';
import specialProductsRouter from './specialProducts';
// Add import for housekeeping types router
import housekeepingTypesRouter from './housekeeping-types';
import pricesRouter from './prices';
// Removing imports for files we deleted
// import employeesRoutes from './employees';
import { asyncHandler } from '../../middleware/errorHandler';

const router = Router();

// Welcome message for the Management API
router.get('/', asyncHandler(async (req, res, next) => {
  res.json({ message: 'Welcome to the SelfServe Management API' });
}));

// All management routes will be implemented in the future
// For now, we only have the welcome route and requests routes

// Management request routes
router.use('/requests', requestsRouter);

// Hotel data routes
router.use('/hotel', hotelRouter);

// Guest feedback routes
router.use('/feedback', feedbackRouter);

// Messages and announcements routes
router.use('/messages', messagesRouter);

// Employee management routes
router.use('/employees', employeesRouter);

// Specialized request routes
router.use('/dining', diningRouter);
router.use('/reservation-requests', reservationRequestsRouter);
router.use('/general', generalRouter);

// Special products routes
router.use('/special-products', specialProductsRouter);

// Housekeeping types routes
router.use('/housekeeping/types', housekeepingTypesRouter);

// Prices routes
router.use('/prices', pricesRouter);

// router.use('/auth', authRoutes);
// router.use('/data', dataRoutes);
// router.use('/analytics', analyticsRoutes);
// router.use('/communication', communicationRoutes);

export default router; 