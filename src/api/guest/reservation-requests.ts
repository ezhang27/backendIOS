import { Router, Request, Response, NextFunction } from 'express';
import { eq, and, desc, asc, sql, inArray } from 'drizzle-orm';
import { db } from '../../config/db';
import { 
  request, 
  guest, 
  reservationrequest,
  facility,
  requestStatusEnum
} from '../../models/schema';
import { v4 as uuidv4 } from 'uuid';
import asyncHandler from 'express-async-handler';
import { NotFoundError, ValidationError, DatabaseError } from '../../middleware/errorHandler';

const router = Router();

/**
 * Get all reservation requests for a guest
 * 
 * @route GET /api/guest/reservation-requests
 * @param {string} guestId - The guest ID
 * @param {string} status - (Optional) Filter by request status
 * @param {number} page - (Optional) Page number for pagination
 * @param {number} limit - (Optional) Number of items per page
 * @returns {object} List of reservation requests with pagination metadata
 */
router.get('/', asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const guestId = req.query.guestId as string;
  const statusQuery = req.query.status as string;
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;
  
  if (!guestId) {
    return next(new ValidationError('Missing guestId parameter', [{ field: 'guestId', message: 'guestId is required'}]));
  }
  
  const offset = (page - 1) * limit;
  const conditions = [eq(request.guestid, guestId)];
  
  if (statusQuery) {
    const statusArray = statusQuery.split(',').map(s => s.trim()).filter(s => s);
    // Validate against requestStatusEnum
    const validStatuses = statusArray.filter(s => (requestStatusEnum.enumValues as readonly string[]).includes(s));
    if (validStatuses.length > 0) {
      conditions.push(inArray(request.status, validStatuses as (typeof requestStatusEnum.enumValues[number])[]));
    }
  }
  
  const combinedWhereClause = and(...conditions);
  
  const reservationRequestsData = await db
    .select({
      // reservationrequest fields
      requestId: reservationrequest.requestid,
      facilityType: reservationrequest.facilitytype,
      facilityId: reservationrequest.facilityid,
      reservationTime: reservationrequest.reservationtime,
      partySize: reservationrequest.partysize,
      specialRequests: reservationrequest.specialrequests,
      duration: reservationrequest.duration,
      rrCreatedAt: reservationrequest.createdat,
      rrUpdatedAt: reservationrequest.updatedat,
      // request fields
      hotelId: request.hotelid,
      guestId: request.guestid,
      stayReservationId: request.reservationid, // from base request table
      status: request.status,
      scheduledTime: request.scheduledtime,
      completedAt: request.completedat,
      notes: request.notes,
      reqCreatedAt: request.createdat,
      reqUpdatedAt: request.updatedat,
      // facility fields
      facilityName: facility.name,
      facilityActualType: facility.type // Avoid conflict with facilityType from reservationrequest
    })
    .from(reservationrequest)
    .innerJoin(request, eq(reservationrequest.requestid, request.requestid))
    .leftJoin(facility, eq(reservationrequest.facilityid, facility.facilityid))
    .where(combinedWhereClause)
    .orderBy(desc(request.createdat))
    .limit(limit)
    .offset(offset);
  
  const countResult = await db
    .select({ count: sql<number>`count(${reservationrequest.requestid})`.mapWith(Number) })
    .from(reservationrequest)
    .innerJoin(request, eq(reservationrequest.requestid, request.requestid))
    .where(combinedWhereClause);
  
  const totalCount = countResult[0]?.count ?? 0;
  const totalPages = Math.ceil(totalCount / limit);
  
  const formattedReservationRequests = reservationRequestsData.map(rr => ({
    requestId: rr.requestId,
    facilityType: rr.facilityType, // User's specified type for request
    facility: rr.facilityId ? {
      facilityId: rr.facilityId,
      name: rr.facilityName,
      type: rr.facilityActualType // Actual type from facility table
    } : null,
    reservationTime: rr.reservationTime,
    partySize: rr.partySize,
    duration: rr.duration,
    specialRequests: rr.specialRequests,
    hotelId: rr.hotelId,
    stayReservationId: rr.stayReservationId,
    status: rr.status,
    scheduledTime: rr.scheduledTime,
    completedAt: rr.completedAt,
    notes: rr.notes,
    createdAt: rr.rrCreatedAt, // From reservationrequest table
    updatedAt: rr.rrUpdatedAt  // From reservationrequest table
  }));
  
  res.json({
    data: formattedReservationRequests,
    meta: {
      page,
      limit,
      totalCount,
      totalPages
    }
  });
}));

