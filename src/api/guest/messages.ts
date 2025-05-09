import { Router, Request, Response, NextFunction } from 'express';
import { eq, and, desc, sql, or, isNull } from 'drizzle-orm';
import { db } from '../../config/db';
import { 
  message, 
  messagetype,
  announcement,
  guest,
  name,
  employee,
  announcementTypeEnum
} from '../../models/schema';
import { asyncHandler, NotFoundError, ValidationError, DatabaseError } from '../../middleware/errorHandler';
import { validations } from '../../middleware/validators';

const router = Router();

/**
 * @swagger
 * /api/guest/messages:
 *   get:
 *     summary: Get all messages for a guest
 *     description: Retrieves a list of messages for a specific guest
 *     tags:
 *       - Guest Messages
 *     security:
 *       - guestId: []
 *     parameters:
 *       - in: header
 *         name: X-Guest-ID
 *         schema:
 *           type: string
 *           format: uuid
 *         required: true
 *         description: The unique identifier of the guest
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *         description: Filter messages by type
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Page number for pagination
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 10
 *         description: Number of items per page
 *     responses:
 *       200:
 *         description: A list of messages
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       messageId:
 *                         type: string
 *                         format: uuid
 *                       type:
 *                         type: string
 *                       sender:
 *                         type: object
 *                         properties:
 *                           employeeId:
 *                             type: string
 *                             format: uuid
 *                           name:
 *                             type: string
 *                       subject:
 *                         type: string
 *                       content:
 *                         type: string
 *                       createdAt:
 *                         type: string
 *                         format: date-time
 *                 meta:
 *                   type: object
 *                   properties:
 *                     page:
 *                       type: integer
 *                     limit:
 *                       type: integer
 *                     totalCount:
 *                       type: integer
 *                     totalPages:
 *                       type: integer
 *       400:
 *         description: Bad request - Missing or invalid parameters
 *       500:
 *         description: Server error
 */
router.get('/', validations.headers.guestId, asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const guestId = req.headers['x-guest-id'] as string;
  const typeQuery = req.query.type as string;
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;
  
  const offset = (page - 1) * limit;
  const conditions = [eq(message.receiverid, guestId)];
  
  if (typeQuery) {
    const [typeData] = await db
      .select({ typeid: messagetype.typeid })
      .from(messagetype)
      .where(eq(messagetype.type, typeQuery));
    
    if (typeData) {
      conditions.push(eq(message.typeid, typeData.typeid));
    } else {
      conditions.push(sql`false`);
    }
  }
  
  const messagesData = await db
    .select({
      messageid: message.messageid,
      hotelid: message.hotelid,
      typeid: message.typeid,
      senderid: message.senderid,
      subject: message.subject,
      content: message.content,
      createdat: message.createdat,
      typeName: messagetype.type,
      senderEmployeeId: employee.employeeid,
      senderNameTitle: name.title,
      senderNameFirst: name.firstname,
      senderNameLast: name.lastname
    })
    .from(message)
    .leftJoin(messagetype, eq(message.typeid, messagetype.typeid))
    .leftJoin(employee, eq(message.senderid, employee.employeeid))
    .leftJoin(name, eq(employee.nameid, name.nameid))
    .where(and(...conditions))
    .orderBy(desc(message.createdat))
    .limit(limit)
    .offset(offset);
  
  const countResult = await db
    .select({ count: sql<number>`count(${message.messageid})`.mapWith(Number) })
    .from(message)
    .where(and(...conditions));
  
  const totalCount = countResult[0]?.count ?? 0;
  const totalPages = Math.ceil(totalCount / limit);
  
  const formattedMessages = messagesData.map(msg => ({
    messageId: msg.messageid,
    type: msg.typeName || 'Unknown',
    sender: msg.senderEmployeeId ? {
      employeeId: msg.senderEmployeeId,
      name: `${msg.senderNameTitle ? msg.senderNameTitle + ' ' : ''}${msg.senderNameFirst || ''} ${msg.senderNameLast || ''}`.trim() || 'Hotel Staff'
    } : { name: 'System' },
    subject: msg.subject || null,
    content: msg.content,
    createdAt: msg.createdat
  }));
  
  res.json({
    data: formattedMessages,
    meta: {
      page,
      limit,
      totalCount,
      totalPages
    }
  });
}));

