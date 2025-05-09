import { Router, Request, Response, NextFunction } from 'express';
import { eq, and, desc, sql, inArray } from 'drizzle-orm';
import { db } from '../../config/db';
import { 
  request, 
  guest, 
  generalrequest, 
  room,
  charge,
  currency,
  requestStatusEnum
} from '../../models/schema';
import { v4 as uuidv4 } from 'uuid';
import asyncHandler from 'express-async-handler';
import { NotFoundError, ValidationError, DatabaseError } from '../../middleware/errorHandler';

const router = Router();

/**
 * Get all general requests for a guest
 * 
 * @route GET /api/guest/general-requests
 * @param {string} guestId - The guest ID
 * @param {string} status - (Optional) Filter by request status
 * @param {string} category - (Optional) Filter by request category
 * @param {number} page - (Optional) Page number for pagination
 * @param {number} limit - (Optional) Number of items per page
 * @returns {object} List of general requests with pagination metadata
 */
router.get('/', asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const guestId = req.query.guestId as string;
  const statusQuery = req.query.status as string;
  const categoryQuery = req.query.category as string;
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;
  
  if (!guestId) {
    return next(new ValidationError('Missing guestId parameter', [{field: 'guestId', message:'guestId required'}]));
  }
  
  const offset = (page - 1) * limit;
  const conditions = [eq(request.guestid, guestId)];
  
  if (statusQuery) {
    const statusArray = statusQuery.split(',').map(s => s.trim()).filter(s => s);
    const validStatuses = statusArray.filter(s => (requestStatusEnum.enumValues as readonly string[]).includes(s));
    if (validStatuses.length > 0) {
      conditions.push(inArray(request.status, validStatuses as (typeof requestStatusEnum.enumValues[number])[]));
    }
  }
  
  if (categoryQuery) {
    const categoryArray = categoryQuery.split(',').map(c => c.trim()).filter(c => c);
    if (categoryArray.length > 0) {
      conditions.push(inArray(generalrequest.requestcategory, categoryArray));
    }
  }
  
  const combinedWhereClause = and(...conditions);
  
  const generalRequestsData = await db
    .select({
      requestId: generalrequest.requestid,
      category: generalrequest.requestcategory,
      description: generalrequest.description,
      roomId: generalrequest.roomid,
      grCreatedAt: generalrequest.createdat,
      grUpdatedAt: generalrequest.updatedat,
      hotelId: request.hotelid,
      guestId: request.guestid,
      status: request.status,
      scheduledTime: request.scheduledtime,
      completedAt: request.completedat,
      notes: request.notes,
      reqCreatedAt: request.createdat,
      reqUpdatedAt: request.updatedat,
      roomNumber: room.roomnumber,
      floor: room.floor
    })
    .from(generalrequest)
    .innerJoin(request, eq(generalrequest.requestid, request.requestid))
    .leftJoin(room, eq(generalrequest.roomid, room.roomid))
    .where(combinedWhereClause)
    .orderBy(desc(request.createdat))
    .limit(limit)
    .offset(offset);
  
  const countResult = await db
    .select({ count: sql<number>`count(${generalrequest.requestid})`.mapWith(Number) })
    .from(generalrequest)
    .innerJoin(request, eq(generalrequest.requestid, request.requestid))
    .where(combinedWhereClause);
  
  const totalCount = countResult[0]?.count ?? 0;
  const totalPages = Math.ceil(totalCount / limit);
  
  const formattedGeneralRequests = generalRequestsData.map(gr => ({
    requestId: gr.requestId,
    category: gr.category,
    description: gr.description,
    room: gr.roomId ? { roomId: gr.roomId, roomNumber: gr.roomNumber, floor: gr.floor } : null,
    hotelId: gr.hotelId,
    guestId: gr.guestId,
    status: gr.status,
    scheduledTime: gr.scheduledTime,
    completedAt: gr.completedAt,
    notes: gr.notes,
    createdAt: gr.reqCreatedAt,
    updatedAt: gr.reqUpdatedAt
  }));
  
  res.json({
    data: formattedGeneralRequests,
    meta: {
      page,
      limit,
      totalCount,
      totalPages
    }
  });
}));

