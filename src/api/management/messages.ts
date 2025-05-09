import { Router, Request, Response, NextFunction, RequestHandler } from 'express';
import { db } from '../../config/db';
import { 
  message,
  messagetype,
  announcement,
  employee,
  guest,
  name,
  emailaddress,
  phonenumber,
  announcementTypeEnum,
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
import crypto from 'crypto';
import { v4 as uuidv4 } from 'uuid';
import asyncHandler from 'express-async-handler';
import { NotFoundError, ValidationError, DatabaseError } from '../../middleware/errorHandler';

const router = Router();

/**
 * Get all messages sent to guests for a hotel
 * 
 * @route GET /api/management/messages
 * @param {string} hotelId - The hotel ID
 * @param {string} type - (Optional) Filter by message type
 * @param {number} page - (Optional) Page number for pagination
 * @param {number} limit - (Optional) Number of items per page
 */
router.get('/', asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const hotelId = req.query.hotelId as string;
  const typeQuery = req.query.type as string;
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 20;

  if (!hotelId) {
    return next(new ValidationError('Hotel ID is required', [{ field: 'hotelId', message: 'hotelId required'}]));
  }

  const offset = (page - 1) * limit;
  const conditions = [eq(message.hotelid, hotelId)];
  
  if (typeQuery) {
    // Assuming filtering by message type NAME, not ID directly from query
    const [typeData] = await db.select({ typeid: messagetype.typeid }).from(messagetype).where(eq(messagetype.type, typeQuery));
    if (typeData) {
      conditions.push(eq(message.typeid, typeData.typeid));
    } else {
      conditions.push(sql`false`); // Type specified but not found
    }
  }
  
  const combinedWhereClause = and(...conditions);

  const messagesData = await db
    .select({
      messageid: message.messageid,
      hotelid: message.hotelid,
      typeid: message.typeid,
      senderid: message.senderid,
      receiverid: message.receiverid, // guestid
      subject: message.subject,
      content: message.content,
      createdat: message.createdat,
      typeName: messagetype.type,
      senderEmployeeId: employee.employeeid,
      senderFirstName: name.firstname, // Sender (Employee) Name
      senderLastName: name.lastname,
      senderTitle: name.title,
      guestNameId: guest.nameid // Need guest.nameid to join name table later if needed
    })
    .from(message)
    .leftJoin(messagetype, eq(message.typeid, messagetype.typeid))
    .leftJoin(employee, eq(message.senderid, employee.employeeid)) 
    .leftJoin(name, eq(employee.nameid, name.nameid)) // Join for sender name
    // Join guest to get guest.nameid for receiver name lookup
    .leftJoin(guest, eq(message.receiverid, guest.guestid)) 
    .where(combinedWhereClause)
    .orderBy(desc(message.createdat))
    .limit(limit)
    .offset(offset);

  const countResult = await db
    .select({ count: sql<number>`count(${message.messageid})`.mapWith(Number) })
    .from(message)
    .leftJoin(messagetype, eq(message.typeid, messagetype.typeid)) // Needed if type was filtered
    .where(combinedWhereClause);
    
  const totalCount = countResult[0]?.count ?? 0;
  const totalPages = Math.ceil(totalCount / limit);

  // Fetch receiver (guest) primary contacts separately
  const receiverGuestIds = messagesData.map(m => m.receiverid).filter(id => id);
  let guestContacts: Record<string, { name: string, email: string | null; phone: string | null }> = {};
  if (receiverGuestIds.length > 0) {
      const guestsInfo = await db.select({ 
          guestid: guest.guestid, 
          firstName: name.firstname, 
          lastName: name.lastname, 
          title: name.title 
      }).from(guest).leftJoin(name, eq(guest.nameid, name.nameid)).where(inArray(guest.guestid, receiverGuestIds));
      
      const emails = await db.select({ guestid: emailaddress.guestid, address: emailaddress.address })
                          .from(emailaddress).where(and(inArray(emailaddress.guestid, receiverGuestIds), eq(emailaddress.isprimary, true)));
      const phones = await db.select({ guestid: phonenumber.guestid, number: phonenumber.number })
                          .from(phonenumber).where(and(inArray(phonenumber.guestid, receiverGuestIds), eq(phonenumber.isprimary, true)));
      
      guestContacts = receiverGuestIds.reduce((acc, id) => {
          const guestNameInfo = guestsInfo.find(g => g.guestid === id);
          const guestName = `${guestNameInfo?.title || ''} ${guestNameInfo?.firstName || ''} ${guestNameInfo?.lastName || ''}`.trim() || 'Unknown Guest';
          acc[id] = { 
              name: guestName,
              email: emails.find(e => e.guestid === id)?.address || null, 
              phone: phones.find(p => p.guestid === id)?.number || null 
          };
          return acc;
      }, {} as Record<string, { name: string, email: string | null; phone: string | null }>);
  }

  const formattedMessages = messagesData.map(msg => ({
    messageId: msg.messageid,
    hotelId: msg.hotelid,
    type: msg.typeName || 'Unknown',
    sender: msg.senderEmployeeId ? { 
        employeeId: msg.senderEmployeeId,
        name: `${msg.senderTitle || ''} ${msg.senderFirstName || ''} ${msg.senderLastName || ''}`.trim() || 'Unknown Employee'
    } : { name: 'System' },
    receiver: msg.receiverid ? { 
        guestId: msg.receiverid, 
        name: guestContacts[msg.receiverid]?.name || 'Unknown Guest', 
        email: guestContacts[msg.receiverid]?.email, 
        phone: guestContacts[msg.receiverid]?.phone 
    } : null,
    subject: msg.subject,
    content: msg.content,
    createdAt: msg.createdat
  }));

  res.json({ 
    data: formattedMessages,
    meta: { page, limit, totalCount, totalPages }
  });
}));

