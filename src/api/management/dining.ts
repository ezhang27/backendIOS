import { Router, Request, Response, NextFunction, RequestHandler } from 'express';
import { db } from '../../config/db';
import { 
  diningrequest,
  diningorderitem,
  request,
  menuitem,
  room,
  restaurant,
  guest,
  name,
  emailaddress,
  phonenumber,
  contacttype,
  roomserviceitem,
  price as priceTable,
  currency,
  requestStatusEnum,
  diningRequestPaymentStatusEnum,
  charge
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

const router = Router();

/**
 * Get all dining requests for a hotel
 * 
 * @route GET /api/management/dining
 * @param {string} hotelId - The hotel ID
 * @param {string} status - (Optional) Filter by request status
 * @param {string} paymentStatus - (Optional) Filter by payment status
 * @param {number} page - (Optional) Page number for pagination
 * @param {number} limit - (Optional) Number of items per page
 */
router.get('/', asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const hotelId = req.query.hotelId as string;
  const statusQuery = req.query.status as string;
  const paymentStatusQuery = req.query.paymentStatus as string;
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 20;

  if (!hotelId) {
    return next(new ValidationError('Hotel ID is required', [{ field: 'hotelId', message: 'hotelId required' }]));
  }

  const offset = (page - 1) * limit;
  const conditions = [eq(request.hotelid, hotelId)];
  
  if (statusQuery) {
    const statusArray = statusQuery.split(',').map(s => s.trim()).filter(s => s);
    const validStatuses = statusArray.filter(s => (requestStatusEnum.enumValues as readonly string[]).includes(s));
    if (validStatuses.length > 0) {
      conditions.push(inArray(request.status, validStatuses as (typeof requestStatusEnum.enumValues[number])[]));
    } else if (statusArray.length > 0) {
        // If statuses were provided but none are valid, return empty set
        conditions.push(sql`false`);
    }
  }

  if (paymentStatusQuery) {
    const paymentStatusArray = paymentStatusQuery.split(',').map(ps => ps.trim()).filter(ps => ps);
    // Validate against paymentStatusEnum
    const validPaymentStatuses = paymentStatusArray.filter(ps => (diningRequestPaymentStatusEnum.enumValues as readonly string[]).includes(ps));
    if (validPaymentStatuses.length > 0) {
        conditions.push(inArray(diningrequest.paymentstatus, validPaymentStatuses as (typeof diningRequestPaymentStatusEnum.enumValues[number])[]));
    } else if (paymentStatusArray.length > 0) {
        // If payment statuses were provided but none are valid, return empty set
        conditions.push(sql`false`);
    }
  }
  
  const combinedWhereClause = and(...conditions);

  const diningRequestsData = await db
    .select({
      // diningrequest fields
      requestId: diningrequest.requestid,
      totalAmount: diningrequest.totalamount,
      deliveryInstructions: diningrequest.deliveryinstructions,
      roomId: diningrequest.roomid,
      restaurantId: diningrequest.restaurantid,
      numGuests: diningrequest.numguests,
      paymentMethod: diningrequest.paymentmethod,
      paymentStatus: diningrequest.paymentstatus,
      serviceContext: diningrequest.servicecontext,
      drCreatedAt: diningrequest.createdat,
      drUpdatedAt: diningrequest.updatedat,
      // request fields
      hotelId: request.hotelid,
      guestId: request.guestid,
      status: request.status,
      scheduledTime: request.scheduledtime,
      completedAt: request.completedat,
      notes: request.notes,
      // room fields
      roomNumber: room.roomnumber,
      floor: room.floor,
      // restaurant fields
      restaurantName: restaurant.name,
      // guest name fields (joined through request -> guest -> name)
      guestFirstName: name.firstname,
      guestLastName: name.lastname,
      guestTitle: name.title
    })
    .from(diningrequest)
    .innerJoin(request, eq(diningrequest.requestid, request.requestid))
    .leftJoin(room, eq(diningrequest.roomid, room.roomid))
    .leftJoin(restaurant, eq(diningrequest.restaurantid, restaurant.restaurantid))
    .innerJoin(guest, eq(request.guestid, guest.guestid)) // Changed to innerJoin assuming guest must exist
    .leftJoin(name, eq(guest.nameid, name.nameid))
    .where(combinedWhereClause)
    .orderBy(desc(request.createdat))
    .limit(limit)
    .offset(offset);

  const countResult = await db
    .select({ count: sql<number>`count(${diningrequest.requestid})`.mapWith(Number) })
    .from(diningrequest)
    .innerJoin(request, eq(diningrequest.requestid, request.requestid))
    // Join needed if filtering on payment status or guest name etc. in count
    .where(combinedWhereClause);
    
  const totalCount = countResult[0]?.count ?? 0;
  const totalPages = Math.ceil(totalCount / limit);

  // Fetch guest primary contacts and order items separately for efficiency
  const guestIds = diningRequestsData.map(dr => dr.guestId);
  const requestIds = diningRequestsData.map(dr => dr.requestId);
  
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

  let orderItemsByRequestId: Record<string, any[]> = {};
  if (requestIds.length > 0) {
    const itemsData = await db
      .select({
        orderitemid: diningorderitem.orderitemid,
        requestid: diningorderitem.requestid,
        menuitemid: diningorderitem.menuitemid,
        rsItemid: diningorderitem.rsItemid,
        quantity: diningorderitem.quantity,
        specialinstructions: diningorderitem.specialinstructions,
        priceid: diningorderitem.priceid,
        // Get details from joined tables
        menuItemName: menuitem.itemname,
        rsItemName: roomserviceitem.itemname,
        priceAmount: priceTable.amount,
        currencyCode: currency.code
      })
      .from(diningorderitem)
      .leftJoin(menuitem, eq(diningorderitem.menuitemid, menuitem.menuitemid))
      .leftJoin(roomserviceitem, eq(diningorderitem.rsItemid, roomserviceitem.rsItemid))
      .leftJoin(priceTable, eq(diningorderitem.priceid, priceTable.priceid)) // Join price table
      .leftJoin(currency, eq(priceTable.currencyid, currency.currencyid)) // Join currency table
      .where(inArray(diningorderitem.requestid, requestIds));

      orderItemsByRequestId = itemsData.reduce((acc, item) => {
          const reqId = item.requestid;
          if (!acc[reqId]) acc[reqId] = [];
          acc[reqId].push({
              orderItemId: item.orderitemid,
              menuItemId: item.menuitemid,
              rsItemId: item.rsItemid,
              itemName: item.menuItemName || item.rsItemName || 'Unknown Item',
              price: item.priceAmount ? { amount: item.priceAmount, currencyCode: item.currencyCode } : null,
              quantity: item.quantity,
              specialInstructions: item.specialinstructions,
              priceId: item.priceid
          });
          return acc;
      }, {} as Record<string, any[]>);
  }

  const formattedDiningRequests = diningRequestsData.map(dr => ({
    requestId: dr.requestId,
    hotelId: dr.hotelId,
    guestId: dr.guestId,
    guestName: `${dr.guestTitle || ''} ${dr.guestFirstName || ''} ${dr.guestLastName || ''}`.trim() || 'Unknown Guest',
    guestContact: guestContacts[dr.guestId] || { email: null, phone: null },
    totalAmount: dr.totalAmount,
    deliveryInstructions: dr.deliveryInstructions,
    serviceContext: dr.serviceContext,
    room: dr.roomId ? { roomId: dr.roomId, roomNumber: dr.roomNumber, floor: dr.floor } : null,
    restaurant: dr.restaurantId ? { restaurantId: dr.restaurantId, name: dr.restaurantName } : null,
    numGuests: dr.numGuests,
    paymentMethod: dr.paymentMethod,
    paymentStatus: dr.paymentStatus,
    status: dr.status,
    scheduledTime: dr.scheduledTime,
    completedAt: dr.completedAt,
    notes: dr.notes,
    createdAt: dr.drCreatedAt,
    updatedAt: dr.drUpdatedAt,
    orderItems: orderItemsByRequestId[dr.requestId] || []
  }));

  res.json({ 
    data: formattedDiningRequests,
    meta: {
      page,
      limit,
      totalCount,
      totalPages
    }
  });
}));