/**
 * Get specific general request details
 * 
 * @route GET /api/guest/general-requests/:requestId
 * @param {string} requestId - The request ID
 * @param {string} guestId - The guest ID
 * @returns {object} General request details
 */
router.get('/:requestId', asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const { requestId } = req.params;
  const guestId = req.query.guestId as string;
  
  if (!guestId) {
    return next(new ValidationError('Missing guestId query parameter', [{field: 'guestId', message:'guestId required'}]));
  }
  if (!requestId) {
     return next(new ValidationError('Missing requestId parameter', [{field: 'requestId', message:'requestId required'}]));
  }
  
  const [generalRequestData] = await db
    .select({
      requestId: generalrequest.requestid,
      category: generalrequest.requestcategory,
      description: generalrequest.description,
      roomId: generalrequest.roomid,
      grCreatedAt: generalrequest.createdat,
      grUpdatedAt: generalrequest.updatedat,
      hotelId: request.hotelid,
      guestId: request.guestid,
      status: request.status,
      scheduledTime: request.scheduledtime,
      completedAt: request.completedat,
      notes: request.notes,
      reqCreatedAt: request.createdat,
      reqUpdatedAt: request.updatedat,
      roomNumber: room.roomnumber,
      floor: room.floor
    })
    .from(generalrequest)
    .innerJoin(request, eq(generalrequest.requestid, request.requestid))
    .leftJoin(room, eq(generalrequest.roomid, room.roomid))
    .where(and(eq(generalrequest.requestid, requestId), eq(request.guestid, guestId)));
  
  if (!generalRequestData) {
    return next(new NotFoundError('General request'));
  }
  
  const response = {
    requestId: generalRequestData.requestId,
    category: generalRequestData.category,
    description: generalRequestData.description,
    room: generalRequestData.roomId ? { roomId: generalRequestData.roomId, roomNumber: generalRequestData.roomNumber, floor: generalRequestData.floor } : null,
    hotelId: generalRequestData.hotelId,
    guestId: generalRequestData.guestId,
    status: generalRequestData.status,
    scheduledTime: generalRequestData.scheduledTime,
    completedAt: generalRequestData.completedAt,
    notes: generalRequestData.notes,
    createdAt: generalRequestData.reqCreatedAt,
    updatedAt: generalRequestData.reqUpdatedAt
  };
  
  res.json(response);
}));

/**
 * Create a new general request
 * 
 * @route POST /api/guest/general-requests
 * @param {string} guestId - The guest ID
 * @param {string} hotelId - The hotel ID
 * @param {string} reservationId - The reservation ID
 * @param {string} category - Request category
 * @param {string} description - Description of the request
 * @param {string} roomId - Room ID (optional)
 * @returns {object} Created general request
 */