/**
 * @swagger
 * /api/guest/messages/announcements:
 *   get:
 *     summary: Get all hotel announcements
 *     description: Retrieves a list of announcements for a specific hotel
 *     tags:
 *       - Guest Messages
 *     security:
 *       - hotelId: []
 *     parameters:
 *       - in: header
 *         name: X-Hotel-ID
 *         schema:
 *           type: string
 *           format: uuid
 *         required: true
 *         description: The unique identifier of the hotel
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [normal, important, emergency]
 *         description: Filter announcements by type
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Page number for pagination
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 10
 *         description: Number of items per page
 *     responses:
 *       200:
 *         description: A list of announcements
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       announcementId:
 *                         type: string
 *                         format: uuid
 *                       title:
 *                         type: string
 *                       content:
 *                         type: string
 *                       type:
 *                         type: string
 *                         enum: [normal, important, emergency]
 *                       creator:
 *                         type: object
 *                         properties:
 *                           employeeId:
 *                             type: string
 *                             format: uuid
 *                           name:
 *                             type: string
 *                       createdAt:
 *                         type: string
 *                         format: date-time
 *                 meta:
 *                   type: object
 *                   properties:
 *                     page:
 *                       type: integer
 *                     limit:
 *                       type: integer
 *                     totalCount:
 *                       type: integer
 *                     totalPages:
 *                       type: integer
 *       400:
 *         description: Bad request - Missing or invalid parameters
 *       500:
 *         description: Server error
 */
router.get('/announcements', validations.headers.hotelId, asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const hotelId = req.headers['x-hotel-id'] as string;
  const typeQuery = req.query.type as string;
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;

  const offset = (page - 1) * limit;
  const conditions = [
      eq(announcement.hotelid, hotelId),
      or(isNull(announcement.expiresat), sql`${announcement.expiresat} > NOW()`)
  ];

  if (typeQuery) {
    if (!(announcementTypeEnum.enumValues as readonly string[]).includes(typeQuery)) {
      return next(new ValidationError('Invalid announcement type query parameter', [
          {field: 'type', message: `Valid types are: ${announcementTypeEnum.enumValues.join(', ')}`}
      ]));
    }
    conditions.push(eq(announcement.announcementtype, typeQuery as typeof announcementTypeEnum.enumValues[number]));
  }

  const announcementsData = await db
    .select({
      announcementid: announcement.announcementid,
      title: announcement.title,
      content: announcement.content,
      announcementtype: announcement.announcementtype,
      createdat: announcement.createdat,
      expiresat: announcement.expiresat,
    })
    .from(announcement)
    .where(and(...conditions))
    .orderBy(desc(announcement.createdat))
    .limit(limit)
    .offset(offset);

  const countResult = await db
    .select({ count: sql<number>`count(${announcement.announcementid})`.mapWith(Number) })
    .from(announcement)
    .where(and(...conditions));

  const totalCount = countResult[0]?.count ?? 0;
  const totalPages = Math.ceil(totalCount / limit);

  res.json({
    data: announcementsData,
    meta: {
      page,
      limit,
      totalCount,
      totalPages
    }
  });
}));

/**
 * @swagger
 * /api/guest/messages/{messageId}:
 *   get:
 *     summary: Get a specific message by ID
 *     description: Retrieves a specific message by its ID
 *     tags:
 *       - Guest Messages
 *     security:
 *       - guestId: []
 *     parameters:
 *       - in: path
 *         name: messageId
 *         schema:
 *           type: string
 *           format: uuid
 *         required: true
 *         description: The unique identifier of the message
 *       - in: header
 *         name: X-Guest-ID
 *         schema:
 *           type: string
 *           format: uuid
 *         required: true
 *         description: The unique identifier of the guest
 *     responses:
 *       200:
 *         description: Message details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 messageId:
 *                   type: string
 *                   format: uuid
 *                 type:
 *                   type: string
 *                 sender:
 *                   type: object
 *                   properties:
 *                     employeeId:
 *                       type: string
 *                       format: uuid
 *                     name:
 *                       type: string
 *                 subject:
 *                   type: string
 *                 content:
 *                   type: string
 *                 createdAt:
 *                   type: string
 *                   format: date-time
 *       400:
 *         description: Bad request - Missing or invalid parameters
 *       404:
 *         description: Message not found
 *       500:
 *         description: Server error
 */