/**
 * Get a specific dining request by ID
 * 
 * @route GET /api/management/dining/:requestId
 * @param {string} requestId - The request ID
 * @param {string} hotelId - The hotel ID for validation
 */
router.get('/:requestId', asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const { requestId } = req.params;
  const hotelId = req.query.hotelId as string;

  if (!requestId) {
    return next(new ValidationError('Request ID is required', [{ field: 'requestId', message: 'requestId required' }]));
  }
  if (!hotelId) {
    return next(new ValidationError('Hotel ID is required for validation', [{ field: 'hotelId', message: 'hotelId required' }]));
  }

  // Fetch main request details (Define structure more explicitly)
  const [requestDetails] = await db
    .select({
      // diningrequest fields
      requestId: diningrequest.requestid,
      totalAmount: diningrequest.totalamount,
      deliveryInstructions: diningrequest.deliveryinstructions,
      roomId: diningrequest.roomid,
      restaurantId: diningrequest.restaurantid,
      numGuests: diningrequest.numguests,
      paymentMethod: diningrequest.paymentmethod,
      paymentStatus: diningrequest.paymentstatus,
      serviceContext: diningrequest.servicecontext,
      drCreatedAt: diningrequest.createdat,
      drUpdatedAt: diningrequest.updatedat,
      // request fields
      hotelId: request.hotelid,
      guestId: request.guestid,
      status: request.status,
      scheduledTime: request.scheduledtime,
      completedAt: request.completedat,
      notes: request.notes,
      // room fields
      roomNumber: room.roomnumber,
      floor: room.floor,
      // restaurant fields
      restaurantName: restaurant.name,
      // guest name fields
      guestFirstName: name.firstname,
      guestLastName: name.lastname,
      guestTitle: name.title
    })
    .from(diningrequest)
    .innerJoin(request, eq(diningrequest.requestid, request.requestid))
    .leftJoin(room, eq(diningrequest.roomid, room.roomid))
    .leftJoin(restaurant, eq(diningrequest.restaurantid, restaurant.restaurantid))
    .innerJoin(guest, eq(request.guestid, guest.guestid))
    .leftJoin(name, eq(guest.nameid, name.nameid))
    .where(and(eq(diningrequest.requestid, requestId), eq(request.hotelid, hotelId)));

  if (!requestDetails) {
    return next(new NotFoundError('Dining request'));
  }

  // Fetch order items (using correct joins and price details)
  const orderItemsData = await db
    .select({
      orderitemid: diningorderitem.orderitemid,
      requestid: diningorderitem.requestid,
      menuitemid: diningorderitem.menuitemid,
      rsItemid: diningorderitem.rsItemid,
      quantity: diningorderitem.quantity,
      specialinstructions: diningorderitem.specialinstructions,
      priceid: diningorderitem.priceid,
      menuItemName: menuitem.itemname,
      rsItemName: roomserviceitem.itemname,
      priceAmount: priceTable.amount,
      currencyCode: currency.code
    })
    .from(diningorderitem)
    .leftJoin(menuitem, eq(diningorderitem.menuitemid, menuitem.menuitemid))
    .leftJoin(roomserviceitem, eq(diningorderitem.rsItemid, roomserviceitem.rsItemid))
    .leftJoin(priceTable, eq(diningorderitem.priceid, priceTable.priceid))
    .leftJoin(currency, eq(priceTable.currencyid, currency.currencyid))
    .where(eq(diningorderitem.requestid, requestId));
    
  // Fetch guest primary contact correctly
  let primaryContact: { email: string | null; phone: string | null } = { email: null, phone: null };
  if (requestDetails.guestId) {
    const emailResult = await db.select({ address: emailaddress.address })
      .from(emailaddress)
      .where(and(eq(emailaddress.guestid, requestDetails.guestId), eq(emailaddress.isprimary, true)))
      .limit(1);
    const phoneResult = await db.select({ number: phonenumber.number })
      .from(phonenumber)
      .where(and(eq(phonenumber.guestid, requestDetails.guestId), eq(phonenumber.isprimary, true)))
      .limit(1);
    primaryContact = { 
      email: emailResult[0]?.address ?? null, 
      phone: phoneResult[0]?.number ?? null 
    };
  }

  // Format response
  const formattedResponse = { 
    requestId: requestDetails.requestId,
    hotelId: requestDetails.hotelId,
    guestId: requestDetails.guestId,
    guestInfo: {
      name: `${requestDetails.guestTitle || ''} ${requestDetails.guestFirstName || ''} ${requestDetails.guestLastName || ''}`.trim() || 'Unknown Guest',
      // Include primary contact fetched separately
      email: primaryContact.email,
      phone: primaryContact.phone
    },
    totalAmount: requestDetails.totalAmount,
    deliveryInstructions: requestDetails.deliveryInstructions,
    serviceContext: requestDetails.serviceContext,
    room: requestDetails.roomId ? { roomId: requestDetails.roomId, roomNumber: requestDetails.roomNumber, floor: requestDetails.floor } : null,
    restaurant: requestDetails.restaurantId ? { restaurantId: requestDetails.restaurantId, name: requestDetails.restaurantName } : null,
    numGuests: requestDetails.numGuests,
    paymentMethod: requestDetails.paymentMethod,
    paymentStatus: requestDetails.paymentStatus,
    status: requestDetails.status,
    scheduledTime: requestDetails.scheduledTime,
    completedAt: requestDetails.completedAt,
    notes: requestDetails.notes,
    createdAt: requestDetails.drCreatedAt,
    updatedAt: requestDetails.drUpdatedAt,
    orderItems: orderItemsData.map(item => ({ 
      orderItemId: item.orderitemid,
      menuItemId: item.menuitemid,
      rsItemId: item.rsItemid,
      itemName: item.menuItemName || item.rsItemName || 'Unknown Item',
      price: item.priceAmount ? { amount: item.priceAmount, currencyCode: item.currencyCode } : null,
      quantity: item.quantity,
      specialInstructions: item.specialinstructions,
      priceId: item.priceid
    }))
  };

  res.json(formattedResponse);
}));

