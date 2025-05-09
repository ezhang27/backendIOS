import express, { Request, Response, NextFunction } from 'express';
import { db } from '../../config/db';
import { 
  reservationrequest,
  request,
  facility,
  guest,
  name,
  emailaddress,
  phonenumber,
  contacttype,
  requestStatusEnum,
} from '../../models/schema';
import { 
  eq, 
  and, 
  desc,
  like,
  or,
  sql,
  inArray,
  isNull
} from 'drizzle-orm';
import { v4 as uuidv4 } from 'uuid';
import asyncHandler from 'express-async-handler';
import { NotFoundError, ValidationError, DatabaseError } from '../../middleware/errorHandler';

const router = express.Router();

/**
 * Get all reservation requests for a hotel
 * 
 * @route GET /api/management/reservation-requests
 * @param {string} hotelId - The hotel ID
 * @param {string} status - (Optional) Filter by request status (comma-separated)
 * @param {string} facilityType - (Optional) Filter by facility type (comma-separated)
 * @param {number} page - (Optional) Page number for pagination
 * @param {number} limit - (Optional) Number of items per page
 */
router.get('/', asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const hotelId = req.query.hotelId as string;
  const statusQuery = req.query.status as string;
  const facilityTypeQuery = req.query.facilityType as string;
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 20;

  if (!hotelId) {
    return next(new ValidationError('Hotel ID is required', [{ field: 'hotelId', message: 'hotelId is required'}]));
  }

  const offset = (page - 1) * limit;
  const whereConditions = [eq(request.hotelid, hotelId)];

  if (statusQuery) {
    const statusArray = statusQuery.split(',').map(s => s.trim()).filter(s => s);
    const validStatuses = statusArray.filter(s => (requestStatusEnum.enumValues as readonly string[]).includes(s));
    if (validStatuses.length > 0) {
      whereConditions.push(inArray(request.status, validStatuses as (typeof requestStatusEnum.enumValues[number])[]));
    } else if (statusArray.length > 0) {
      whereConditions.push(sql`false`);
    }
  }

  if (facilityTypeQuery) {
    const facilityTypeArray = facilityTypeQuery.split(',').map(ft => ft.trim()).filter(ft => ft);
    if (facilityTypeArray.length > 0) {
      whereConditions.push(inArray(reservationrequest.facilitytype, facilityTypeArray));
    } else if (facilityTypeArray.length > 0) {
      whereConditions.push(sql`false`);
    }
  }
  
  const combinedWhereClause = and(...whereConditions);

  const reservationRequestsData = await db
    .select({
      reservationrequest: {
        requestid: reservationrequest.requestid,
        facilitytype: reservationrequest.facilitytype,
        facilityid: reservationrequest.facilityid,
        reservationtime: reservationrequest.reservationtime,
        partysize: reservationrequest.partysize,
        specialrequests: reservationrequest.specialrequests,
        duration: reservationrequest.duration,
        createdat: reservationrequest.createdat,
        updatedat: reservationrequest.updatedat
      },
      request: {
        hotelid: request.hotelid,
        guestid: request.guestid,
        status: request.status,
        scheduledtime: request.scheduledtime,
        completedat: request.completedat,
        notes: request.notes
      },
      facility: {
        name: facility.name,
        description: facility.description,
        type: facility.type
      },
      guest: { 
        guestid: guest.guestid
      },
      name: {
        firstname: name.firstname,
        lastname: name.lastname,
        title: name.title
      }
    })
    .from(reservationrequest)
    .innerJoin(request, eq(reservationrequest.requestid, request.requestid))
    .leftJoin(facility, eq(reservationrequest.facilityid, facility.facilityid))
    .innerJoin(guest, eq(request.guestid, guest.guestid))
    .leftJoin(name, eq(guest.nameid, name.nameid))
    .where(combinedWhereClause)
    .orderBy(desc(reservationrequest.reservationtime))
    .limit(limit)
    .offset(offset);

  const countResult = await db
    .select({ count: sql<number>`count(${reservationrequest.requestid})`.mapWith(Number) })
    .from(reservationrequest)
    .innerJoin(request, eq(reservationrequest.requestid, request.requestid))
    .leftJoin(facility, eq(reservationrequest.facilityid, facility.facilityid))
    .where(combinedWhereClause);
  
  const totalCount = countResult[0]?.count ?? 0;
  const totalPages = Math.ceil(totalCount / limit);

  const guestIds = reservationRequestsData.map(rr => rr.guest.guestid).filter(id => id);
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

  const formattedReservationRequests = reservationRequestsData.map(rr => ({
    requestId: rr.reservationrequest.requestid,
    hotelId: rr.request.hotelid,
    guestId: rr.guest.guestid,
    guestName: rr.name ? 
      `${rr.name.title || ''} ${rr.name.firstname || ''} ${rr.name.lastname || ''}`.trim() : 
      'Unknown Guest',
    guestContact: guestContacts[rr.guest.guestid] || { email: null, phone: null },
    facilityType: rr.reservationrequest.facilitytype,
    facility: rr.reservationrequest.facilityid ? {
      facilityId: rr.reservationrequest.facilityid,
      name: rr.facility?.name,
      description: rr.facility?.description,
      type: rr.facility?.type
    } : null,
    reservationTime: rr.reservationrequest.reservationtime,
    partySize: rr.reservationrequest.partysize,
    duration: rr.reservationrequest.duration,
    specialRequests: rr.reservationrequest.specialrequests,
    status: rr.request.status,
    scheduledTime: rr.request.scheduledtime,
    completedAt: rr.request.completedat,
    notes: rr.request.notes,
    createdAt: rr.reservationrequest.createdat,
    updatedAt: rr.reservationrequest.updatedat
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
 * Get a specific reservation request by ID
 * 
 * @route GET /api/management/reservation-requests/:requestId
 * @param {string} requestId - The request ID
 * @param {string} hotelId - The hotel ID for validation
 */
router.get('/:requestId', asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const { requestId } = req.params;
  const hotelId = req.query.hotelId as string;

  if (!requestId) {
    return next(new ValidationError('Request ID parameter is required', [{field: 'requestId', message: 'requestId required'}]));
  }
  if (!hotelId) {
    return next(new ValidationError('Hotel ID query parameter is required for validation', [{field: 'hotelId', message: 'hotelId required'}]));
  }

  const [reservationRequestData] = await db
    .select({
      reservationrequest: {
        requestid: reservationrequest.requestid,
        facilitytype: reservationrequest.facilitytype,
        facilityid: reservationrequest.facilityid,
        reservationtime: reservationrequest.reservationtime,
        partysize: reservationrequest.partysize,
        specialrequests: reservationrequest.specialrequests,
        duration: reservationrequest.duration,
        createdat: reservationrequest.createdat,
        updatedat: reservationrequest.updatedat
      },
      request: {
        hotelid: request.hotelid,
        guestid: request.guestid,
        status: request.status,
        scheduledtime: request.scheduledtime,
        completedat: request.completedat,
        notes: request.notes,
        reservationid: request.reservationid
      },
      facility: {
        name: facility.name,
        description: facility.description,
        type: facility.type
      },
      guest: {
        guestid: guest.guestid
      },
      name: {
        firstname: name.firstname,
        lastname: name.lastname,
        title: name.title
      }
    })
    .from(reservationrequest)
    .innerJoin(request, eq(reservationrequest.requestid, request.requestid))
    .leftJoin(facility, eq(reservationrequest.facilityid, facility.facilityid))
    .innerJoin(guest, eq(request.guestid, guest.guestid))
    .leftJoin(name, eq(guest.nameid, name.nameid))
    .where(
      and(
        eq(reservationrequest.requestid, requestId),
        eq(request.hotelid, hotelId)
      )
    );

  if (!reservationRequestData) {
    return next(new NotFoundError('Reservation request'));
  }

  let primaryContact: { email: string | null; phone: string | null } = { email: null, phone: null };
  if (reservationRequestData.guest.guestid) {
    const guestId = reservationRequestData.guest.guestid;
    const emailResult = await db.select({ address: emailaddress.address })
      .from(emailaddress)
      .where(and(eq(emailaddress.guestid, guestId), eq(emailaddress.isprimary, true)))
      .limit(1);
    const phoneResult = await db.select({ number: phonenumber.number })
      .from(phonenumber)
      .where(and(eq(phonenumber.guestid, guestId), eq(phonenumber.isprimary, true)))
      .limit(1);
    primaryContact = { 
      email: emailResult[0]?.address ?? null, 
      phone: phoneResult[0]?.number ?? null 
    };
  }

  const response = {
    requestId: reservationRequestData.reservationrequest.requestid,
    hotelId: reservationRequestData.request.hotelid,
    guestId: reservationRequestData.guest.guestid,
    stayReservationId: reservationRequestData.request.reservationid,
    guestInfo: {
      name: reservationRequestData.name ? 
        `${reservationRequestData.name.title || ''} ${reservationRequestData.name.firstname || ''} ${reservationRequestData.name.lastname || ''}`.trim() : 
        'Unknown Guest',
      email: primaryContact.email,
      phone: primaryContact.phone
    },
    facilityType: reservationRequestData.reservationrequest.facilitytype,
    facility: reservationRequestData.reservationrequest.facilityid ? {
      facilityId: reservationRequestData.reservationrequest.facilityid,
      name: reservationRequestData.facility?.name,
      description: reservationRequestData.facility?.description,
      type: reservationRequestData.facility?.type
    } : null,
    reservationTime: reservationRequestData.reservationrequest.reservationtime,
    partySize: reservationRequestData.reservationrequest.partysize,
    duration: reservationRequestData.reservationrequest.duration,
    specialRequests: reservationRequestData.reservationrequest.specialrequests,
    status: reservationRequestData.request.status,
    scheduledTime: reservationRequestData.request.scheduledtime,
    completedAt: reservationRequestData.request.completedat,
    notes: reservationRequestData.request.notes,
    createdAt: reservationRequestData.reservationrequest.createdat,
    updatedAt: reservationRequestData.reservationrequest.updatedat
  };

  res.json(response);
}));

/**
 * Update reservation request status
 * 
 * @route PUT /api/management/reservation-requests/:requestId/status
 * @param {string} requestId - The request ID
 * @param {string} hotelId - The hotel ID for validation
 * @param {string} status - The new status
 */
router.put('/:requestId/status', asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const { requestId } = req.params;
  const { status, hotelId } = req.body;

  if (!requestId || !status || !hotelId) {
    return next(new ValidationError('Missing required fields for status update', [
        {field: 'requestId', message: 'requestId is required'},
        {field: 'status', message: 'status is required'},
        {field: 'hotelId', message: 'hotelId is required for validation'}
    ]));
  }

  if (!(requestStatusEnum.enumValues as readonly string[]).includes(status)) {
    return next(new ValidationError('Invalid status value', [{ field: 'status', message: `Valid statuses are: ${requestStatusEnum.enumValues.join(', ')}` }]));
  }

  const [reqToUpdate] = await db.select({ id: request.requestid })
      .from(request)
      .where(and(eq(request.requestid, requestId), eq(request.hotelid, hotelId)));

  if (!reqToUpdate) {
    return next(new NotFoundError(`Reservation request with ID ${requestId} for hotel ${hotelId}`));
  }

  const updatedResult = await db.update(request)
    .set({ 
      status: status as typeof requestStatusEnum.enumValues[number], 
      updatedat: new Date().toISOString(),
      completedat: status === 'Completed' || status === 'Cancelled' ? new Date().toISOString() : null
    })
    .where(eq(request.requestid, requestId))
    .returning({ updatedStatus: request.status, completedAt: request.completedat, updatedAt: request.updatedat });
  
  if (updatedResult.length === 0) {
      return next(new DatabaseError('Failed to update reservation request status, record not found after update attempt.'));
  }

  res.status(200).json({ message: 'Reservation request status updated successfully', details: updatedResult[0] });
}));

