import { Router, Request, Response, NextFunction } from 'express';
import { eq, and, desc, sql } from 'drizzle-orm';
import { db } from '../../config/db';
import { 
  guestfeedback, 
  feedbacktype,
  feedbackrating,
  feedbackcategory,
  guest
} from '../../models/schema';
import { v4 as uuidv4 } from 'uuid';
import asyncHandler from 'express-async-handler';
import { NotFoundError, ValidationError, DatabaseError } from '../../middleware/errorHandler';

const router = Router();

/**
 * Get all feedback submitted by a guest
 * 
 * @route GET /api/guest/feedback
 * @param {string} guestId - The guest ID
 * @param {string} hotelId - The hotel ID
 * @param {number} page - (Optional) Page number for pagination
 * @param {number} limit - (Optional) Number of items per page
 * @returns {object} List of feedback with pagination metadata
 */
router.get('/', asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const guestId = req.query.guestId as string;
  const hotelId = req.query.hotelId as string;
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;
  
  if (!guestId || !hotelId) {
    return next(new ValidationError('Missing required parameters', [
        { field: 'guestId', message: 'guestId is required'},
        { field: 'hotelId', message: 'hotelId is required'}
    ]));
  }
  
  const offset = (page - 1) * limit;
  
  const feedbackListData = await db
    .select({
      feedbackid: guestfeedback.feedbackid,
      hotelid: guestfeedback.hotelid,
      guestid: guestfeedback.guestid,
      typeid: guestfeedback.typeid,
      message: guestfeedback.message,
      rating: guestfeedback.rating,
      createdat: guestfeedback.createdat,
      typeName: feedbacktype.type,
      typeDescription: feedbacktype.description
    })
    .from(guestfeedback)
    .leftJoin(feedbacktype, eq(guestfeedback.typeid, feedbacktype.typeid))
    .where(and(eq(guestfeedback.guestid, guestId), eq(guestfeedback.hotelid, hotelId)))
    .orderBy(desc(guestfeedback.createdat))
    .limit(limit)
    .offset(offset);
  
  const countResult = await db
    .select({ count: sql<number>`count(${guestfeedback.feedbackid})`.mapWith(Number) })
    .from(guestfeedback)
    .where(and(eq(guestfeedback.guestid, guestId), eq(guestfeedback.hotelid, hotelId)));
  
  const totalCount = countResult[0]?.count ?? 0;
  const totalPages = Math.ceil(totalCount / limit);
  
  const formattedFeedback = feedbackListData.map(fb => ({
    feedbackId: fb.feedbackid,
    type: fb.typeName || 'General',
    typeDescription: fb.typeDescription,
    message: fb.message,
    rating: fb.rating,
    createdAt: fb.createdat
  }));
  
  res.json({
    data: formattedFeedback,
    meta: {
      page,
      limit,
      totalCount,
      totalPages
    }
  });
}));

/**
 * Get feedback categories available for rating
 * 
 * @route GET /api/guest/feedback/categories
 * @returns {object} List of feedback categories
 */
router.get('/categories', asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const categoriesData = await db
    .select({
      categoryId: feedbackcategory.categoryid,
      name: feedbackcategory.name,
      description: feedbackcategory.description
    })
    .from(feedbackcategory)
    .orderBy(feedbackcategory.name);
  
  res.json({ data: categoriesData });
}));

/**
 * Get feedback types available for submission
 * 
 * @route GET /api/guest/feedback/types
 * @returns {object} List of feedback types
 */
router.get('/types', asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const typesData = await db
    .select({
      typeId: feedbacktype.typeid,
      type: feedbacktype.type,
      description: feedbacktype.description
    })
    .from(feedbacktype)
    .orderBy(feedbacktype.type);
  
  res.json({ data: typesData });
}));

/**
 * Submit new feedback
 * 
 * @route POST /api/guest/feedback
 * @param {string} guestId - The guest ID
 * @param {string} hotelId - The hotel ID
 * @param {string} typeId - The feedback type ID
 * @param {string} message - The feedback message
 * @param {number} rating - The rating (1-5)
 * @returns {object} Submitted feedback
 */
