import express, { Request, Response, NextFunction } from 'express';
import { db } from '../../config/db';
import { 
  generalrequest,
  request,
  room,
  guest,
  name,
  emailaddress,
  phonenumber,
  requestStatusEnum,
  // generalRequestCategoryEnum // Removed as it's not in schema
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
import { v4 as uuidv4 } from 'uuid';
import asyncHandler from 'express-async-handler';
import { NotFoundError, ValidationError, DatabaseError } from '../../middleware/errorHandler';

const router = express.Router();

/**
 * Get all general requests for a hotel
 * 
 * @route GET /api/management/general
 * @param {string} hotelId - The hotel ID
 * @param {string} status - (Optional) Filter by request status (comma-separated)
 * @param {string} category - (Optional) Filter by request category (comma-separated)
 * @param {number} page - (Optional) Page number for pagination
 * @param {number} limit - (Optional) Number of items per page
 */
router.get('/', asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const hotelId = req.query.hotelId as string;
  const statusQuery = req.query.status as string;
  const categoryQuery = req.query.category as string;
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

  if (categoryQuery) {
    const categoryArray = categoryQuery.split(',').map(c => c.trim()).filter(c => c);
    if (categoryArray.length > 0) {
      whereConditions.push(inArray(generalrequest.requestcategory, categoryArray));
    } else if (categoryArray.length > 0) {
        whereConditions.push(sql`false`);
    }
  }
  
  const combinedWhereClause = and(...whereConditions);

  const generalRequestsData = await db
    .select({
      generalrequest: {
        requestid: generalrequest.requestid,
        requestcategory: generalrequest.requestcategory,
        description: generalrequest.description,
        roomid: generalrequest.roomid,
        createdat: generalrequest.createdat,
        updatedat: generalrequest.updatedat
      },
      request: {
        hotelid: request.hotelid,
        guestid: request.guestid,
        status: request.status,
        name: request.name,
        department: request.department,
        scheduledtime: request.scheduledtime,
        completedat: request.completedat,
        notes: request.notes
      },
      room: {
        roomnumber: room.roomnumber,
        floor: room.floor,
        type: room.type
      },
      guest: {
        guestid: guest.guestid 
      },
      guestName: {
        firstname: name.firstname,
        lastname: name.lastname,
        title: name.title
      }
    })
    .from(generalrequest)
    .innerJoin(request, eq(generalrequest.requestid, request.requestid))
    .leftJoin(room, eq(generalrequest.roomid, room.roomid))
    .innerJoin(guest, eq(request.guestid, guest.guestid))
    .leftJoin(name, eq(guest.nameid, name.nameid))
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

  const guestIds = generalRequestsData.map(gr => gr.guest.guestid).filter(id => id);
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

  const formattedGeneralRequests = generalRequestsData.map(gr => ({
    requestId: gr.generalrequest.requestid,
    hotelId: gr.request.hotelid,
    guestId: gr.guest.guestid,
    guestName: gr.guestName ? 
      `${gr.guestName.title || ''} ${gr.guestName.firstname || ''} ${gr.guestName.lastname || ''}`.trim() : 
      'Unknown Guest',
    guestContact: guestContacts[gr.guest.guestid] || { email: null, phone: null },
    requestName: gr.request.name,
    requestCategory: gr.generalrequest.requestcategory,
    department: gr.request.department,
    description: gr.generalrequest.description || gr.request.notes,
    room: gr.generalrequest.roomid && gr.room ? {
      roomId: gr.generalrequest.roomid,
      roomNumber: gr.room.roomnumber,
      floor: gr.room.floor,
      type: gr.room.type
    } : null,
    status: gr.request.status,
    scheduledTime: gr.request.scheduledtime,
    completedAt: gr.request.completedat,
    createdAt: gr.generalrequest.createdat,
    updatedAt: gr.generalrequest.updatedat
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
 * Get a specific general request by ID
 * 
 * @route GET /api/management/general/:requestId
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

  const [generalRequestData] = await db
    .select({
      generalrequest: {
        requestid: generalrequest.requestid,
        requestcategory: generalrequest.requestcategory,
        description: generalrequest.description,
        roomid: generalrequest.roomid,
        createdat: generalrequest.createdat,
        updatedat: generalrequest.updatedat
      },
      request: {
        hotelid: request.hotelid,
        guestid: request.guestid,
        requesttype: request.requesttype,
        name: request.name,
        department: request.department,
        status: request.status,
        scheduledtime: request.scheduledtime,
        completedat: request.completedat,
        notes: request.notes,
        reservationid: request.reservationid
      },
      room: {
        roomnumber: room.roomnumber,
        floor: room.floor,
        type: room.type
      },
      guest: {
        guestid: guest.guestid
      },
      guestName: {
        firstname: name.firstname,
        lastname: name.lastname,
        title: name.title
      }
    })
    .from(generalrequest)
    .innerJoin(request, eq(generalrequest.requestid, request.requestid))
    .leftJoin(room, eq(generalrequest.roomid, room.roomid))
    .innerJoin(guest, eq(request.guestid, guest.guestid))
    .leftJoin(name, eq(guest.nameid, name.nameid))
    .where(
      and(
        eq(generalrequest.requestid, requestId),
        eq(request.hotelid, hotelId)
      )
    );

  if (!generalRequestData) {
    return next(new NotFoundError('General request'));
  }

  let primaryContact: { email: string | null; phone: string | null } = { email: null, phone: null };
  const guestId = generalRequestData.guest.guestid;
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
  

  const response = {
    requestId: generalRequestData.generalrequest.requestid,
    hotelId: generalRequestData.request.hotelid,
    guestId: generalRequestData.guest.guestid,
    reservationId: generalRequestData.request.reservationid,
    guestInfo: {
      name: generalRequestData.guestName ? 
        `${generalRequestData.guestName.title || ''} ${generalRequestData.guestName.firstname || ''} ${generalRequestData.guestName.lastname || ''}`.trim() : 
        'Unknown Guest',
      email: primaryContact.email,
      phone: primaryContact.phone
    },
    requestName: generalRequestData.request.name,
    requestType: generalRequestData.request.requesttype,
    requestCategory: generalRequestData.generalrequest.requestcategory,
    department: generalRequestData.request.department,
    description: generalRequestData.generalrequest.description || generalRequestData.request.notes,
    room: generalRequestData.generalrequest.roomid && generalRequestData.room ? {
      roomId: generalRequestData.generalrequest.roomid,
      roomNumber: generalRequestData.room.roomnumber,
      floor: generalRequestData.room.floor,
      type: generalRequestData.room.type
    } : null,
    status: generalRequestData.request.status,
    scheduledTime: generalRequestData.request.scheduledtime,
    completedAt: generalRequestData.request.completedat,
    notes: generalRequestData.request.notes,
    createdAt: generalRequestData.generalrequest.createdat,
    updatedAt: generalRequestData.generalrequest.updatedat
  };

  res.json(response);
}));

// POST / - Create a new general request (management might not do this often, but for completeness)
router.post('/', asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const {
        hotelId,
        guestId,
        reservationId,
        requestCategory,
        description,
        roomId,
        requestName,
        department,
        notes
    } = req.body;

    if (!hotelId || !guestId || !reservationId || !requestCategory || !description) {
        return next(new ValidationError('Missing required fields', [
            { field: 'hotelId', message: 'hotelId is required' },
            { field: 'guestId', message: 'guestId is required' },
            { field: 'reservationId', message: 'Stay reservationId is required' },
            { field: 'requestCategory', message: 'requestCategory is required' },
            { field: 'description', message: 'description is required' },
        ]));
    }

    if (typeof requestCategory !== 'string' || requestCategory.trim() === '') {
        return next(new ValidationError('Invalid request category', [{ field: 'requestCategory', message: 'Category must be a non-empty string.' }]));
    }

    const [guestExists] = await db.select({id: guest.guestid}).from(guest).where(eq(guest.guestid, guestId));
    if (!guestExists) return next(new NotFoundError('Guest'));

    if (roomId) {
        const [roomExists] = await db.select({id: room.roomid}).from(room).where(and(eq(room.roomid, roomId), eq(room.hotelid, hotelId)));
        if (!roomExists) return next(new NotFoundError('Room in this hotel'));
    }

    const newRequestId = uuidv4();
    const now = new Date().toISOString();

    try {
        const createdGeneralRequest = await db.transaction(async (tx) => {
            await tx.insert(request).values({
                requestid: newRequestId,
                hotelid: hotelId,
                guestid: guestId,
                reservationid: reservationId,
                requesttype: 'GENERAL',
                status: requestStatusEnum.enumValues[0],
                name: requestName,
                department: department,
                notes: notes,
            });

            const [newGenRequest] = await tx.insert(generalrequest).values({
                requestid: newRequestId,
                requestcategory: requestCategory,
                description: description,
                roomid: roomId,
            }).returning();
            return newGenRequest;
        });
        const [createdRequestData] = await db
            .select({
                generalrequest: {
                    requestid: generalrequest.requestid,
                    requestcategory: generalrequest.requestcategory,
                    description: generalrequest.description,
                    roomid: generalrequest.roomid,
                    createdat: generalrequest.createdat,
                    updatedat: generalrequest.updatedat
                },
                request: {
                    hotelid: request.hotelid,
                    guestid: request.guestid,
                    requesttype: request.requesttype,
                    name: request.name,
                    department: request.department,
                    status: request.status,
                    scheduledtime: request.scheduledtime,
                    completedat: request.completedat,
                    notes: request.notes,
                    reservationid: request.reservationid
                },
                room: {
                    roomnumber: room.roomnumber,
                    floor: room.floor,
                    type: room.type
                },
                guest: { guestid: guest.guestid },
                guestName: { firstname: name.firstname, lastname: name.lastname, title: name.title }
            })
            .from(generalrequest)
            .innerJoin(request, eq(generalrequest.requestid, request.requestid))
            .leftJoin(room, eq(generalrequest.roomid, room.roomid))
            .innerJoin(guest, eq(request.guestid, guest.guestid))
            .leftJoin(name, eq(guest.nameid, name.nameid))
            .where(eq(generalrequest.requestid, newRequestId));

        if (!createdRequestData) {
            return next(new DatabaseError("Failed to retrieve created general request after transaction."));
        }

        let primaryContact: { email: string | null; phone: string | null } = { email: null, phone: null };
        const createdGuestId = createdRequestData.guest.guestid;
        if (createdGuestId) {
            const emailResult = await db.select({ address: emailaddress.address })
                .from(emailaddress)
                .where(and(eq(emailaddress.guestid, createdGuestId), eq(emailaddress.isprimary, true)))
                .limit(1);
            const phoneResult = await db.select({ number: phonenumber.number })
                .from(phonenumber)
                .where(and(eq(phonenumber.guestid, createdGuestId), eq(phonenumber.isprimary, true)))
                .limit(1);
            primaryContact = { 
                email: emailResult[0]?.address ?? null, 
                phone: phoneResult[0]?.number ?? null 
            };
        }

        res.status(201).json({
            requestId: createdRequestData.generalrequest.requestid,
            hotelId: createdRequestData.request.hotelid,
            guestId: createdRequestData.guest.guestid,
            reservationId: createdRequestData.request.reservationid,
            guestInfo: {
                name: createdRequestData.guestName ? 
                    `${createdRequestData.guestName.title || ''} ${createdRequestData.guestName.firstname || ''} ${createdRequestData.guestName.lastname || ''}`.trim() : 
                    'Unknown Guest',
                email: primaryContact.email,
                phone: primaryContact.phone
            },
            requestName: createdRequestData.request.name,
            requestCategory: createdRequestData.generalrequest.requestcategory,
            department: createdRequestData.request.department,
            description: createdRequestData.generalrequest.description || createdRequestData.request.notes,
            room: createdRequestData.generalrequest.roomid && createdRequestData.room ? {
                roomId: createdRequestData.generalrequest.roomid,
                roomNumber: createdRequestData.room.roomnumber,
                floor: createdRequestData.room.floor,
                type: createdRequestData.room.type
            } : null,
            status: createdRequestData.request.status,
            scheduledTime: createdRequestData.request.scheduledtime,
            completedAt: createdRequestData.request.completedat,
            notes: createdRequestData.request.notes,
            createdAt: createdRequestData.generalrequest.createdat,
            updatedAt: createdRequestData.generalrequest.updatedat
        });

    } catch (error) {
        console.error("Error creating general request:", error);
        return next(new DatabaseError("Failed to create general request."));
    }
}));