router.get('/:messageId', validations.headers.guestId, asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const { messageId } = req.params;
  
  if (!messageId.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)) {
    return next(new ValidationError('Invalid message ID format', [{field: 'messageId', message: 'messageId must be a valid UUID'}]));
  }
  
  const guestId = req.headers['x-guest-id'] as string;
  
  const [messageData] = await db
    .select({
      message: {
        messageid: message.messageid,
        hotelid: message.hotelid,
        typeid: message.typeid,
        senderid: message.senderid,
        subject: message.subject,
        content: message.content,
        createdat: message.createdat
      },
      messagetype: {
        type: messagetype.type
      },
      sender: {
        employeeid: employee.employeeid
      },
      senderName: {
        firstname: name.firstname,
        lastname: name.lastname,
        title: name.title
      }
    })
    .from(message)
    .leftJoin(messagetype, eq(message.typeid, messagetype.typeid))
    .leftJoin(employee, eq(message.senderid, employee.employeeid))
    .leftJoin(name, eq(employee.nameid, name.nameid))
    .where(
      and(
        eq(message.messageid, messageId),
        eq(message.receiverid, guestId)
      )
    );
    
  if (!messageData) {
    return next(new NotFoundError('Message'));
  }
    
  const formattedMessage = {
    messageId: messageData.message.messageid,
    type: messageData.messagetype?.type || 'Unknown',
    sender: {
      employeeId: messageData.sender?.employeeid,
      name: messageData.senderName ? 
        `${messageData.senderName.title ? messageData.senderName.title + ' ' : ''}${messageData.senderName.firstname || ''} ${messageData.senderName.lastname || ''}`.trim() : 
        'Hotel Staff'
    },
    subject: messageData.message.subject || null,
    content: messageData.message.content,
    createdAt: messageData.message.createdat
  };
    
  res.json(formattedMessage);
}));

// POST Mark Message as Read
router.post('/:messageId/read', validations.headers.guestId, asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const guestId = req.headers['x-guest-id'] as string;
  const { messageId } = req.params;

  if (!guestId) {
    return next(new ValidationError('Missing guestId parameter', [{field: 'guestId', message: 'guestId is required'}]));
  }
  if (!messageId) {
    return next(new ValidationError('Missing messageId parameter', [{field: 'messageId', message: 'messageId is required'}]));
  }

  const [msgToUpdate] = await db.select({ receiverid: message.receiverid, messageid: message.messageid }).from(message).where(eq(message.messageid, messageId));

  if (!msgToUpdate) {
    return next(new NotFoundError('Message'));
  }
  if (msgToUpdate.receiverid !== guestId) {
    return next(new ValidationError('Message does not belong to this guest', [{field: 'messageId', message: 'Access denied'}]));
  }

  // NOTE: Schema update required for full implementation
  // The message table needs an 'isread' column added to properly track read status.
  // Current schema doesn't include this field, so we can only acknowledge the read action.
  // Only updating the timestamp to indicate some action was taken.
  await db.update(message)
    .set({ 
      updatedat: new Date().toISOString() 
    })
    .where(and(
      eq(message.messageid, messageId), 
      eq(message.receiverid, guestId)
    ));

  const [updatedMessage] = await db
    .select({
      messageid: message.messageid,
      updatedat: message.updatedat
    })
    .from(message)
    .where(eq(message.messageid, messageId));

  res.status(200).json({ 
    messageId: updatedMessage.messageid,
    read: true, // We're pretending it's read, but this isn't stored in DB
    note: "Message marked as read. Note: Full read status tracking requires schema update.",
    updatedAt: updatedMessage.updatedat
  });
}));

export default router; 