router.post('/', asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  // Re-enabled endpoint
  const { guestId, hotelId, typeId, message, rating } = req.body;
  
  if (!guestId || !hotelId || !typeId) {
    return next(new ValidationError('Missing required fields', [
        { field: 'guestId', message: 'guestId is required' },
        { field: 'hotelId', message: 'hotelId is required' },
        { field: 'typeId', message: 'typeId is required' },
    ]));
  }
  
  if (rating !== undefined && (typeof rating !== 'number' || rating < 1 || rating > 5 || !Number.isInteger(rating))) {
    return next(new ValidationError('Overall rating must be an integer between 1 and 5', [{field: 'rating', message: 'Invalid value'}]));
  }
  
  const [existingGuest] = await db.select({ id: guest.guestid }).from(guest).where(eq(guest.guestid, guestId)).limit(1);
  if (!existingGuest) {
    return next(new NotFoundError('Guest'));
  }
  
  const [existingType] = await db.select({ id: feedbacktype.typeid }).from(feedbacktype).where(eq(feedbacktype.typeid, typeId)).limit(1);
  if (!existingType) {
    return next(new NotFoundError('Feedback type'));
  }

  const feedbackId = uuidv4();
  // const now = new Date().toISOString(); // Use DB default for timestamp
  let createdFeedback: (typeof guestfeedback.$inferSelect)[] | null = null;

  // Perform insert in a transaction (though simple here, good practice)
  try {
    createdFeedback = await db.insert(guestfeedback).values({
      feedbackid: feedbackId,
      hotelid: hotelId,
      guestid: guestId,
      typeid: typeId,
      message: message || null,
      rating: rating || null,
      // createdat: now // Removed, rely on DB default
    }).returning();
  } catch (dbError: any) {
    // Log the error for server-side inspection
    console.error('Database error during feedback submission:', dbError);
    // Corrected: Pass only the message to DatabaseError constructor
    return next(new DatabaseError('Could not submit feedback due to a database issue.'));
  }
  
  if (createdFeedback && createdFeedback.length > 0) {
    res.status(201).json({
        feedbackId: createdFeedback[0].feedbackid,
        message: 'Feedback submitted successfully',
        details: createdFeedback[0] // Return the actual created record with DB timestamps
    });
  } else {
    // If returning() didn't work or returned empty, something went wrong
    return next(new DatabaseError('Failed to create feedback or retrieve confirmation.'));
  }
  // Remove placeholder error
  // next(new Error('POST /api/guest/feedback endpoint is temporarily disabled for diagnostics.')); 
}));

/**
 * Submit a category rating
 * 
 * @route POST /api/guest/feedback/rating
 * @param {string} guestId - The guest ID
 * @param {string} hotelId - The hotel ID
 * @param {string} categoryId - The feedback category ID
 * @param {number} rating - The rating (1-5)
 * @param {string} comment - Optional comment
 * @returns {object} Submitted rating
 */
router.post('/rating', asyncHandler(async (req: Request, res: Response, next: NextFunction) => { // Changed to use asyncHandler
  const { guestId, hotelId, categoryId, rating, comment } = req.body;
  
  // Validate required fields
  if (!guestId || !hotelId || !categoryId || rating === undefined) {
    return next(new ValidationError('Missing required fields', [
        { field: 'guestId', message: 'Required' },
        { field: 'hotelId', message: 'Required' },
        { field: 'categoryId', message: 'Required' },
        { field: 'rating', message: 'Required' }
    ]));
  }
  
  // Validate rating
  if (rating < 1 || rating > 5 || !Number.isInteger(rating)) {
    return next(new ValidationError('Rating must be an integer between 1 and 5', [{field: 'rating', message: 'Invalid value'}]));
  }
  
  // Verify the guest exists
  const [existingGuest] = await db.select({ id: guest.guestid }).from(guest).where(eq(guest.guestid, guestId)).limit(1);
  if (!existingGuest) {
    return next(new NotFoundError('Guest'));
  }
  
  // Verify the category exists for the hotel
  const [existingCategory] = await db.select({ id: feedbackcategory.categoryid }).from(feedbackcategory)
    .where(and(eq(feedbackcategory.categoryid, categoryId), eq(feedbackcategory.hotelid, hotelId))).limit(1);
  if (!existingCategory) {
    return next(new NotFoundError('Feedback category for this hotel'));
  }
  
  // Create the rating
  const ratingId = uuidv4();
  
  const [insertedRating] = await db.insert(feedbackrating).values({
      ratingid: ratingId,
      guestid: guestId,
      hotelid: hotelId,
      categoryid: categoryId,
      rating,
      comment: comment || null,
      // createdat: new Date().toISOString() // Removed, rely on DB default
    }).returning(); // Fetch the inserted record

  if (!insertedRating) {
      return next(new DatabaseError('Failed to create feedback rating or retrieve confirmation.'));
  }
  
  // Return the actual created record
  res.status(201).json(insertedRating);
}));

export default router; 