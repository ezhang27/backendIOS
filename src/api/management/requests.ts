import express, { Request, Response, NextFunction } from 'express';
import { db } from '../../config/db';
import { 
  request,
  guest,
  name,
  emailaddress,
  phonenumber,
  requestStatusEnum
} from '../../models/schema';
import { 
  eq, 
  and, 
  desc,
  like,
  or,
  inArray,
  sql
} from 'drizzle-orm';
import { v4 as uuidv4 } from 'uuid';
import { asyncHandler, NotFoundError, ValidationError, DatabaseError } from '../../middleware/errorHandler';

const router = express.Router();

// Define interfaces for params and query for clarity inside handlers
interface RequestIdParam { requestId: string; }
interface HotelIdQuery { hotelId: string; }
interface StatusQuery { status?: string; }
interface SearchQuery { search?: string; }
interface PaginationQuery { page?: string; limit?: string; }

/**
 * Get all requests for a hotel
 * 
 * @route GET /api/management/requests
 * @param {string} hotelId - The hotel ID
 * @param {string} status - (Optional) Filter by request status (comma-separated)
 * @param {string} search - (Optional) Search term
 * @param {number} page - (Optional) Page number for pagination
 * @param {number} limit - (Optional) Number of items per page
 */
router.get('/', asyncHandler(async (req, res, next) => {
  // Assert query types
  const { hotelId } = req.query as HotelIdQuery;
  const { status: statusQuery } = req.query as StatusQuery;
  const { page: pageQuery, limit: limitQuery } = req.query as PaginationQuery;
  const { search } = req.query as SearchQuery;

  const page = parseInt(pageQuery || '1');
  const limit = parseInt(limitQuery || '20');

  if (!hotelId) {
    return next(new ValidationError('Hotel ID is required', [{ field: 'hotelId', message: 'Hotel ID is required' }]));
  }
  if (isNaN(page) || page < 1) return next(new ValidationError('Invalid page number', [{field: 'page', message: 'Must be a positive integer'}]));
  if (isNaN(limit) || limit < 1 || limit > 100) return next(new ValidationError('Invalid limit value', [{field: 'limit', message: 'Must be between 1 and 100'}]));

  const offset = (page - 1) * limit;
  const whereConditions = [eq(request.hotelid, hotelId)];

  if (statusQuery) {
    const statusArray = statusQuery.split(',').map(s => s.trim()).filter(s => s);
    // Use requestStatusEnum for validation
    const validStatuses = statusArray.filter(s => (requestStatusEnum.enumValues as readonly string[]).includes(s));
    if (validStatuses.length > 0) {
      whereConditions.push(inArray(request.status, validStatuses as (typeof requestStatusEnum.enumValues[number])[]));
    } else if (statusArray.length > 0) {
      whereConditions.push(sql`false`); // Status provided but not valid
    }
  }

  if (search) {
    whereConditions.push(
      or(
        like(request.name, `%${search}%`),
        like(request.requesttype, `%${search}%`),
        like(request.notes, `%${search}%`),
        like(sql`lower(${name.firstname ?? ''})`, `%${search.toLowerCase()}%`),
        like(sql`lower(${name.lastname ?? ''})`, `%${search.toLowerCase()}%`)
      )
    );
  }
  
  const combinedWhereClause = and(...whereConditions);

  const requestsData = await db
    .select({
      request: {
        requestid: request.requestid,
        hotelid: request.hotelid,
        guestid: request.guestid,
        requesttype: request.requesttype,
        status: request.status,
        notes: request.notes,
        createdat: request.createdat,
        updatedat: request.updatedat,
        department: request.department,
        scheduledtime: request.scheduledtime,
        completedat: request.completedat
      },
      guest: { // Only guestid needed for contact lookup
        guestid: guest.guestid 
      },
      guestName: { // Alias for name fields
        firstname: name.firstname,
        lastname: name.lastname,
        title: name.title
      }
    })
    .from(request)
    .innerJoin(guest, eq(request.guestid, guest.guestid)) // Changed to innerJoin
    .leftJoin(name, eq(guest.nameid, name.nameid)) // Keep leftJoin for name
    .where(combinedWhereClause)
    .orderBy(desc(request.createdat))
    .limit(limit)
    .offset(offset);

  const countResult = await db
    .select({ count: sql<number>`count(${request.requestid})`.mapWith(Number) }) // Use mapWith(Number)
    .from(request)
    .innerJoin(guest, eq(request.guestid, guest.guestid)) // Must join if searching name
    .leftJoin(name, eq(guest.nameid, name.nameid))   // Must join if searching name
    .where(combinedWhereClause);
      
  const totalCount = countResult[0]?.count ?? 0;

  // Fetch contacts
  const guestIds = requestsData.map(r => r.guest.guestid).filter(id => id);
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

  const formattedRequests = requestsData.map(reqData => ({
    requestId: reqData.request.requestid,
    hotelId: reqData.request.hotelid,
    guestId: reqData.guest.guestid,
    guestName: reqData.guestName ? 
      `${reqData.guestName.title || ''} ${reqData.guestName.firstname || ''} ${reqData.guestName.lastname || ''}`.trim() : 
      'Unknown Guest',
    guestContact: guestContacts[reqData.guest.guestid] || { email: null, phone: null }, // Use fetched contacts
    requestType: reqData.request.requesttype,
    department: reqData.request.department,
    status: reqData.request.status,
    description: reqData.request.notes,
    createdAt: reqData.request.createdat,
    updatedAt: reqData.request.updatedat,
    scheduledTime: reqData.request.scheduledtime,
    completedAt: reqData.request.completedat
  }));

  res.json({ 
    data: formattedRequests,
    pagination: {
      page,
      limit,
      total: totalCount, 
      totalPages: Math.ceil(totalCount / limit)
    }
  });
}));