// Placeholder for POST route (Create new reservation request)
// This would typically be in a guest-facing API, but if management can create them:
router.post('/', asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const {
        hotelId,
        guestId,
        reservationId,
        facilityId,
        facilityType,
        reservationTime,
        partySize,
        duration,
        specialRequests,
        notes,
    } = req.body;

    if (!hotelId || !guestId || !reservationId || !facilityId || !facilityType || !reservationTime || !partySize) {
        return next(new ValidationError('Missing required fields for creating reservation request', [
            {field: 'hotelId', message: 'hotelId required'},
            {field: 'guestId', message: 'guestId required'},
            {field: 'reservationId', message: 'Stay reservationId required'},
            {field: 'facilityId', message: 'facilityId required'},
            {field: 'facilityType', message: 'facilityType required'},
            {field: 'reservationTime', message: 'reservationTime required'},
            {field: 'partySize', message: 'partySize required'},
        ]));
    }

    if (typeof facilityType !== 'string' || facilityType.trim() === '') {
        return next(new ValidationError('Invalid facility type provided', [{field: 'facilityType', message: 'Facility type must be a non-empty string'}]));
    }

    const [guestExists] = await db.select({id: guest.guestid}).from(guest).where(eq(guest.guestid, guestId));
    if (!guestExists) return next(new NotFoundError('Guest'));

    const [facilityExists] = await db.select({id: facility.facilityid}).from(facility).where(and(eq(facility.facilityid, facilityId), eq(facility.type, facilityType), eq(facility.hotelid, hotelId)));
    if (!facilityExists) return next(new NotFoundError('Facility matching type and hotel'));

    const newRequestId = uuidv4();
    const now = new Date().toISOString();

    try {
        const createdReservationRequestData = await db.transaction(async (tx) => {
            await tx.insert(request).values({
                requestid: newRequestId,
                hotelid: hotelId,
                guestid: guestId,
                reservationid: reservationId,
                requesttype: 'RESERVATION',
                status: requestStatusEnum.enumValues[0],
                scheduledtime: new Date(reservationTime).toISOString(),
                notes: notes,
            });

            const [newResRequest] = await tx.insert(reservationrequest).values({
                requestid: newRequestId,
                facilityid: facilityId,
                facilitytype: facilityType,
                reservationtime: new Date(reservationTime).toISOString(),
                partysize: partySize,
                duration: duration,
                specialrequests: specialRequests,
            }).returning();
            return newResRequest;
        });

        const [fetchedData] = await db
            .select({
              reservationrequest: {
                requestid: reservationrequest.requestid,
                facilitytype: reservationrequest.facilitytype,
                facilityid: reservationrequest.facilityid,
                reservationtime: reservationrequest.reservationtime,
                partysize: reservationrequest.partysize,
                specialrequests: reservationrequest.specialrequests,
                duration: reservationrequest.duration,
                createdat: reservationrequest.createdat,
                updatedat: reservationrequest.updatedat
              },
              request: {
                hotelid: request.hotelid,
                guestid: request.guestid,
                status: request.status,
                scheduledtime: request.scheduledtime,
                completedat: request.completedat,
                notes: request.notes,
                reservationid: request.reservationid
              },
              facility: {
                name: facility.name,
                description: facility.description,
                type: facility.type
              },
              guest: { guestid: guest.guestid },
              name: { firstname: name.firstname, lastname: name.lastname, title: name.title }
            })
            .from(reservationrequest)
            .innerJoin(request, eq(reservationrequest.requestid, request.requestid))
            .leftJoin(facility, eq(reservationrequest.facilityid, facility.facilityid))
            .innerJoin(guest, eq(request.guestid, guest.guestid))
            .leftJoin(name, eq(guest.nameid, name.nameid))
            .where(eq(reservationrequest.requestid, newRequestId));

        if (!fetchedData) {
            return next(new DatabaseError("Failed to retrieve created reservation request after transaction."));
        }

        let primaryContact: { email: string | null; phone: string | null } = { email: null, phone: null };
        if (fetchedData.guest.guestid) {
            const guestId = fetchedData.guest.guestid;
            const emailResult = await db.select({ address: emailaddress.address })
              .from(emailaddress).where(and(eq(emailaddress.guestid, guestId), eq(emailaddress.isprimary, true))).limit(1);
            const phoneResult = await db.select({ number: phonenumber.number })
              .from(phonenumber).where(and(eq(phonenumber.guestid, guestId), eq(phonenumber.isprimary, true))).limit(1);
            primaryContact = { email: emailResult[0]?.address ?? null, phone: phoneResult[0]?.number ?? null };
        }

        const response = {
            requestId: fetchedData.reservationrequest.requestid,
            hotelId: fetchedData.request.hotelid,
            guestId: fetchedData.guest.guestid,
            stayReservationId: fetchedData.request.reservationid,
            guestInfo: {
                name: fetchedData.name ? 
                    `${fetchedData.name.title || ''} ${fetchedData.name.firstname || ''} ${fetchedData.name.lastname || ''}`.trim() : 
                    'Unknown Guest',
                email: primaryContact.email,
                phone: primaryContact.phone
            },
            facilityType: fetchedData.reservationrequest.facilitytype,
            facility: fetchedData.reservationrequest.facilityid ? {
                facilityId: fetchedData.reservationrequest.facilityid,
                name: fetchedData.facility?.name,
                description: fetchedData.facility?.description,
                type: fetchedData.facility?.type
            } : null,
            reservationTime: fetchedData.reservationrequest.reservationtime,
            partySize: fetchedData.reservationrequest.partysize,
            duration: fetchedData.reservationrequest.duration,
            specialRequests: fetchedData.reservationrequest.specialrequests,
            status: fetchedData.request.status,
            scheduledTime: fetchedData.request.scheduledtime,
            completedAt: fetchedData.request.completedat,
            notes: fetchedData.request.notes,
            createdAt: fetchedData.reservationrequest.createdat,
            updatedAt: fetchedData.reservationrequest.updatedat
        };
        
        res.status(201).json(response);
    } catch (error) { 
        console.error("Error creating reservation request:", error);
        return next(new DatabaseError("Failed to create reservation request due to a database issue."));
    }
}));

export default router; 