/**
 * Get specific reservation request details
 * 
 * @route GET /api/guest/reservation-requests/:requestId
 * @param {string} requestId - The request ID
 * @param {string} guestId - The guest ID
 * @returns {object} Reservation request details
 */
router.get('/:requestId', asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const { requestId } = req.params;
  const guestId = req.query.guestId as string;
  
  if (!guestId) {
    return next(new ValidationError('Missing guestId query parameter', [{field: 'guestId', message: 'guestId required'}]));
  }
  if (!requestId) {
     return next(new ValidationError('Missing requestId parameter', [{field: 'requestId', message: 'requestId required'}]));
  }
  
  const [reservationRequestData] = await db
    .select({
      // reservationrequest fields
      requestId: reservationrequest.requestid,
      facilityType: reservationrequest.facilitytype,
      facilityId: reservationrequest.facilityid,
      reservationTime: reservationrequest.reservationtime,
      partySize: reservationrequest.partysize,
      specialRequests: reservationrequest.specialrequests,
      duration: reservationrequest.duration,
      rrCreatedAt: reservationrequest.createdat,
      rrUpdatedAt: reservationrequest.updatedat,
      // request fields
      hotelId: request.hotelid,
      guestId: request.guestid,
      stayReservationId: request.reservationid,
      status: request.status,
      scheduledTime: request.scheduledtime,
      completedAt: request.completedat,
      notes: request.notes,
      reqCreatedAt: request.createdat,
      reqUpdatedAt: request.updatedat,
      // facility fields
      facilityName: facility.name,
      facilityActualType: facility.type,
      facilityDescription: facility.description
    })
    .from(reservationrequest)
    .innerJoin(request, eq(reservationrequest.requestid, request.requestid))
    .leftJoin(facility, eq(reservationrequest.facilityid, facility.facilityid))
    .where(and(eq(reservationrequest.requestid, requestId), eq(request.guestid, guestId)));
  
  if (!reservationRequestData) {
    return next(new NotFoundError('Reservation request'));
  }
  
  const response = {
    requestId: reservationRequestData.requestId,
    facilityType: reservationRequestData.facilityType,
    facility: reservationRequestData.facilityId ? {
      facilityId: reservationRequestData.facilityId,
      name: reservationRequestData.facilityName,
      type: reservationRequestData.facilityActualType,
      description: reservationRequestData.facilityDescription
    } : null,
    reservationTime: reservationRequestData.reservationTime,
    partySize: reservationRequestData.partySize,
    duration: reservationRequestData.duration,
    specialRequests: reservationRequestData.specialRequests,
    hotelId: reservationRequestData.hotelId,
    stayReservationId: reservationRequestData.stayReservationId,
    status: reservationRequestData.status,
    scheduledTime: reservationRequestData.scheduledTime,
    completedAt: reservationRequestData.completedAt,
    notes: reservationRequestData.notes,
    createdAt: reservationRequestData.rrCreatedAt,
    updatedAt: reservationRequestData.rrUpdatedAt
  };
  
  res.json(response);
}));

/**
 * Create a new reservation request
 * 
 * @route POST /api/guest/reservation-requests
 * @param {string} guestId - The guest ID
 * @param {string} hotelId - The hotel ID
 * @param {string} reservationId - The reservation ID for the guest's stay
 * @param {string} facilityType - Type of facility (restaurant, spa, etc.)
 * @param {string} facilityId - ID of the facility
 * @param {string} reservationTime - Requested reservation time
 * @param {number} partySize - Number of people in the party
 * @param {number} duration - Duration in minutes
 * @param {string} specialRequests - Special requests for the reservation
 * @returns {object} Created reservation request
 */