/**
 * Get a specific request by ID
 * 
 * @route GET /api/management/requests/:requestId
 * @param {string} requestId - The request ID
 * @param {string} hotelId - The hotel ID for validation
 */
router.get('/:requestId', asyncHandler(async (req, res, next) => {
  const { requestId } = req.params as RequestIdParam; // Assert params type
  const { hotelId } = req.query as HotelIdQuery; // Assert query type

  if (!requestId) {
      return next(new ValidationError('Request ID is required', [{ field: 'requestId', message: 'requestId required' }]));
  }
  if (!hotelId) {
    return next(new ValidationError('Hotel ID query parameter is required', [{ field: 'hotelId', message: 'hotelId required' }]));
  }

  const [requestData] = await db
    .select({
      request: {
        requestid: request.requestid,
        hotelid: request.hotelid,
        guestid: request.guestid,
        requesttype: request.requesttype,
        status: request.status,
        notes: request.notes,
        createdat: request.createdat,
        updatedat: request.updatedat,
        department: request.department,
        scheduledtime: request.scheduledtime,
        completedat: request.completedat,
        reservationid: request.reservationid
      },
      guest: { // Only guestid
        guestid: guest.guestid
      },
      guestName: { // Alias for name fields
        firstname: name.firstname,
        lastname: name.lastname,
        title: name.title
      }
    })
    .from(request)
    .innerJoin(guest, eq(request.guestid, guest.guestid)) // Changed to innerJoin
    .leftJoin(name, eq(guest.nameid, name.nameid))
    .where(
      and(
        eq(request.requestid, requestId),
        eq(request.hotelid, hotelId)
      )
    );

  if (!requestData) {
    return next(new NotFoundError('Request'));
  }

  // Fetch contact details
  let primaryContact: { email: string | null; phone: string | null } = { email: null, phone: null };
  const guestId = requestData.guest.guestid;
  if (guestId) {
      const emailResult = await db.select({ address: emailaddress.address })
          .from(emailaddress).where(and(eq(emailaddress.guestid, guestId), eq(emailaddress.isprimary, true))).limit(1);
      const phoneResult = await db.select({ number: phonenumber.number })
          .from(phonenumber).where(and(eq(phonenumber.guestid, guestId), eq(phonenumber.isprimary, true))).limit(1);
      primaryContact = { email: emailResult[0]?.address ?? null, phone: phoneResult[0]?.number ?? null };
  }

  const response = {
    requestId: requestData.request.requestid,
    hotelId: requestData.request.hotelid,
    guestId: requestData.guest.guestid,
    reservationId: requestData.request.reservationid,
    guestInfo: {
      name: requestData.guestName ? 
        `${requestData.guestName.title || ''} ${requestData.guestName.firstname || ''} ${requestData.guestName.lastname || ''}`.trim() : 
        'Unknown Guest',
      email: primaryContact.email,
      phone: primaryContact.phone
    },
    requestType: requestData.request.requesttype,
    department: requestData.request.department,
    status: requestData.request.status,
    description: requestData.request.notes,
    createdAt: requestData.request.createdat,
    updatedAt: requestData.request.updatedat,
    scheduledTime: requestData.request.scheduledtime,
    completedAt: requestData.request.completedat
  };

  res.json(response);
}));