/**
 * Get all announcements for a hotel
 * 
 * @route GET /api/management/messages/announcements
 * @param {string} hotelId - The hotel ID
 * @param {number} page - (Optional) Page number for pagination
 * @param {number} limit - (Optional) Number of items per page
 */
router.get('/announcements', asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const hotelId = req.query.hotelId as string;
  const announcementTypeQuery = req.query.announcementType as string;
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 20;

  if (!hotelId) {
    return next(new ValidationError('Hotel ID is required', [{ field: 'hotelId', message: 'hotelId required'}]));
  }

  const offset = (page - 1) * limit;
  const conditions = [eq(announcement.hotelid, hotelId)];

  if (announcementTypeQuery) {
    const typeArray = announcementTypeQuery.split(',').map(t => t.trim()).filter(t => t);
    const validTypes = typeArray.filter(t => (announcementTypeEnum.enumValues as readonly string[]).includes(t));
    if (validTypes.length > 0) {
        conditions.push(inArray(announcement.announcementtype, validTypes as (typeof announcementTypeEnum.enumValues[number])[]));
    } else if (typeArray.length > 0) {
        conditions.push(sql`false`); // Type specified but none valid
    }
  }
  
  const combinedWhereClause = and(...conditions);

  const announcementsData = await db
    .select({
      announcementid: announcement.announcementid,
      hotelid: announcement.hotelid,
      createdby: announcement.createdby,
      title: announcement.title,
      content: announcement.content,
      announcementtype: announcement.announcementtype,
      expiresat: announcement.expiresat,
      createdat: announcement.createdat,
      creatorFirstName: name.firstname,
      creatorLastName: name.lastname,
      creatorTitle: name.title
    })
    .from(announcement)
    .leftJoin(employee, eq(announcement.createdby, employee.employeeid))
    .leftJoin(name, eq(employee.nameid, name.nameid))
    .where(combinedWhereClause)
    .orderBy(desc(announcement.createdat))
    .limit(limit)
    .offset(offset);

  const countResult = await db
    .select({ count: sql<number>`count(${announcement.announcementid})`.mapWith(Number) })
    .from(announcement)
    .where(combinedWhereClause);
    
  const totalCount = countResult[0]?.count ?? 0;
  const totalPages = Math.ceil(totalCount / limit);

  const formattedAnnouncements = announcementsData.map(ann => ({
    announcementId: ann.announcementid,
    hotelId: ann.hotelid,
    title: ann.title,
    content: ann.content,
    announcementType: ann.announcementtype,
    expiresAt: ann.expiresat,
    createdBy: ann.createdby ? { 
        employeeId: ann.createdby,
        name: `${ann.creatorTitle || ''} ${ann.creatorFirstName || ''} ${ann.creatorLastName || ''}`.trim() || 'Unknown Employee'
    } : null,
    createdAt: ann.createdat
  }));

  res.json({ 
    data: formattedAnnouncements,
    meta: { page, limit, totalCount, totalPages }
  });
}));