router.post('/', asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const {
    guestId,
    hotelId,
    reservationId,
    category,
    description,
    roomId,
    scheduledTime,
    notes,
    chargeDetails // Optional: { amount, currencyCode, chargeDescription }
  } = req.body;

  if (!guestId || !hotelId || !reservationId || !category) {
    return next(new ValidationError('Missing required fields', [
      { field: 'guestId', message: 'Required' },
      { field: 'hotelId', message: 'Required' },
      { field: 'reservationId', message: 'Required' },
      { field: 'category', message: 'Required' },
    ]));
  }

  const requestId = uuidv4();
  let chargeId: string | null = null;

  await db.transaction(async (tx) => {
    const operationTime = new Date().toISOString(); // For fields that might not have DB default yet

    // 1. Create base request
    await tx.insert(request).values({
      requestid: requestId,
      hotelid: hotelId,
      guestid: guestId,
      reservationid: reservationId,
      requesttype: 'General', 
      status: requestStatusEnum.enumValues[0], 
      scheduledtime: scheduledTime ? new Date(scheduledTime).toISOString() : undefined,
      notes: notes,
    });

    // 2. Create general request specifics
    await tx.insert(generalrequest).values({
      requestid: requestId,
      requestcategory: category,
      description: description,
      roomid: roomId,
    });

    // 3. Create charge if details provided
    if (chargeDetails && chargeDetails.amount > 0 && chargeDetails.currencyCode) {
      chargeId = uuidv4();
      await tx.insert(charge).values({
        chargeid: chargeId,
        hotelid: hotelId,
        reservationid: reservationId,
        guestid: guestId,
        sourceDiningOrderItemId: null,
        sourceEventBookingId: null,
        sourceSpecialProductId: null,
        description: chargeDetails.chargeDescription || `General Request: ${category}`,
        baseamount: chargeDetails.amount.toFixed(2),
        taxamount: (chargeDetails.taxAmount || 0).toFixed(2),
        totalamount: (chargeDetails.amount + (chargeDetails.taxAmount || 0)).toFixed(2),
        currencycode: chargeDetails.currencyCode.toUpperCase(),
        ispaid: false,
        ischargedtoroom: true,
        istaxed: (chargeDetails.taxAmount || 0) > 0,
        chargetimestamp: operationTime, // Use a consistent timestamp for related records in transaction
        servicetimestamp: scheduledTime ? new Date(scheduledTime).toISOString() : operationTime,
      });
    }
  });

  // Refetch created request to match GET /:requestId structure
  const [createdRequestData] = await db
    .select({
        requestId: generalrequest.requestid,
        category: generalrequest.requestcategory,
        description: generalrequest.description,
        roomId: generalrequest.roomid,
        grCreatedAt: generalrequest.createdat,
        grUpdatedAt: generalrequest.updatedat,
        hotelId: request.hotelid,
        guestIdFromRequest: request.guestid, // Alias to avoid conflict
        status: request.status,
        scheduledTime: request.scheduledtime,
        completedAt: request.completedat,
        notes: request.notes,
        reqCreatedAt: request.createdat, // From base request table
        reqUpdatedAt: request.updatedat, // From base request table
        roomNumber: room.roomnumber,
        floor: room.floor
    })
    .from(generalrequest)
    .innerJoin(request, eq(generalrequest.requestid, request.requestid))
    .leftJoin(room, eq(generalrequest.roomid, room.roomid))
    .where(eq(generalrequest.requestid, requestId));

  if (!createdRequestData) {
    return next(new DatabaseError('General request created, but failed to refetch.'));
  }
  
  const response = {
    requestId: createdRequestData.requestId,
    category: createdRequestData.category,
    description: createdRequestData.description,
    room: createdRequestData.roomId ? { roomId: createdRequestData.roomId, roomNumber: createdRequestData.roomNumber, floor: createdRequestData.floor } : null,
    hotelId: createdRequestData.hotelId,
    guestId: createdRequestData.guestIdFromRequest,
    status: createdRequestData.status,
    scheduledTime: createdRequestData.scheduledTime,
    completedAt: createdRequestData.completedAt,
    notes: createdRequestData.notes,
    createdAt: createdRequestData.reqCreatedAt, // Use base request createdAt
    updatedAt: createdRequestData.reqUpdatedAt  // Use base request updatedAt
  };

  res.status(201).json(response);
}));

/**
 * Cancel a general request
 * 
 * @route PUT /api/guest/general-requests/:requestId/cancel
 * @param {string} requestId - The request ID
 * @param {string} guestId - The guest ID
 * @returns {object} Cancelled general request status
 */