/**
 * Update request status
 * 
 * @route PUT /api/management/requests/:requestId/status
 * @param {string} requestId - The request ID
 * @param {string} hotelId - The hotel ID for validation (in body)
 * @param {string} status - The new status (in body)
 * @param {string} notes - (Optional) Additional notes (in body)
 */
router.put('/:requestId/status', asyncHandler(async (req, res, next) => {
  const { requestId } = req.params as RequestIdParam; // Assert params type
  // Assert body type
  const { hotelId, status, notes } = req.body as { hotelId: string, status: string, notes?: string };

  if (!requestId || !hotelId || !status) {
    return next(new ValidationError('Missing required fields for status update', [
        { field: 'requestId', message: 'requestId in path is required' },
        { field: 'hotelId', message: 'hotelId in body is required' },
        { field: 'status', message: 'status in body is required' },
    ]));
  }

  // Validate status against ENUM
  if (!(requestStatusEnum.enumValues as readonly string[]).includes(status)) {
      return next(new ValidationError('Invalid status value provided', [{field: 'status', message: `Valid statuses: ${requestStatusEnum.enumValues.join(', ')}`}]));
  }

  // Verify request exists and belongs to the hotel before update
  const [reqToUpdate] = await db.select({ id: request.requestid })
      .from(request)
      .where(and(eq(request.requestid, requestId), eq(request.hotelid, hotelId)));

  if (!reqToUpdate) {
      return next(new NotFoundError(`Request with ID ${requestId} not found for hotel ${hotelId}`));
  }

  const updateData: Partial<typeof request.$inferInsert> = {
      status: status as typeof requestStatusEnum.enumValues[number],
      updatedat: new Date().toISOString(),
      completedat: (status === 'Completed' || status === 'Cancelled') ? new Date().toISOString() : null,
  };
  if (notes !== undefined) {
      updateData.notes = notes;
  }

  const [updatedResult] = await db.update(request)
      .set(updateData)
      .where(and(eq(request.requestid, requestId), eq(request.hotelid, hotelId))) // Redundant check, but safe
      .returning({
          requestId: request.requestid,
          status: request.status,
          notes: request.notes,
          updatedAt: request.updatedat,
          completedAt: request.completedat
      });
  
  if (!updatedResult) {
      // This shouldn't happen if reqToUpdate was found, but handle defensively
      return next(new DatabaseError(`Failed to update status for request ${requestId}.`));
  }

  res.status(200).json({ message: 'Request status updated successfully', details: updatedResult });
}));

export default router; 