// PUT /:requestId/status - Update general request status
router.put('/:requestId/status', asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const { requestId } = req.params;
    const { status, hotelId, notes } = req.body;

    if (!requestId || !status || !hotelId) {
        return next(new ValidationError('Missing required fields for status update', [
            { field: 'requestId', message: 'requestId is required' },
            { field: 'status', message: 'status is required' },
            { field: 'hotelId', message: 'hotelId is required for validation' },
        ]));
    }

    if (!(requestStatusEnum.enumValues as readonly string[]).includes(status)) {
        return next(new ValidationError('Invalid status value', [{ field: 'status', message: `Valid statuses are: ${requestStatusEnum.enumValues.join(', ')}` }]));
    }

    const [reqToUpdate] = await db.select({ id: request.requestid })
        .from(request)
        .where(and(eq(request.requestid, requestId), eq(request.hotelid, hotelId)));

    if (!reqToUpdate) {
        return next(new NotFoundError(`General request with ID ${requestId} for hotel ${hotelId}`));
    }
    
    const updateData: Partial<typeof request.$inferInsert> = {
        status: status as typeof requestStatusEnum.enumValues[number],
        updatedat: new Date().toISOString(),
        completedat: (status === 'Completed' || status === 'Cancelled') ? new Date().toISOString() : null,
    };
    if (notes !== undefined) {
        updateData.notes = notes;
    }

    const updatedResult = await db.update(request)
        .set(updateData)
        .where(eq(request.requestid, requestId))
        .returning({ 
            updatedStatus: request.status, 
            completedAt: request.completedat, 
            updatedAt: request.updatedat,
            notes: request.notes 
        });

    if (updatedResult.length === 0) {
        return next(new DatabaseError('Failed to update general request status.'));
    }

    res.status(200).json({ message: 'General request status updated successfully', details: updatedResult[0] });
}));

/**
 * Get categories for general requests
 * 
 * @route GET /api/management/general/categories
 */
router.get('/categories/all', async (req: Request, res: Response) => {
  try {
    // Get distinct categories
    const categories = await db
      .selectDistinct({ category: generalrequest.requestcategory })
      .from(generalrequest)
      .orderBy(generalrequest.requestcategory);

    res.json({
      data: categories.map(c => c.category)
    });
  } catch (error: any) {
    console.error('Error fetching general request categories:', error);
    res.status(500).json({ message: 'Error fetching general request categories', error: error.message });
  }
});

export default router; 