/**
 * Create a new announcement
 * 
 * @route POST /api/management/messages/announcements
 * @param {string} hotelId - The hotel ID
 * @param {string} createdBy - The employee ID of the creator
 * @param {string} title - The announcement title
 * @param {string} content - The announcement content
 * @param {string} announcementType - The announcement type (optional)
 */
router.post('/announcements', asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const { hotelId, createdByEmployeeId, title, content, announcementType, expiresAt } = req.body;

  if (!hotelId || !createdByEmployeeId || !title || !content || !announcementType) {
    return next(new ValidationError('Missing required fields', [
      { field: 'hotelId', message: 'Required' },
      { field: 'createdByEmployeeId', message: 'Required' },
      { field: 'title', message: 'Required' },
      { field: 'content', message: 'Required' },
      { field: 'announcementType', message: 'Required' },
    ]));
  }

  if (!(announcementTypeEnum.enumValues as readonly string[]).includes(announcementType)) {
    return next(new ValidationError('Invalid announcement type', [{field: 'announcementType', message: `Valid types: ${announcementTypeEnum.enumValues.join(', ')}`}]));
  }
  const [creatorExists] = await db.select({id: employee.employeeid}).from(employee).where(eq(employee.employeeid, createdByEmployeeId));
  if (!creatorExists) return next(new NotFoundError('Creator employee'));

  const newAnnouncementId = uuidv4();
  const now = new Date().toISOString();

  const [createdAnnouncement] = await db.insert(announcement).values({
    announcementid: newAnnouncementId,
    hotelid: hotelId,
    createdby: createdByEmployeeId,
    title: title,
    content: content,
    announcementtype: announcementType as typeof announcementTypeEnum.enumValues[number],
    expiresat: expiresAt ? new Date(expiresAt).toISOString() : null,
  }).returning();

  res.status(201).json(createdAnnouncement);
}));

/**
 * Get message types
 * 
 * @route GET /api/management/messages/types
 */
router.get('/types', (async (req: Request, res: Response) => {
  try {
    const types = await db
      .select({
        typeid: messagetype.typeid,
        type: messagetype.type,
        description: messagetype.description
      })
      .from(messagetype)
      .orderBy(messagetype.type);

    res.json({ data: types });
  } catch (error: any) {
    console.error('Error fetching message types:', error);
    res.status(500).json({ message: 'Error fetching message types', error: error.message });
  }
}) as RequestHandler);

/**
 * Get a specific message by ID
 * 
 * @route GET /api/management/messages/:messageId
 * @param {string} messageId - The message ID
 * @param {string} hotelId - The hotel ID for validation
 */
