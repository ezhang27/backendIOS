import { Router, Request, Response, NextFunction } from 'express';
import { eq, and, desc, sql, isNull, inArray } from 'drizzle-orm';
import { db } from '../../config/db';
import { 
  request, 
  guest, 
  diningrequest, 
  diningorderitem,
  menuitem,
  room, 
  restaurant,
  price as priceTable,
  charge,
  currency,
  requestStatusEnum,
  diningRequestContextEnum,
  roomserviceitem,
  diningRequestPaymentStatusEnum
} from '../../models/schema';
import { v4 as uuidv4 } from 'uuid';
import asyncHandler from 'express-async-handler';
import { NotFoundError, ValidationError, DatabaseError } from '../../middleware/errorHandler';

const router = Router();

/**
 * Get all dining requests for a guest
 * 
 * @route GET /api/guest/dining-requests
 * @param {string} guestId - The guest ID
 * @param {string} status - (Optional) Filter by request status
 * @param {string} paymentStatus - (Optional) Filter by payment status
 * @param {number} page - (Optional) Page number for pagination
 * @param {number} limit - (Optional) Number of items per page
 * @returns {object} List of dining requests with pagination metadata
 */
router.get('/', asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const guestId = req.query.guestId as string;
  const statusQuery = req.query.status as string;
  const paymentStatusQuery = req.query.paymentStatus as string;
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
  
  if (paymentStatusQuery) {
    const paymentStatusArray = paymentStatusQuery.split(',').map(ps => ps.trim()).filter(ps => ps);
    if (paymentStatusArray.length > 0) {
      conditions.push(inArray(diningrequest.paymentstatus, paymentStatusArray));
    }
  }
  
  const combinedWhereClause = and(...conditions);
  
  const diningRequestsData = await db
    .select({
      requestId: diningrequest.requestid,
      totalAmount: diningrequest.totalamount,
      deliveryInstructions: diningrequest.deliveryinstructions,
      roomId: diningrequest.roomid,
      restaurantId: diningrequest.restaurantid,
      numGuests: diningrequest.numguests,
      paymentMethod: diningrequest.paymentmethod,
      paymentStatus: diningrequest.paymentstatus,
      context: diningrequest.servicecontext,
      drCreatedAt: diningrequest.createdat,
      drUpdatedAt: diningrequest.updatedat,
      hotelId: request.hotelid,
      guestId: request.guestid,
      status: request.status,
      scheduledTime: request.scheduledtime,
      completedAt: request.completedat,
      notes: request.notes,
      reqCreatedAt: request.createdat,
      reqUpdatedAt: request.updatedat,
      roomNumber: room.roomnumber,
      floor: room.floor,
      restaurantName: restaurant.name
    })
    .from(diningrequest)
    .innerJoin(request, eq(diningrequest.requestid, request.requestid))
    .leftJoin(room, eq(diningrequest.roomid, room.roomid))
    .leftJoin(restaurant, eq(diningrequest.restaurantid, restaurant.restaurantid))
    .where(combinedWhereClause)
    .orderBy(desc(request.createdat))
    .limit(limit)
    .offset(offset);
  
  const countResult = await db
    .select({ count: sql<number>`count(${diningrequest.requestid})`.mapWith(Number) })
    .from(diningrequest)
    .innerJoin(request, eq(diningrequest.requestid, request.requestid))
    .where(combinedWhereClause);
  
  const totalCount = countResult[0]?.count ?? 0;
  const totalPages = Math.ceil(totalCount / limit);
  
  const formattedDiningRequests = diningRequestsData.map(dr => ({
    requestId: dr.requestId,
    hotelId: dr.hotelId,
    guestId: dr.guestId,
    totalAmount: dr.totalAmount,
    deliveryInstructions: dr.deliveryInstructions,
    context: dr.context,
    room: dr.roomId ? { roomId: dr.roomId, roomNumber: dr.roomNumber, floor: dr.floor } : null,
    restaurant: dr.restaurantId ? { restaurantId: dr.restaurantId, name: dr.restaurantName } : null,
    numGuests: dr.numGuests,
    paymentMethod: dr.paymentMethod,
    paymentStatus: dr.paymentStatus,
    status: dr.status,
    scheduledTime: dr.scheduledTime,
    completedAt: dr.completedAt,
    notes: dr.notes,
    createdAt: dr.reqCreatedAt,
    updatedAt: dr.reqUpdatedAt
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
 * Get specific dining request details
 * 
 * @route GET /api/guest/dining-requests/:requestId
 * @param {string} requestId - The request ID
 * @param {string} guestId - The guest ID
 * @returns {object} Dining request details
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
  
  const [diningRequestData] = await db
    .select({
      requestId: diningrequest.requestid,
      totalAmount: diningrequest.totalamount,
      deliveryInstructions: diningrequest.deliveryinstructions,
      roomId: diningrequest.roomid,
      restaurantId: diningrequest.restaurantid,
      numGuests: diningrequest.numguests,
      paymentMethod: diningrequest.paymentmethod,
      paymentStatus: diningrequest.paymentstatus,
      context: diningrequest.servicecontext,
      drCreatedAt: diningrequest.createdat,
      drUpdatedAt: diningrequest.updatedat,
      hotelId: request.hotelid,
      guestId: request.guestid,
      status: request.status,
      scheduledTime: request.scheduledtime,
      completedAt: request.completedat,
      notes: request.notes,
      reqCreatedAt: request.createdat,
      reqUpdatedAt: request.updatedat,
      roomNumber: room.roomnumber,
      floor: room.floor,
      restaurantName: restaurant.name
    })
    .from(diningrequest)
    .innerJoin(request, eq(diningrequest.requestid, request.requestid))
    .leftJoin(room, eq(diningrequest.roomid, room.roomid))
    .leftJoin(restaurant, eq(diningrequest.restaurantid, restaurant.restaurantid))
    .where(and(eq(diningrequest.requestid, requestId), eq(request.guestid, guestId)));
  
  if (!diningRequestData) {
    return next(new NotFoundError('Dining request'));
  }
  
  const orderItemsData = await db
    .select({
      orderItemId: diningorderitem.orderitemid,
      menuItemId: diningorderitem.menuitemid,
      rsItemId: diningorderitem.rsItemid,
      quantity: diningorderitem.quantity,
      specialInstructions: diningorderitem.specialinstructions,
      priceId: diningorderitem.priceid,
      menuItemName: menuitem.itemname,
      rsItemName: roomserviceitem.itemname,
      priceAmount: priceTable.amount,
      currencyCode: currency.code
    })
    .from(diningorderitem)
    .leftJoin(menuitem, eq(diningorderitem.menuitemid, menuitem.menuitemid))
    .leftJoin(roomserviceitem, eq(diningorderitem.rsItemid, roomserviceitem.rsItemid))
    .innerJoin(priceTable, eq(diningorderitem.priceid, priceTable.priceid))
    .innerJoin(currency, eq(priceTable.currencyid, currency.currencyid))
    .where(eq(diningorderitem.requestid, requestId));

  const response = {
    requestId: diningRequestData.requestId,
    hotelId: diningRequestData.hotelId,
    guestId: diningRequestData.guestId,
    totalAmount: diningRequestData.totalAmount,
    deliveryInstructions: diningRequestData.deliveryInstructions,
    context: diningRequestData.context,
    room: diningRequestData.roomId ? { roomId: diningRequestData.roomId, roomNumber: diningRequestData.roomNumber, floor: diningRequestData.floor } : null,
    restaurant: diningRequestData.restaurantId ? { restaurantId: diningRequestData.restaurantId, name: diningRequestData.restaurantName } : null,
    numGuests: diningRequestData.numGuests,
    paymentMethod: diningRequestData.paymentMethod,
    paymentStatus: diningRequestData.paymentStatus,
    status: diningRequestData.status,
    scheduledTime: diningRequestData.scheduledTime,
    completedAt: diningRequestData.completedAt,
    notes: diningRequestData.notes,
    createdAt: diningRequestData.reqCreatedAt,
    updatedAt: diningRequestData.reqUpdatedAt,
    orderItems: orderItemsData.map(item => ({
      orderItemId: item.orderItemId,
      menuItemId: item.menuItemId,
      rsItemId: item.rsItemId,
      itemName: item.menuItemName || item.rsItemName || 'Unknown Item',
      quantity: item.quantity,
      specialInstructions: item.specialInstructions,
      price: {
          amount: item.priceAmount,
          currencyCode: item.currencyCode
      },
      priceId: item.priceId,
    }))
  };
  
  res.json(response);
}));

/**
 * Create a new dining request
 * 
 * @route POST /api/guest/dining-requests
 * @param {string} guestId - The guest ID
 * @param {string} hotelId - The hotel ID
 * @param {string} reservationId - The reservation ID
 * @param {string} roomId - The room ID
 * @param {number} numGuests - Number of guests
 * @param {string} deliveryInstructions - Special delivery instructions
 * @param {Array} orderItems - Array of order items with menuItemId and quantity
 * @returns {object} Created dining request
 */
router.post('/', asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const {
    guestId,
    hotelId,
    reservationId,
    currencyCode,
    roomId,
    restaurantId,
    numGuests,
    deliveryInstructions,
    paymentMethod,
    paymentStatus = 'Pending',
    scheduledTime,
    notes,
    context,
    items
  } = req.body;

  if (!guestId || !hotelId || !reservationId || !items || !Array.isArray(items) || items.length === 0 || !context || !currencyCode) {
    return next(new ValidationError('Missing required fields', [
      { field: 'guestId', message: 'Required'},
      { field: 'hotelId', message: 'Required'},
      { field: 'reservationId', message: 'Required'},
      { field: 'currencyCode', message: 'Required'},
      { field: 'context', message: 'Required'},
      { field: 'items', message: 'Required non-empty array'},
    ]));
  }
  if (!diningRequestContextEnum.enumValues.includes(context)) {
     return next(new ValidationError('Invalid context value', [{field: 'context', message: `Must be one of: ${diningRequestContextEnum.enumValues.join(', ')}`}]));
  }
  for(const item of items) {
      if (!item.quantity || item.quantity <= 0 || !item.priceId || (!item.menuItemId && !item.rsItemId)) {
          return next(new ValidationError('Invalid item structure', [{field: 'items', message: 'Each item needs quantity > 0, priceId, and menuItemId or rsItemId'}]));
      }
  }
  
  const currencyRecord = await db.select({ id: currency.currencyid }).from(currency).where(eq(currency.code, currencyCode.toUpperCase())).limit(1);
  if (currencyRecord.length === 0) {
    return next(new NotFoundError(`Currency code ${currencyCode}`));
  }
  const currencyIdDb = currencyRecord[0].id;

  const requestId = uuidv4();
  let calculatedTotalAmount = 0;

  await db.transaction(async (tx) => {
    const requestInsertTime = new Date().toISOString();

    await tx.insert(request).values({
      requestid: requestId,
      hotelid: hotelId,
      guestid: guestId,
      reservationid: reservationId,
      requesttype: 'Dining',
      status: requestStatusEnum.enumValues[0],
      scheduledtime: scheduledTime ? new Date(scheduledTime).toISOString() : undefined,
      notes: notes,
    });

    await tx.insert(diningrequest).values({
      requestid: requestId,
      totalamount: '0.00',
      deliveryinstructions: deliveryInstructions,
      roomid: roomId,
      restaurantid: restaurantId,
      numguests: numGuests,
      paymentmethod: paymentMethod,
      paymentstatus: paymentStatus,
      servicecontext: context,
    });

    const chargeInsertTime = new Date().toISOString();

    for (const item of items) {
      const orderItemId = uuidv4();
      const chargeId = uuidv4();

      const priceResult = await tx.select({ amount: priceTable.amount }).from(priceTable).where(eq(priceTable.priceid, item.priceId)).limit(1);
      if (priceResult.length === 0) {
          throw new DatabaseError(`Price ID ${item.priceId} not found for item.`);
      }
      const itemBaseAmount = parseFloat(priceResult[0].amount) * item.quantity;
      const itemTaxAmount = 0.00;
      const itemTotalAmount = itemBaseAmount + itemTaxAmount;
      calculatedTotalAmount += itemTotalAmount;

      await tx.insert(diningorderitem).values({
        orderitemid: orderItemId,
        requestid: requestId,
        menuitemid: item.menuItemId,
        rsItemid: item.rsItemId,
        quantity: item.quantity,
        specialinstructions: item.specialInstructions,
        priceid: item.priceId,
      });

      await tx.insert(charge).values({
          chargeid: chargeId,
          hotelid: hotelId,
          reservationid: reservationId,
          guestid: guestId,
          sourceDiningOrderItemId: orderItemId,
          sourceEventBookingId: null,
          sourceSpecialProductId: null,
          description: `Dining Order Item ${item.menuItemId || item.rsItemId || 'Unknown'}`,
          baseamount: itemBaseAmount.toFixed(2),
          taxamount: itemTaxAmount.toFixed(2),
          totalamount: itemTotalAmount.toFixed(2),
          currencycode: currencyCode.toUpperCase(),
          ispaid: false,
          ischargedtoroom: true,
          istaxed: itemTaxAmount > 0,
          chargetimestamp: chargeInsertTime,
          servicetimestamp: scheduledTime ? new Date(scheduledTime).toISOString() : chargeInsertTime,
      });
    }

    await tx.update(diningrequest)
      .set({ totalamount: calculatedTotalAmount.toFixed(2) })
      .where(eq(diningrequest.requestid, requestId));
  });

  const [createdDiningRequestData] = await db
    .select({
        requestId: diningrequest.requestid,
        totalAmount: diningrequest.totalamount,
        deliveryInstructions: diningrequest.deliveryinstructions,
        roomId: diningrequest.roomid,
        restaurantId: diningrequest.restaurantid,
        numGuests: diningrequest.numguests,
        paymentMethod: diningrequest.paymentmethod,
        paymentStatus: diningrequest.paymentstatus,
        context: diningrequest.servicecontext,
        drCreatedAt: diningrequest.createdat,
        drUpdatedAt: diningrequest.updatedat,
        hotelId: request.hotelid,
        guestIdReq: request.guestid,
        status: request.status,
        scheduledTime: request.scheduledtime,
        completedAt: request.completedat,
        notes: request.notes,
        reqCreatedAt: request.createdat,
        reqUpdatedAt: request.updatedat,
        roomNumber: room.roomnumber,
        floor: room.floor,
        restaurantName: restaurant.name
    })
    .from(diningrequest)
    .innerJoin(request, eq(diningrequest.requestid, request.requestid))
    .leftJoin(room, eq(diningrequest.roomid, room.roomid))
    .leftJoin(restaurant, eq(diningrequest.restaurantid, restaurant.restaurantid))
    .where(eq(diningrequest.requestid, requestId));

  if (!createdDiningRequestData) {
      return next(new DatabaseError('Failed to retrieve created dining request.'));
  }

  const orderItemsData = await db
    .select({
        orderItemId: diningorderitem.orderitemid,
        menuItemId: diningorderitem.menuitemid,
        rsItemId: diningorderitem.rsItemid,
        quantity: diningorderitem.quantity,
        specialInstructions: diningorderitem.specialinstructions,
        priceId: diningorderitem.priceid,
        menuItemName: menuitem.itemname,
        rsItemName: roomserviceitem.itemname,
        priceAmount: priceTable.amount,
        priceCurrencyCode: currency.code
    })
    .from(diningorderitem)
    .leftJoin(menuitem, eq(diningorderitem.menuitemid, menuitem.menuitemid))
    .leftJoin(roomserviceitem, eq(diningorderitem.rsItemid, roomserviceitem.rsItemid))
    .innerJoin(priceTable, eq(diningorderitem.priceid, priceTable.priceid))
    .innerJoin(currency, eq(priceTable.currencyid, currency.currencyid))
    .where(eq(diningorderitem.requestid, requestId));

  const response = {
    requestId: createdDiningRequestData.requestId,
    hotelId: createdDiningRequestData.hotelId,
    guestId: createdDiningRequestData.guestIdReq,
    totalAmount: createdDiningRequestData.totalAmount,
    deliveryInstructions: createdDiningRequestData.deliveryInstructions,
    context: createdDiningRequestData.context,
    room: createdDiningRequestData.roomId ? { roomId: createdDiningRequestData.roomId, roomNumber: createdDiningRequestData.roomNumber, floor: createdDiningRequestData.floor } : null,
    restaurant: createdDiningRequestData.restaurantId ? { restaurantId: createdDiningRequestData.restaurantId, name: createdDiningRequestData.restaurantName } : null,
    numGuests: createdDiningRequestData.numGuests,
    paymentMethod: createdDiningRequestData.paymentMethod,
    paymentStatus: createdDiningRequestData.paymentStatus,
    status: createdDiningRequestData.status,
    scheduledTime: createdDiningRequestData.scheduledTime,
    completedAt: createdDiningRequestData.completedAt,
    notes: createdDiningRequestData.notes,
    createdAt: createdDiningRequestData.reqCreatedAt,
    updatedAt: createdDiningRequestData.reqUpdatedAt,
    orderItems: orderItemsData.map(item => ({
        orderItemId: item.orderItemId,
        menuItemId: item.menuItemId,
        rsItemId: item.rsItemId,
        itemName: item.menuItemName || item.rsItemName || 'Unknown Item',
        quantity: item.quantity,
        specialInstructions: item.specialInstructions,
        price: {
            amount: item.priceAmount,
            currencyCode: item.priceCurrencyCode
        },
        priceId: item.priceId,
    }))
  };

  res.status(201).json(response);
}));

