import express, { Request, Response, NextFunction } from 'express';
import { db } from '../../config/db';
import { 
  guestfeedback,
  feedbacktype,
  guest,
  name,
  emailaddress,
  phonenumber,
} from '../../models/schema';
import { 
  eq, 
  and, 
  desc,
  like,
  or,
  sql,
  inArray
} from 'drizzle-orm';
import { asyncHandler, NotFoundError, ValidationError, DatabaseError } from '../../middleware/errorHandler';

const router = express.Router();

// Interfaces for clarity
interface FeedbackIdParam { feedbackId: string; }
interface HotelIdQuery { hotelId: string; }
interface FeedbackFiltersQuery { type?: string; rating?: string; }
interface PaginationQuery { page?: string; limit?: string; }

/**
 * Get all feedback for a hotel
 * 
 * @route GET /api/management/feedback
 * @param {string} hotelId - The hotel ID
 * @param {string} type - (Optional) Filter by feedback type (comma-separated)
 * @param {number} rating - (Optional) Filter by rating
 * @param {number} page - (Optional) Page number for pagination
 * @param {number} limit - (Optional) Number of items per page
 */
router.get('/', asyncHandler(async (req, res, next) => {
  // Assert query types
  const { hotelId } = req.query as HotelIdQuery;
  const { type: typeQuery, rating: ratingQuery } = req.query as FeedbackFiltersQuery;
  const { page: pageQuery, limit: limitQuery } = req.query as PaginationQuery;

  const rating = ratingQuery ? parseInt(ratingQuery) : undefined;
  const page = parseInt(pageQuery || '1');
  const limit = parseInt(limitQuery || '20');

  // Validation
  if (!hotelId) {
    return next(new ValidationError('Hotel ID is required', [{ field: 'hotelId', message: 'Required' }]));
  }
  if (isNaN(page) || page < 1) return next(new ValidationError('Invalid page number', [{ field: 'page', message: 'Must be positive integer' }]));
  if (isNaN(limit) || limit < 1 || limit > 100) return next(new ValidationError('Invalid limit value', [{ field: 'limit', message: 'Must be 1-100' }]));
  if (rating !== undefined && (isNaN(rating) || rating < 1 || rating > 5)) { // Assuming 1-5 rating scale
      return next(new ValidationError('Invalid rating value', [{ field: 'rating', message: 'Must be a number between 1 and 5' }]));
  }

  const offset = (page - 1) * limit;
  const whereConditions = [eq(guestfeedback.hotelid, hotelId)];

  if (typeQuery) {
    const typeArray = typeQuery.split(',').map(t => t.trim()).filter(t => t);
    if (typeArray.length > 0) {
      whereConditions.push(inArray(feedbacktype.type, typeArray));
    }
  }

  if (rating !== undefined) {
    whereConditions.push(eq(guestfeedback.rating, rating));
  }
  
  const combinedWhereClause = and(...whereConditions);

  const feedbackItems = await db
    .select({
      feedback: {
        feedbackid: guestfeedback.feedbackid,
        hotelid: guestfeedback.hotelid,
        guestid: guestfeedback.guestid,
        typeid: guestfeedback.typeid,
        message: guestfeedback.message,
        rating: guestfeedback.rating,
        createdat: guestfeedback.createdat
      },
      guest: {
        guestid: guest.guestid
      },
      guestName: {
        firstname: name.firstname,
        lastname: name.lastname,
        title: name.title
      },
      feedbacktype: {
        type: feedbacktype.type,
        description: feedbacktype.description
      }
    })
    .from(guestfeedback)
    .innerJoin(guest, eq(guestfeedback.guestid, guest.guestid))
    .leftJoin(name, eq(guest.nameid, name.nameid))
    .leftJoin(feedbacktype, eq(guestfeedback.typeid, feedbacktype.typeid))
    .where(combinedWhereClause)
    .orderBy(desc(guestfeedback.createdat))
    .limit(limit)
    .offset(offset);

  const countResult = await db
    .select({ count: sql<number>`count(${guestfeedback.feedbackid})`.mapWith(Number) })
    .from(guestfeedback)
    .leftJoin(feedbacktype, eq(guestfeedback.typeid, feedbacktype.typeid))
    .where(combinedWhereClause);
  
  const totalCount = countResult[0]?.count ?? 0;
  const totalPages = Math.ceil(totalCount / limit);

  // Fetch guest contacts
  const guestIds = feedbackItems.map(item => item.guest.guestid).filter(id => id);
  let guestContacts: Record<string, { email: string | null; phone: string | null }> = {};
  if (guestIds.length > 0) {
      const emails = await db.select({ guestid: emailaddress.guestid, address: emailaddress.address })
                          .from(emailaddress).where(and(inArray(emailaddress.guestid, guestIds), eq(emailaddress.isprimary, true)));
      const phones = await db.select({ guestid: phonenumber.guestid, number: phonenumber.number })
                          .from(phonenumber).where(and(inArray(phonenumber.guestid, guestIds), eq(phonenumber.isprimary, true)));
      guestContacts = guestIds.reduce((acc, id) => {
          acc[id] = { email: emails.find(e => e.guestid === id)?.address || null, phone: phones.find(p => p.guestid === id)?.number || null };
          return acc;
      }, {} as Record<string, { email: string | null; phone: string | null }>);
  }

  const formattedFeedback = feedbackItems.map(item => ({
    feedbackId: item.feedback.feedbackid,
    hotelId: item.feedback.hotelid,
    guestId: item.guest.guestid,
    guestName: item.guestName ? 
      `${item.guestName.title || ''} ${item.guestName.firstname || ''} ${item.guestName.lastname || ''}`.trim() : 
      'Unknown Guest',
    guestContact: guestContacts[item.guest.guestid] || { email: null, phone: null },
    feedbackType: item.feedbacktype?.type || 'N/A',
    message: item.feedback.message,
    rating: item.feedback.rating,
    createdAt: item.feedback.createdat
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
 * Get a specific feedback by ID
 * 
 * @route GET /api/management/feedback/:feedbackId
 * @param {string} feedbackId - The feedback ID
 * @param {string} hotelId - The hotel ID for validation (query param)
 */
router.get('/:feedbackId', asyncHandler(async (req, res, next) => {
  const { feedbackId } = req.params as FeedbackIdParam;
  const { hotelId } = req.query as HotelIdQuery;

  if (!feedbackId) {
    return next(new ValidationError('Feedback ID parameter is required', [{ field: 'feedbackId', message: 'Required' }]));
  }
  if (!hotelId) {
    return next(new ValidationError('Hotel ID query parameter is required', [{ field: 'hotelId', message: 'Required' }]));
  }

  const [feedbackData] = await db
    .select({
      feedback: {
        feedbackid: guestfeedback.feedbackid,
        hotelid: guestfeedback.hotelid,
        guestid: guestfeedback.guestid,
        typeid: guestfeedback.typeid,
        message: guestfeedback.message,
        rating: guestfeedback.rating,
        createdat: guestfeedback.createdat
      },
      guest: {
        guestid: guest.guestid
      },
      guestName: {
        firstname: name.firstname,
        lastname: name.lastname,
        title: name.title
      },
      feedbacktype: {
        type: feedbacktype.type,
        description: feedbacktype.description
      }
    })
    .from(guestfeedback)
    .innerJoin(guest, eq(guestfeedback.guestid, guest.guestid))
    .leftJoin(name, eq(guest.nameid, name.nameid))
    .leftJoin(feedbacktype, eq(guestfeedback.typeid, feedbacktype.typeid))
    .where(
      and(
        eq(guestfeedback.feedbackid, feedbackId),
        eq(guestfeedback.hotelid, hotelId)
      )
    );

  if (!feedbackData) {
    return next(new NotFoundError(`Feedback with ID ${feedbackId} not found for hotel ${hotelId}`));
  }

  // Fetch contact details
  let primaryContact: { email: string | null; phone: string | null } = { email: null, phone: null };
  const guestId = feedbackData.guest.guestid;
  if (guestId) {
      const emailResult = await db.select({ address: emailaddress.address })
          .from(emailaddress).where(and(eq(emailaddress.guestid, guestId), eq(emailaddress.isprimary, true))).limit(1);
      const phoneResult = await db.select({ number: phonenumber.number })
          .from(phonenumber).where(and(eq(phonenumber.guestid, guestId), eq(phonenumber.isprimary, true))).limit(1);
      primaryContact = { email: emailResult[0]?.address ?? null, phone: phoneResult[0]?.number ?? null };
  }

  const response = {
    feedbackId: feedbackData.feedback.feedbackid,
    hotelId: feedbackData.feedback.hotelid,
    guestId: feedbackData.guest.guestid,
    guestInfo: {
      name: feedbackData.guestName ? 
        `${feedbackData.guestName.title || ''} ${feedbackData.guestName.firstname || ''} ${feedbackData.guestName.lastname || ''}`.trim() : 
        'Unknown Guest',
      email: primaryContact.email,
      phone: primaryContact.phone
    },
    feedbackType: feedbackData.feedbacktype?.type || 'N/A',
    typeDescription: feedbackData.feedbacktype?.description,
    message: feedbackData.feedback.message,
    rating: feedbackData.feedback.rating,
    createdAt: feedbackData.feedback.createdat
  };

  res.json(response);
}));

/**
 * Get feedback types
 * 
 * @route GET /api/management/feedback/types
 */
router.get('/types/all', asyncHandler(async (req, res, next) => {
  const types = await db
    .select({
      typeid: feedbacktype.typeid,
      type: feedbacktype.type,
      description: feedbacktype.description
    })
    .from(feedbacktype)
    .orderBy(feedbacktype.type);

  res.json({ data: types });
}));

export default router; 