router.get('/:messageId', (async (req: Request, res: Response) => {
  try {
    const { messageId } = req.params;
    const hotelId = req.query.hotelId as string;

    if (!hotelId) {
      return res.status(400).json({ message: 'Hotel ID is required' });
    }

    // Get the message with detailed information
    const [messageData] = await db
      .select({
        message: {
          messageid: message.messageid,
          hotelid: message.hotelid,
          typeid: message.typeid,
          senderid: message.senderid,
          receiverid: message.receiverid,
          subject: message.subject,
          content: message.content,
          createdat: message.createdat,
          updatedat: message.updatedat
        },
        messagetype: {
          type: messagetype.type,
          description: messagetype.description
        },
        guest: {
          guestid: guest.guestid
        },
        sender: {
          employeeid: employee.employeeid,
          nameid: employee.nameid
        },
        senderName: {
          firstname: name.firstname,
          lastname: name.lastname,
          title: name.title
        }
      })
      .from(message)
      .leftJoin(messagetype, eq(message.typeid, messagetype.typeid))
      .leftJoin(guest, eq(message.receiverid, guest.guestid))
      .leftJoin(employee, eq(message.senderid, employee.employeeid))
      .leftJoin(name, eq(employee.nameid, name.nameid))
      .where(
        and(
          eq(message.messageid, messageId),
          eq(message.hotelid, hotelId)
        )
      );

    if (!messageData) {
      return res.status(404).json({ message: 'Message not found' });
    }

    // --- Fetch receiver contact details --- 
    let receiverContact: { name: string, email: string | null; phone: string | null } = { name: 'Unknown Guest', email: null, phone: null };
    const receiverGuestId = messageData.guest?.guestid;
    if (receiverGuestId) {
        const [guestNameInfo] = await db.select({ firstName: name.firstname, lastName: name.lastname, title: name.title }).from(guest).innerJoin(name, eq(guest.nameid, name.nameid)).where(eq(guest.guestid, receiverGuestId));
        const guestNameStr = guestNameInfo ? `${guestNameInfo.title || ''} ${guestNameInfo.firstName || ''} ${guestNameInfo.lastName || ''}`.trim() : 'Unknown Guest';

        const emailResult = await db.select({ address: emailaddress.address })
            .from(emailaddress).where(and(eq(emailaddress.guestid, receiverGuestId), eq(emailaddress.isprimary, true))).limit(1);
        const phoneResult = await db.select({ number: phonenumber.number })
            .from(phonenumber).where(and(eq(phonenumber.guestid, receiverGuestId), eq(phonenumber.isprimary, true))).limit(1);
        
        receiverContact = { 
            name: guestNameStr,
            email: emailResult[0]?.address ?? null, 
            phone: phoneResult[0]?.number ?? null 
        };
    }
    // --- End fetch receiver contact details --- 

    // Format the response
    const response = {
      messageId: messageData.message.messageid,
      hotelId: messageData.message.hotelid,
      type: messageData.messagetype?.type || 'Unknown',
      typeDescription: messageData.messagetype?.description,
      sender: {
        employeeId: messageData.sender?.employeeid,
        name: messageData.senderName ? 
          `${messageData.senderName.title ? messageData.senderName.title + ' ' : ''}${messageData.senderName.firstname || ''} ${messageData.senderName.lastname || ''}`.trim() : 
          'Unknown Employee'
      },
      receiver: {
        guestId: receiverGuestId,
        name: receiverContact.name,
        email: receiverContact.email, 
        phone: receiverContact.phone
      },
      subject: messageData.message.subject,
      content: messageData.message.content,
      createdAt: messageData.message.createdat,
      updatedAt: messageData.message.updatedat
    };

    res.json(response);
  } catch (error: any) {
    console.error('Error fetching message details:', error);
    res.status(500).json({ message: 'Error fetching message details', error: error.message });
  }
}) as RequestHandler);

/**
 * Send a new message to a guest
 * 
 * @route POST /api/management/messages
 * @param {string} hotelId - The hotel ID
 * @param {string} senderId - The employee ID of the sender
 * @param {string} receiverId - The guest ID of the receiver
 * @param {string} typeId - The message type ID
 * @param {string} subject - The message subject
 * @param {string} content - The message content
 */
router.post('/', asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const { hotelId, senderEmployeeId, receiverGuestId, typeId, subject, content } = req.body;

  if (!hotelId || !senderEmployeeId || !receiverGuestId || !typeId || !content) {
    return next(new ValidationError('Missing required fields', [
      { field: 'hotelId', message: 'Required' },
      { field: 'senderEmployeeId', message: 'Required' },
      { field: 'receiverGuestId', message: 'Required' },
      { field: 'typeId', message: 'Required' },
      { field: 'content', message: 'Required' },
    ]));
  }

  // Validate sender, receiver, type exist
  const [senderExists] = await db.select({id: employee.employeeid}).from(employee).where(eq(employee.employeeid, senderEmployeeId));
  const [receiverExists] = await db.select({id: guest.guestid}).from(guest).where(eq(guest.guestid, receiverGuestId));
  const [typeExists] = await db.select({id: messagetype.typeid}).from(messagetype).where(eq(messagetype.typeid, typeId));

  if (!senderExists) return next(new NotFoundError('Sender employee'));
  if (!receiverExists) return next(new NotFoundError('Receiver guest'));
  if (!typeExists) return next(new NotFoundError('Message type'));

  const newMessageId = uuidv4();
  const now = new Date().toISOString();

  const [createdMessage] = await db.insert(message).values({
    messageid: newMessageId,
    hotelid: hotelId,
    senderid: senderEmployeeId,
    receiverid: receiverGuestId,
    typeid: typeId,
    subject: subject,
    content: content,
  }).returning();

  res.status(201).json(createdMessage);
}));

export default router; 