router.post('/', asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const { 
    guestId, 
    hotelId,
    reservationId, // Stay reservation ID
    facilityType, 
    facilityId, 
    reservationTime, 
    partySize, 
    duration, 
    specialRequests,
    notes // Notes for the base request
  } = req.body;

  // Basic validation
  if (!guestId || !hotelId || !reservationId || !facilityType || !reservationTime || !partySize) {
    return next(new ValidationError('Missing required fields for reservation request', [
      {field: 'guestId', message: 'Required'},
      {field: 'hotelId', message: 'Required'},
      {field: 'reservationId', message: 'Required (stay reservation ID)'},
      {field: 'facilityType', message: 'Required'},
      {field: 'reservationTime', message: 'Required'},
      {field: 'partySize', message: 'Required'},
    ]));
  }

  // Validate facilityId if facilityType implies specific facility
  if (facilityId) {
      const fac = await db.select({id: facility.facilityid}).from(facility).where(eq(facility.facilityid, facilityId)).limit(1);
      if(fac.length === 0) return next(new NotFoundError('Facility'));
  }

  const requestId = uuidv4();
  // const now = new Date(); // Timestamps to be handled by DB or set only where necessary

  await db.transaction(async (tx) => {
    const operationTime = new Date().toISOString(); // For fields that might not have DB default yet for createdat

    await tx.insert(request).values({
      requestid: requestId,
      hotelid: hotelId,
      guestid: guestId,
      reservationid: reservationId, // This is the STAY reservation ID
      requesttype: 'Reservation', 
      status: requestStatusEnum.enumValues[0], 
      scheduledtime: new Date(reservationTime).toISOString(), 
      notes: notes, 
      // createdat: operationTime, // Assuming DB default
      // updatedat: operationTime, // Assuming DB default
    });

    await tx.insert(reservationrequest).values({
      requestid: requestId,
      facilitytype: facilityType,
      facilityid: facilityId,
      reservationtime: new Date(reservationTime).toISOString(),
      partysize: partySize,
      duration: duration,
      specialrequests: specialRequests,
      // createdat: operationTime, // Assuming DB default
      // updatedat: operationTime, // Assuming DB default
    });
  });

  // Re-fetch to match GET /:requestId structure
  const [createdRequestData] = await db
    .select({
      requestId: reservationrequest.requestid,
      facilityType: reservationrequest.facilitytype,
      facilityId: reservationrequest.facilityid,
      reservationTime: reservationrequest.reservationtime,
      partySize: reservationrequest.partysize,
      specialRequests: reservationrequest.specialrequests,
      duration: reservationrequest.duration,
      rrCreatedAt: reservationrequest.createdat,
      rrUpdatedAt: reservationrequest.updatedat,
      hotelId: request.hotelid,
      guestIdFromRequest: request.guestid, // Alias to avoid conflict with outer guestId
      stayReservationId: request.reservationid,
      status: request.status,
      scheduledTime: request.scheduledtime,
      completedAt: request.completedat,
      notes: request.notes,
      facilityName: facility.name,
      facilityActualType: facility.type,
      facilityDescription: facility.description
    })
    .from(reservationrequest)
    .innerJoin(request, eq(reservationrequest.requestid, request.requestid))
    .leftJoin(facility, eq(reservationrequest.facilityid, facility.facilityid))
    .where(eq(reservationrequest.requestid, requestId));
  
  if (!createdRequestData) {
      return next(new DatabaseError('Reservation request created, but failed to refetch.'));
  }

  const response = {
    requestId: createdRequestData.requestId,
    facilityType: createdRequestData.facilityType,
    facility: createdRequestData.facilityId ? {
      facilityId: createdRequestData.facilityId,
      name: createdRequestData.facilityName,
      type: createdRequestData.facilityActualType,
      description: createdRequestData.facilityDescription
    } : null,
    reservationTime: createdRequestData.reservationTime,
    partySize: createdRequestData.partySize,
    duration: createdRequestData.duration,
    specialRequests: createdRequestData.specialRequests,
    hotelId: createdRequestData.hotelId,
    guestId: createdRequestData.guestIdFromRequest, // Use the fetched guestId
    stayReservationId: createdRequestData.stayReservationId,
    status: createdRequestData.status,
    scheduledTime: createdRequestData.scheduledTime,
    completedAt: createdRequestData.completedAt,
    notes: createdRequestData.notes,
    createdAt: createdRequestData.rrCreatedAt,
    updatedAt: createdRequestData.rrUpdatedAt
  };

  res.status(201).json(response);
}));

/**
 * Cancel a reservation request
 * 
 * @route PUT /api/guest/reservation-requests/:requestId/cancel
 * @param {string} requestId - The request ID
 * @param {string} guestId - The guest ID
 * @returns {object} Cancelled reservation request status
 */