router.put('/:requestId/cancel', asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const { requestId } = req.params;
  const guestId = req.body.guestId as string; // Require guestId in body for validation

  if (!guestId) {
    return next(new ValidationError('Missing guestId in request body', [{field: 'guestId', message:'guestId required'}]));
  }
  if (!requestId) {
     return next(new ValidationError('Missing requestId parameter', [{field: 'requestId', message:'requestId required'}]));
  }

  const reqRecord = await db.select({ status: request.status, guestid: request.guestid, reservationid: request.reservationid, hotelid: request.hotelid }).from(request).where(eq(request.requestid, requestId)).limit(1);

  if (reqRecord.length === 0) {
    return next(new NotFoundError('General request'));
  }
  if (reqRecord[0].guestid !== guestId) {
      return next(new ValidationError('Request does not belong to this guest', [{field: 'guestId', message:'Mismatch'}]));
  }

  const currentStatus = reqRecord[0].status;
  const cancellableStatuses: (typeof requestStatusEnum.enumValues[number])[] = [
      requestStatusEnum.enumValues.find(e => e === 'Submitted')!,
      requestStatusEnum.enumValues.find(e => e === 'Scheduled')!
  ].filter(Boolean) as any;

  if (!cancellableStatuses.includes(currentStatus)) {
    return next(new ValidationError(`Request cannot be cancelled in its current status: ${currentStatus}`, []));
  }

  await db.transaction(async (tx) => {
      const cancelledStatus = requestStatusEnum.enumValues.find(e => e === 'Cancelled');
      if (!cancelledStatus) throw new Error("'Cancelled' status not found in requestStatusEnum");
      
      await tx.update(request)
        .set({ status: cancelledStatus })
        .where(eq(request.requestid, requestId));

      // Handle charge voiding for the general request
      // Find charges that might be related to this general request
      const relatedCharges = await tx.select({ chargeid: charge.chargeid })
        .from(charge)
        .where(and(
          eq(charge.reservationid, reqRecord[0].reservationid),
          eq(charge.guestid, guestId),
          eq(charge.hotelid, reqRecord[0].hotelid),
          eq(charge.ispaid, false),
          // Look for charges created around the same time as the request or with matching description
          sql`${charge.description} LIKE '%General Request%' OR ${charge.description} LIKE CONCAT('%', ${requestId}, '%')`
        ));
      
      // If charges found, mark them as voided by updating relevant fields
      if (relatedCharges.length > 0) {
        const chargeIds = relatedCharges.map(c => c.chargeid);
        await tx.update(charge)
          .set({
            description: sql`CONCAT(${charge.description}, ' [VOIDED]')`,
            ispaid: false,
            baseamount: '0.00',
            taxamount: '0.00',
            totalamount: '0.00',
            notes: sql`CONCAT(COALESCE(${charge.notes}, ''), ' Voided due to request cancellation at ', NOW()::text)`
          })
          .where(inArray(charge.chargeid, chargeIds));
      }
  });

  // Re-fetch the updated request
  const [cancelledRequestData] = await db
    .select({
        requestId: generalrequest.requestid,
        category: generalrequest.requestcategory,
        description: generalrequest.description,
        roomId: generalrequest.roomid,
        grCreatedAt: generalrequest.createdat,
        grUpdatedAt: generalrequest.updatedat,
        hotelId: request.hotelid,
        guestIdFromRequest: request.guestid,
        status: request.status,
        scheduledTime: request.scheduledtime,
        completedAt: request.completedat,
        notes: request.notes,
        reqCreatedAt: request.createdat,
        reqUpdatedAt: request.updatedat,
        roomNumber: room.roomnumber,
        floor: room.floor
    })
    .from(generalrequest)
    .innerJoin(request, eq(generalrequest.requestid, request.requestid))
    .leftJoin(room, eq(generalrequest.roomid, room.roomid))
    .where(and(eq(generalrequest.requestid, requestId), eq(request.guestid, guestId))); // ensure it belongs to guest

  if (!cancelledRequestData) {
      return next(new NotFoundError('General request not found after cancellation or guest mismatch.'));
  }

  const response = {
      requestId: cancelledRequestData.requestId,
      category: cancelledRequestData.category,
      description: cancelledRequestData.description,
      room: cancelledRequestData.roomId ? { roomId: cancelledRequestData.roomId, roomNumber: cancelledRequestData.roomNumber, floor: cancelledRequestData.floor } : null,
      hotelId: cancelledRequestData.hotelId,
      guestId: cancelledRequestData.guestIdFromRequest,
      status: cancelledRequestData.status,
      scheduledTime: cancelledRequestData.scheduledTime,
      completedAt: cancelledRequestData.completedAt,
      notes: cancelledRequestData.notes,
      createdAt: cancelledRequestData.reqCreatedAt,
      updatedAt: cancelledRequestData.reqUpdatedAt
  };

  res.status(200).json(response);
}));

export default router; 