/**
 * Update dining request status
 * 
 * @route PUT /api/management/dining/:requestId/status
 * @param {string} requestId - The request ID
 * @param {string} hotelId - The hotel ID for validation
 * @param {string} status - The new status
 */
router.put('/:requestId/status', asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const { requestId } = req.params;
  const { status, hotelId } = req.body;

  if (!requestId || !status || !hotelId) {
    return next(new ValidationError('Missing required fields', [{ field: 'requestId', message: 'requestId required' }, { field: 'status', message: 'status required' }, { field: 'hotelId', message: 'hotelId required' }]));
  }

  if (!(requestStatusEnum.enumValues as readonly string[]).includes(status)) {
    return next(new ValidationError('Invalid status value', [{ field: 'status', message: 'Invalid status' }]));
  }

  const [reqExists] = await db.select({ id: request.requestid }).from(request)
    .where(and(eq(request.requestid, requestId), eq(request.hotelid, hotelId)));
  if (!reqExists) {
    return next(new NotFoundError('Dining request'));
  }

  await db.update(request)
    .set({ 
      status: status as typeof requestStatusEnum.enumValues[number], 
      // updatedat will be handled by DB
      completedat: status === 'Completed' ? new Date().toISOString() : (status === 'Cancelled' ? new Date().toISOString() : undefined) // Also handle Cancelled
    })
    .where(eq(request.requestid, requestId));

  // Re-fetch the updated dining request
  const [requestDetails] = await db
    .select({
      requestId: diningrequest.requestid,
      totalAmount: diningrequest.totalamount,
      deliveryInstructions: diningrequest.deliveryinstructions,
      roomId: diningrequest.roomid,
      restaurantId: diningrequest.restaurantid,
      numGuests: diningrequest.numguests,
      paymentMethod: diningrequest.paymentmethod,
      paymentStatus: diningrequest.paymentstatus,
      serviceContext: diningrequest.servicecontext,
      drCreatedAt: diningrequest.createdat,
      drUpdatedAt: diningrequest.updatedat,
      hotelId: request.hotelid,
      guestId: request.guestid,
      status: request.status,
      scheduledTime: request.scheduledtime,
      completedAt: request.completedat,
      notes: request.notes,
      roomNumber: room.roomnumber,
      floor: room.floor,
      restaurantName: restaurant.name,
      guestFirstName: name.firstname,
      guestLastName: name.lastname,
      guestTitle: name.title
    })
    .from(diningrequest)
    .innerJoin(request, eq(diningrequest.requestid, request.requestid))
    .leftJoin(room, eq(diningrequest.roomid, room.roomid))
    .leftJoin(restaurant, eq(diningrequest.restaurantid, restaurant.restaurantid))
    .innerJoin(guest, eq(request.guestid, guest.guestid))
    .leftJoin(name, eq(guest.nameid, name.nameid))
    .where(and(eq(diningrequest.requestid, requestId), eq(request.hotelid, hotelId)));

  if (!requestDetails) { // Should not happen if update was successful and reqExists check passed
    return next(new NotFoundError('Dining request after update'));
  }

  const orderItemsData = await db
    .select({
      orderitemid: diningorderitem.orderitemid,
      requestid: diningorderitem.requestid,
      menuitemid: diningorderitem.menuitemid,
      rsItemid: diningorderitem.rsItemid,
      quantity: diningorderitem.quantity,
      specialinstructions: diningorderitem.specialinstructions,
      priceid: diningorderitem.priceid,
      menuItemName: menuitem.itemname,
      rsItemName: roomserviceitem.itemname,
      priceAmount: priceTable.amount,
      currencyCode: currency.code
    })
    .from(diningorderitem)
    .leftJoin(menuitem, eq(diningorderitem.menuitemid, menuitem.menuitemid))
    .leftJoin(roomserviceitem, eq(diningorderitem.rsItemid, roomserviceitem.rsItemid))
    .leftJoin(priceTable, eq(diningorderitem.priceid, priceTable.priceid))
    .leftJoin(currency, eq(priceTable.currencyid, currency.currencyid))
    .where(eq(diningorderitem.requestid, requestId));
    
  let primaryContact: { email: string | null; phone: string | null } = { email: null, phone: null };
  if (requestDetails.guestId) {
    const emailResult = await db.select({ address: emailaddress.address })
      .from(emailaddress)
      .where(and(eq(emailaddress.guestid, requestDetails.guestId), eq(emailaddress.isprimary, true)))
      .limit(1);
    const phoneResult = await db.select({ number: phonenumber.number })
      .from(phonenumber)
      .where(and(eq(phonenumber.guestid, requestDetails.guestId), eq(phonenumber.isprimary, true)))
      .limit(1);
    primaryContact = { 
      email: emailResult[0]?.address ?? null, 
      phone: phoneResult[0]?.number ?? null 
    };
  }

  const formattedResponse = { 
    requestId: requestDetails.requestId,
    hotelId: requestDetails.hotelId,
    guestId: requestDetails.guestId,
    guestInfo: {
      name: `${requestDetails.guestTitle || ''} ${requestDetails.guestFirstName || ''} ${requestDetails.guestLastName || ''}`.trim() || 'Unknown Guest',
      email: primaryContact.email,
      phone: primaryContact.phone
    },
    totalAmount: requestDetails.totalAmount,
    deliveryInstructions: requestDetails.deliveryInstructions,
    serviceContext: requestDetails.serviceContext,
    room: requestDetails.roomId ? { roomId: requestDetails.roomId, roomNumber: requestDetails.roomNumber, floor: requestDetails.floor } : null,
    restaurant: requestDetails.restaurantId ? { restaurantId: requestDetails.restaurantId, name: requestDetails.restaurantName } : null,
    numGuests: requestDetails.numGuests,
    paymentMethod: requestDetails.paymentMethod,
    paymentStatus: requestDetails.paymentStatus,
    status: requestDetails.status,
    scheduledTime: requestDetails.scheduledTime,
    completedAt: requestDetails.completedAt,
    notes: requestDetails.notes,
    createdAt: requestDetails.drCreatedAt,
    updatedAt: requestDetails.drUpdatedAt, // This will be the new updatedat from the DB
    orderItems: orderItemsData.map(item => ({ 
      orderItemId: item.orderitemid,
      menuItemId: item.menuitemid,
      rsItemId: item.rsItemid,
      itemName: item.menuItemName || item.rsItemName || 'Unknown Item',
      price: item.priceAmount ? { amount: item.priceAmount, currencyCode: item.currencyCode } : null,
      quantity: item.quantity,
      specialInstructions: item.specialinstructions,
      priceId: item.priceid
    }))
  };
  res.status(200).json(formattedResponse);
}));