/**
 * Cancel a dining request
 * 
 * @route PUT /api/guest/dining-requests/:requestId/cancel
 * @param {string} requestId - The request ID
 * @param {string} guestId - The guest ID
 * @returns {object} Cancelled dining request status
 */
router.put('/:requestId/cancel', asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const { requestId } = req.params;
  const guestId = req.body.guestId as string;
  
  if (!guestId) {
    return next(new ValidationError('Missing guestId in request body', [{field: 'guestId', message:'guestId required'}]));
  }
  if (!requestId) {
    return next(new ValidationError('Missing requestId parameter', [{field: 'requestId', message:'requestId required'}]));
  }

  const reqRecord = await db.select({ 
    status: request.status, 
    guestid: request.guestid,
    hotelid: request.hotelid,
    reservationid: request.reservationid
  }).from(request).where(eq(request.requestid, requestId)).limit(1);
  
  if (reqRecord.length === 0) {
    return next(new NotFoundError('Dining request'));
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
  const now = new Date().toISOString();

  await db.transaction(async (tx) => {
      const cancelledStatus = requestStatusEnum.enumValues.find(e => e === 'Cancelled');
      if (!cancelledStatus) throw new Error("'Cancelled' status not found in requestStatusEnum");
      
      await tx.update(request)
        .set({ status: cancelledStatus })
        .where(eq(request.requestid, requestId));

      await tx.update(diningrequest)
        .set({
          paymentstatus: diningRequestPaymentStatusEnum.enumValues[2],
        })
        .where(
          and(
            eq(diningrequest.requestid, requestId),
            eq(diningrequest.paymentstatus, diningRequestPaymentStatusEnum.enumValues[0])
          )
        );
        
      // Get all dining order items for this request to void their charges
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
          .where(and(
            inArray(charge.sourceDiningOrderItemId, orderItemIds),
            eq(charge.ispaid, false) // Only void unpaid charges
          ));
        
        // Void the charges
        if (relatedCharges.length > 0) {
          const chargeIds = relatedCharges.map(c => c.chargeid);
          await tx.update(charge)
            .set({
              description: sql`CONCAT(${charge.description}, ' [VOIDED]')`,
              ispaid: false,
              baseamount: '0.00',
              taxamount: '0.00',
              totalamount: '0.00',
              notes: sql`CONCAT(COALESCE(${charge.notes}, ''), ' Voided due to dining request cancellation at ', NOW()::text)`
            })
            .where(inArray(charge.chargeid, chargeIds));
        }
      }
  });

  const [updatedDiningRequestData] = await db
    .select({
        requestId: diningrequest.requestid,
        totalAmount: diningrequest.totalamount,
        deliveryInstructions: diningrequest.deliveryinstructions,
        roomId: diningrequest.roomid,
        restaurantId: diningrequest.restaurantid,
        numGuests: diningrequest.numguests,
        paymentMethod: diningrequest.paymentmethod,
        paymentStatus: diningrequest.paymentstatus,
        context: diningrequest.servicecontext,
        drCreatedAt: diningrequest.createdat,
        drUpdatedAt: diningrequest.updatedat,
        hotelId: request.hotelid,
        guestIdReq: request.guestid,
        status: request.status,
        scheduledTime: request.scheduledtime,
        completedAt: request.completedat,
        notes: request.notes,
        reqCreatedAt: request.createdat,
        reqUpdatedAt: request.updatedat,
        roomNumber: room.roomnumber,
        floor: room.floor,
        restaurantName: restaurant.name
    })
    .from(diningrequest)
    .innerJoin(request, eq(diningrequest.requestid, request.requestid))
    .leftJoin(room, eq(diningrequest.roomid, room.roomid))
    .leftJoin(restaurant, eq(diningrequest.restaurantid, restaurant.restaurantid))
    .where(and(eq(diningrequest.requestid, requestId), eq(request.guestid, guestId)));

  if (!updatedDiningRequestData) {
    return next(new NotFoundError('Dining request not found after cancel operation, or guestId mismatch.'));
  }

  const orderItemsData = await db
    .select({
        orderItemId: diningorderitem.orderitemid,
        menuItemId: diningorderitem.menuitemid,
        rsItemId: diningorderitem.rsItemid,
        quantity: diningorderitem.quantity,
        specialInstructions: diningorderitem.specialinstructions,
        priceId: diningorderitem.priceid,
        menuItemName: menuitem.itemname,
        rsItemName: roomserviceitem.itemname,
        priceAmount: priceTable.amount,
        priceCurrencyCode: currency.code
    })
    .from(diningorderitem)
    .leftJoin(menuitem, eq(diningorderitem.menuitemid, menuitem.menuitemid))
    .leftJoin(roomserviceitem, eq(diningorderitem.rsItemid, roomserviceitem.rsItemid))
    .innerJoin(priceTable, eq(diningorderitem.priceid, priceTable.priceid))
    .innerJoin(currency, eq(priceTable.currencyid, currency.currencyid))
    .where(eq(diningorderitem.requestid, requestId));

  const response = {
    requestId: updatedDiningRequestData.requestId,
    hotelId: updatedDiningRequestData.hotelId,
    guestId: updatedDiningRequestData.guestIdReq,
    totalAmount: updatedDiningRequestData.totalAmount,
    deliveryInstructions: updatedDiningRequestData.deliveryInstructions,
    context: updatedDiningRequestData.context,
    room: updatedDiningRequestData.roomId ? { roomId: updatedDiningRequestData.roomId, roomNumber: updatedDiningRequestData.roomNumber, floor: updatedDiningRequestData.floor } : null,
    restaurant: updatedDiningRequestData.restaurantId ? { restaurantId: updatedDiningRequestData.restaurantId, name: updatedDiningRequestData.restaurantName } : null,
    numGuests: updatedDiningRequestData.numGuests,
    paymentMethod: updatedDiningRequestData.paymentMethod,
    paymentStatus: updatedDiningRequestData.paymentStatus,
    status: updatedDiningRequestData.status,
    scheduledTime: updatedDiningRequestData.scheduledTime,
    completedAt: updatedDiningRequestData.completedAt,
    notes: updatedDiningRequestData.notes,
    createdAt: updatedDiningRequestData.reqCreatedAt,
    updatedAt: updatedDiningRequestData.reqUpdatedAt,
    orderItems: orderItemsData.map(item => ({
        orderItemId: item.orderItemId,
        menuItemId: item.menuItemId,
        rsItemId: item.rsItemId,
        itemName: item.menuItemName || item.rsItemName || 'Unknown Item',
        quantity: item.quantity,
        specialInstructions: item.specialInstructions,
        price: {
            amount: item.priceAmount,
            currencyCode: item.priceCurrencyCode
        },
        priceId: item.priceId,
    }))
  };

  res.status(200).json(response);
}));

export default router; 