router.put('/:requestId/cancel', asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const { requestId } = req.params;
  const guestId = req.body.guestId as string; // Require guestId in body for validation

  if (!guestId) {
    return next(new ValidationError('Missing guestId in request body', [{field: 'guestId', message: 'guestId required'}]));
  }
  if (!requestId) {
     return next(new ValidationError('Missing requestId parameter', [{field: 'requestId', message: 'requestId required'}]));
  }

  const reqRecord = await db.select({ status: request.status, guestid: request.guestid }).from(request).where(eq(request.requestid, requestId)).limit(1);

  if (reqRecord.length === 0) {
    return next(new NotFoundError('Reservation request'));
  }
  if (reqRecord[0].guestid !== guestId) {
    return next(new ValidationError('Request does not belong to this guest', [{field: 'guestId', message: 'Mismatch'}]));
  }
  
  const currentStatus = reqRecord[0].status;
  const cancellableStatuses: (typeof requestStatusEnum.enumValues[number])[] = [
    requestStatusEnum.enumValues.find(e => e === 'Submitted')!,
    requestStatusEnum.enumValues.find(e => e === 'Scheduled')!
  ].filter(Boolean) as any; // Filter out undefined if a status is not found

  if (!cancellableStatuses.includes(currentStatus)) {
    return next(new ValidationError(`Reservation request cannot be cancelled in its current status: ${currentStatus}`, []));
  }

  const cancelledStatus = requestStatusEnum.enumValues.find(e => e === 'Cancelled');
  if (!cancelledStatus) {
    // This should ideally not happen if enum is correctly defined
    return next(new DatabaseError("Internal server error: 'Cancelled' status not found in ENUM definitions."));
  }

  await db.update(request)
    .set({ status: cancelledStatus /* updatedat handled by DB */ })
    .where(eq(request.requestid, requestId));
  
  // Re-fetch to return the updated request, matching GET /:requestId structure
  const [cancelledRequestData] = await db
    .select({
      requestId: reservationrequest.requestid,
      facilityType: reservationrequest.facilitytype,
      facilityId: reservationrequest.facilityid,
      reservationTime: reservationrequest.reservationtime,
      partySize: reservationrequest.partysize,
      specialRequests: reservationrequest.specialrequests,
      duration: reservationrequest.duration,
      rrCreatedAt: reservationrequest.createdat,
      rrUpdatedAt: reservationrequest.updatedat,
      hotelId: request.hotelid,
      guestIdFromRequest: request.guestid, // Alias for clarity
      stayReservationId: request.reservationid,
      status: request.status,
      scheduledTime: request.scheduledtime,
      completedAt: request.completedat,
      notes: request.notes,
      facilityName: facility.name,
      facilityActualType: facility.type,
      facilityDescription: facility.description
    })
    .from(reservationrequest)
    .innerJoin(request, eq(reservationrequest.requestid, request.requestid))
    .leftJoin(facility, eq(reservationrequest.facilityid, facility.facilityid))
    .where(and(eq(reservationrequest.requestid, requestId), eq(request.guestid, guestId))); // Ensure it is the guest's request

  if (!cancelledRequestData) {
    return next(new NotFoundError('Reservation request not found after cancellation or guest mismatch.'));
  }

  const response = {
    requestId: cancelledRequestData.requestId,
    facilityType: cancelledRequestData.facilityType,
    facility: cancelledRequestData.facilityId ? {
      facilityId: cancelledRequestData.facilityId,
      name: cancelledRequestData.facilityName,
      type: cancelledRequestData.facilityActualType,
      description: cancelledRequestData.facilityDescription
    } : null,
    reservationTime: cancelledRequestData.reservationTime,
    partySize: cancelledRequestData.partySize,
    duration: cancelledRequestData.duration,
    specialRequests: cancelledRequestData.specialRequests,
    hotelId: cancelledRequestData.hotelId,
    guestId: cancelledRequestData.guestIdFromRequest,
    stayReservationId: cancelledRequestData.stayReservationId,
    status: cancelledRequestData.status,
    scheduledTime: cancelledRequestData.scheduledTime,
    completedAt: cancelledRequestData.completedAt,
    notes: cancelledRequestData.notes,
    createdAt: cancelledRequestData.rrCreatedAt,
    updatedAt: cancelledRequestData.rrUpdatedAt
  };

  res.status(200).json(response);
}));

export default router; 