import { Router } from 'express';
// Removing auth router import since Clerk handles authentication
import profileRouter from './profile';
import generalRequestsRouter from './general-requests';
import diningRequestsRouter from './dining-requests';
import reservationRequestsRouter from './reservation-requests';
import messagesRouter from './messages';
import feedbackRouter from './feedback';
import hotelRouter from './hotel';
// We're removing these imports since we haven't fully implemented them yet
// import authRoutes from './auth';
// import diningRoutes from './dining';
// import servicesRoutes from './services';
// router.use('/amenities', amenitiesRoutes);
// router.use('/feedback', feedbackRoutes);
// router.use('/notifications', notificationsRoutes);
// router.use('/preferences', preferencesRoutes);

const router = Router();

/**
 * Guest Profile Management
 * - Get profile, update preferences, manage dietary restrictions
 */
router.use('/profile', profileRouter);

/**
 * General Requests API
 * - List, create, get details, and cancel general requests
 */
router.use('/general-requests', generalRequestsRouter);

/**
 * Dining Requests API
 * - List, create, get details, and cancel dining requests
 */
router.use('/dining-requests', diningRequestsRouter);

/**
 * Reservation Requests API
 * - List, create, get details, and cancel reservation requests
 */
router.use('/reservation-requests', reservationRequestsRouter);

/**
 * Guest Messaging API
 * - List, get details for messages and announcements
 */
router.use('/messages', messagesRouter);

/**
 * Guest Feedback API
 * - Submit and retrieve feedback and ratings
 */
router.use('/feedback', feedbackRouter);

/**
 * Hotel Information API
 * - Get hotel details, amenities, policies, etc.
 */
router.use('/hotel', hotelRouter);

// These will be implemented later
// router.use('/auth', authRoutes);
// router.use('/dining', diningRoutes);
// router.use('/services', servicesRoutes);

export default router; 