/**
 * Update dining request payment status
 * 
 * @route PUT /api/management/dining/:requestId/payment
 * @param {string} requestId - The request ID
 * @param {string} hotelId - The hotel ID for validation
 * @param {string} paymentStatus - The new payment status
 */
router.put('/:requestId/payment', asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const { requestId } = req.params;
  const { paymentStatus, paymentMethod, hotelId } = req.body;

  if (!requestId || !paymentStatus || !hotelId) {
    return next(new ValidationError('Missing required fields', [{ field: 'requestId', message: 'requestId required' }, { field: 'paymentStatus', message: 'paymentStatus required' }, { field: 'hotelId', message: 'hotelId required' }]));
  }
  
  // Validate paymentStatus against enum
  if (!(diningRequestPaymentStatusEnum.enumValues as readonly string[]).includes(paymentStatus)) {
    return next(new ValidationError('Invalid payment status value', [{ field: 'paymentStatus', message: 'Invalid payment status. Must be one of: ' + diningRequestPaymentStatusEnum.enumValues.join(', ') }]));
  }

  const [reqExists] = await db.select({ id: diningrequest.requestid }).from(diningrequest)
    .innerJoin(request, eq(diningrequest.requestid, request.requestid))
    .where(and(eq(diningrequest.requestid, requestId), eq(request.hotelid, hotelId)));
  if (!reqExists) {
    return next(new NotFoundError('Dining request'));
  }

  const updateData: Partial<typeof diningrequest.$inferInsert> = { 
    paymentstatus: paymentStatus as typeof diningRequestPaymentStatusEnum.enumValues[number],
    // updatedat will be handled by DB
  };
  if (paymentMethod) {
    updateData.paymentmethod = paymentMethod;
  }

  await db.transaction(async (tx) => {
    // 1. Update the dining request payment status
    await tx.update(diningrequest)
      .set(updateData)
      .where(eq(diningrequest.requestid, requestId));
    
    // 2. Get all dining order items for this request to update their charges
    const orderItems = await tx.select({ 
      orderItemId: diningorderitem.orderitemid 
    })
    .from(diningorderitem)
    .where(eq(diningorderitem.requestid, requestId));
    
    if (orderItems.length > 0) {
      // Find all charges linked to these order items
      const orderItemIds = orderItems.map(item => item.orderItemId);
      const relatedCharges = await tx.select({ chargeid: charge.chargeid })
        .from(charge)
        .where(inArray(charge.sourceDiningOrderItemId, orderItemIds));
      
      if (relatedCharges.length > 0) {
        const chargeIds = relatedCharges.map(c => c.chargeid);
        
        // Update charges based on payment status
        if (paymentStatus === 'Paid') {
          await tx.update(charge)
            .set({
              ispaid: true,
              paidtimestamp: new Date().toISOString(),
              notes: sql`CONCAT(COALESCE(${charge.notes}, ''), ' Marked as paid through dining request update at ', NOW()::text)`
            })
            .where(inArray(charge.chargeid, chargeIds));
        } 
        else if (paymentStatus === 'Failed' || paymentStatus === 'Waived' || paymentStatus === 'Refunded') {
          // For failed/waived/refunded, mark charges accordingly
          await tx.update(charge)
            .set({
              description: sql`CONCAT(${charge.description}, ' [', ${paymentStatus.toUpperCase()}, ']')`,
              notes: sql`CONCAT(COALESCE(${charge.notes}, ''), ' Marked as ', ${paymentStatus}, ' through dining request update at ', NOW()::text)`
            })
            .where(inArray(charge.chargeid, chargeIds));
          
          // For refunds, we might create a negative balancing charge, but that's outside scope here
        }
      }
    }
  });

  // Re-fetch the updated request
  const requestDetails = await db.query.diningrequest.findFirst({
    where: eq(diningrequest.requestid, requestId),
    with: {
      request: true,
      room: true,
      restaurant: true
    }
  });

  if (!requestDetails) {
    return next(new NotFoundError('Dining request'));
  }

  const orderItemsData = await db
    .select({
      orderitemid: diningorderitem.orderitemid,
      requestid: diningorderitem.requestid,
      menuitemid: diningorderitem.menuitemid,
      rsItemid: diningorderitem.rsItemid,
      quantity: diningorderitem.quantity,
      specialinstructions: diningorderitem.specialinstructions,
      priceid: diningorderitem.priceid,
      menuItemName: menuitem.itemname,
      rsItemName: roomserviceitem.itemname,
      priceAmount: priceTable.amount,
      currencyCode: currency.code
    })
    .from(diningorderitem)
    .leftJoin(menuitem, eq(diningorderitem.menuitemid, menuitem.menuitemid))
    .leftJoin(roomserviceitem, eq(diningorderitem.rsItemid, roomserviceitem.rsItemid))
    .leftJoin(priceTable, eq(diningorderitem.priceid, priceTable.priceid))
    .leftJoin(currency, eq(priceTable.currencyid, currency.currencyid))
    .where(eq(diningorderitem.requestid, requestId));

  // Fetch guest details
  const [guestDetails] = requestDetails.request ? 
    await db
      .select({
        firstName: name.firstname,
        lastName: name.lastname,
        title: name.title
      })
      .from(guest)
      .leftJoin(name, eq(guest.nameid, name.nameid))
      .where(eq(guest.guestid, requestDetails.request.guestid)) : [];

  // Fetch guest contact info - primary email and phone
  let primaryContact = { email: null, phone: null };
  if (requestDetails.request?.guestid) {
    const emailResult = await db.select({ address: emailaddress.address })
      .from(emailaddress)
      .where(and(eq(emailaddress.guestid, requestDetails.request.guestid), eq(emailaddress.isprimary, true)))
      .limit(1);
    const phoneResult = await db.select({ number: phonenumber.number })
      .from(phonenumber)
      .where(and(eq(phonenumber.guestid, requestDetails.request.guestid), eq(phonenumber.isprimary, true)))
      .limit(1);
    primaryContact = { 
      email: emailResult[0]?.address ?? null, 
      phone: phoneResult[0]?.number ?? null 
    };
  }

  const formattedResponse = { 
    requestId: requestDetails.requestid,
    hotelId: requestDetails.request?.hotelid,
    guestInfo: {
      guestId: requestDetails.request?.guestid,
      name: guestDetails ? `${guestDetails.title || ''} ${guestDetails.firstName || ''} ${guestDetails.lastName || ''}`.trim() : 'Unknown Guest',
      email: primaryContact.email,
      phone: primaryContact.phone
    },
    totalAmount: requestDetails.totalamount,
    deliveryInstructions: requestDetails.deliveryinstructions,
    context: requestDetails.servicecontext,
    room: requestDetails.room ? { roomId: requestDetails.room.roomid, roomNumber: requestDetails.room.roomnumber, floor: requestDetails.room.floor } : null,
    restaurant: requestDetails.restaurant ? { restaurantId: requestDetails.restaurant.restaurantid, name: requestDetails.restaurant.name } : null,
    numGuests: requestDetails.numguests,
    paymentMethod: requestDetails.paymentmethod,
    paymentStatus: requestDetails.paymentstatus,
    status: requestDetails.request?.status,
    scheduledTime: requestDetails.request?.scheduledtime,
    completedAt: requestDetails.request?.completedat,
    notes: requestDetails.request?.notes,
    createdAt: requestDetails.createdat,
    updatedAt: requestDetails.updatedat,
    orderItems: orderItemsData.map(item => ({ 
      orderItemId: item.orderitemid,
      menuItemId: item.menuitemid,
      rsItemId: item.rsItemid,
      itemName: item.menuItemName || item.rsItemName || 'Unknown Item',
      price: item.priceAmount ? { amount: item.priceAmount, currencyCode: item.currencyCode } : null,
      quantity: item.quantity,
      specialInstructions: item.specialinstructions,
      priceId: item.priceid
    }))
  };
  res.status(200).json(formattedResponse);
}));

export default router; 