import { Router, Request, Response, NextFunction } from 'express';
import { db } from '../../config/db';
import { 
    hotel, 
    hotelevent, 
    room, 
    restaurant, 
    facility, 
    restaurantmenu, 
    menuitem,
    menuoperatingschedule,
    roomStatusEnum,
    facilityStatusEnum,
    currency,
    scheduleinterval,
    price as priceTable,
    restaurantoperatingschedule,
    roomservicemenu,
    roomserviceitem,
    roomservicemenuschedule
} from '../../models/schema';
import { eq, and, sql, desc, like, or, inArray } from 'drizzle-orm';
import { v4 as uuidv4 } from 'uuid';
import { asyncHandler, NotFoundError, ValidationError, DatabaseError } from '../../middleware/errorHandler';

const router = Router();

// Parameter interfaces
interface HotelIdParam {
  hotelId: string;
}

interface EventParams extends HotelIdParam {
  eventId: string;
}

interface RoomParams extends HotelIdParam {
  roomId: string;
}

interface FacilityParams extends HotelIdParam {
  facilityId: string;
}

interface RestaurantParams extends HotelIdParam {
  restaurantId: string;
}

interface MenuParams extends RestaurantParams {
  menuId: string;
}

interface MenuItemParams extends MenuParams {
  itemId: string;
}

interface ScheduleParams extends MenuParams {
  scheduleId: string;
}

interface RestaurantScheduleParams extends RestaurantParams {
  scheduleId: string;
}

interface RoomServiceMenuParams extends HotelIdParam {
  menuId: string;
}

interface RoomServiceItemParams extends RoomServiceMenuParams {
  itemId: string;
}

interface RoomServiceScheduleParams extends RoomServiceMenuParams {
  scheduleId: string;
}

// Query interfaces
interface PaginationQuery {
  page?: string;
  limit?: string;
}

interface CategoryQuery extends PaginationQuery {
  category?: string;
}

interface DayOfWeekQuery {
  dayOfWeek?: string;
}

// Interface for schedule data from frontend
interface ScheduleData {
  scheduleid?: string;
  restaurantmenuid?: string;
  hotelid?: string;
  dayofweek?: string;
  starttime?: string;
  endtime?: string;
  createdat?: string;
  updatedat?: string;
  [key: string]: any; // Allow for additional properties
}

// Get hotel details
router.get('/:hotelId', asyncHandler(async (req: Request<HotelIdParam>, res: Response, next: NextFunction) => {
  const { hotelId } = req.params;
  
  const [hotelDetails] = await db.select({
    hotelid: hotel.hotelid,
    name: hotel.name,
    phone: hotel.phone,
    email: hotel.email,
    website: hotel.website,
    timezone: hotel.timezone,
    logo: hotel.logo,
    mapfile: hotel.mapfile,
    addressid: hotel.addressid
  })
  .from(hotel)
  .where(eq(hotel.hotelid, hotelId))
  .limit(1);
  
  if (!hotelDetails) {
    return next(new NotFoundError('Hotel'));
  }
  
  res.json({ data: hotelDetails });
}));

// Update hotel details
router.put('/:hotelId', asyncHandler(async (req: Request<HotelIdParam>, res: Response, next: NextFunction) => {
  const { hotelId } = req.params;
  const hotelData = req.body as Partial<typeof hotel.$inferInsert>;
  
  if (hotelData.hotelid && hotelData.hotelid !== hotelId) {
      return next(new ValidationError("Hotel ID in body must match parameter ID if provided.", [{field: "hotelid", message: "ID mismatch"}]));
  }

  const { hotelid, createdat, updatedat, ...updateData } = hotelData;
  
  if (Object.keys(updateData).length === 0) {
    return next(new ValidationError("No update data provided.", []));
  }
  
  // Omit updatedat from the set call to rely on DB default/trigger
  const finalUpdateData: Partial<Omit<typeof hotel.$inferInsert, 'updatedat'>> = { ...updateData };
  
  const [updatedHotel] = await db.update(hotel)
    .set(finalUpdateData)
    .where(eq(hotel.hotelid, hotelId))
    .returning();
  
  if (!updatedHotel) {
    return next(new NotFoundError('Hotel to update')); 
  }
  
  res.json({ data: updatedHotel });
}));

// HOTEL EVENTS

// Get all events for a hotel
router.get('/:hotelId/events', asyncHandler(async (req: Request<HotelIdParam, {}, {}, PaginationQuery>, res: Response, next: NextFunction) => {
  const { hotelId } = req.params;
  const { page: pageQuery, limit: limitQuery } = req.query;

  const page = parseInt(pageQuery || '1');
  const limit = parseInt(limitQuery || '20');
  const offset = (page - 1) * limit;
  
  if (isNaN(page) || page < 1) return next(new ValidationError('Invalid page number', [{field: 'page', message: 'Must be a positive integer'}]));
  if (isNaN(limit) || limit < 1 || limit > 100) return next(new ValidationError('Invalid limit value', [{field: 'limit', message: 'Must be between 1 and 100'}]));

  const events = await db.select({
    eventid: hotelevent.eventid,
    hotelid: hotelevent.hotelid,
    eventname: hotelevent.eventname,
    description: hotelevent.description,
    location: hotelevent.location,
    frequency: hotelevent.frequency,
    link: hotelevent.link,
    imagefile: hotelevent.imagefile,
    createdat: hotelevent.createdat
  })
    .from(hotelevent)
    .where(eq(hotelevent.hotelid, hotelId))
    .orderBy(desc(hotelevent.createdat))
    .limit(limit)
    .offset(offset);
  
  const countResult = await db
    .select({ count: sql<number>`count(${hotelevent.eventid})`.mapWith(Number) })
    .from(hotelevent)
    .where(eq(hotelevent.hotelid, hotelId));
  
  const totalCount = countResult[0]?.count ?? 0;
  const totalPages = Math.ceil(totalCount / limit);
  
  res.json({ 
    data: events,
    pagination: {
      page,
      limit,
      total: totalCount,
      totalPages
    }
  });
}));

// Create new event
router.post('/:hotelId/events', asyncHandler(async (req: Request<EventParams>, res: Response, next: NextFunction) => {
  const { hotelId } = req.params;
  const { name: eventNameInput, description, location, frequency, link, imagefile } = req.body as Partial<Omit<typeof hotelevent.$inferInsert, 'starttime' | 'endtime'>> & {name?: string};

  if (!eventNameInput) { 
      return next(new ValidationError('Missing required event fields (eventname).', [
          {field: 'eventname', message: 'Required'},
      ]));
  }

  const eventData: typeof hotelevent.$inferInsert = {
    eventname: eventNameInput, 
    description: description,
    location: location,
    frequency: frequency,
    link: link,
    imagefile: imagefile,
    eventid: uuidv4(), 
    hotelid: hotelId,
  };
  
  const [createdEvent] = await db.insert(hotelevent).values(eventData).returning();
  
  if (!createdEvent) {
      return next(new DatabaseError('Failed to create event.'));
  }
  res.status(201).json({ data: createdEvent });
}));

// Update event
router.put('/:hotelId/events/:eventId', asyncHandler(async (req: Request<EventParams>, res: Response, next: NextFunction) => {
  const { hotelId, eventId } = req.params;
  // Explicitly only process known fields, ignore starttime/endtime if passed
  const { eventid, hotelid, createdat, updatedat, starttime, endtime, ...updateData } = req.body as Partial<typeof hotelevent.$inferInsert & {starttime?: any, endtime?: any}>;

  if (Object.keys(updateData).length === 0) {
    return next(new ValidationError("No update data provided for event.", []));
  }

  // Omit updatedat from the set call to rely on DB default/trigger
  const finalUpdateData: Partial<Omit<typeof hotelevent.$inferInsert, 'updatedat'>> = { ...updateData };
  
  const [updatedEvent] = await db.update(hotelevent)
    .set(finalUpdateData)
    .where(and(eq(hotelevent.eventid, eventId), eq(hotelevent.hotelid, hotelId)))
    .returning();
  
  if (!updatedEvent) {
    return next(new NotFoundError('Event not found or does not belong to this hotel'));
  }
  
  res.json({ data: updatedEvent });
}));

// Delete event
router.delete('/:hotelId/events/:eventId', asyncHandler(async (req: Request<EventParams>, res: Response, next: NextFunction) => {
  const { hotelId, eventId } = req.params;
  
  const [eventExists] = await db.select({id: hotelevent.eventid}).from(hotelevent)
                            .where(and(eq(hotelevent.eventid, eventId), eq(hotelevent.hotelid, hotelId)));
  
  if (!eventExists) {
      return next(new NotFoundError('Event to delete not found or does not belong to this hotel'));
  }

  await db.delete(hotelevent)
    .where(and(eq(hotelevent.eventid, eventId), eq(hotelevent.hotelid, hotelId)));
  
  res.status(200).json({ message: 'Event deleted successfully' });
}));

// HOTEL ROOMS

// Get all rooms for a hotel
router.get('/:hotelId/rooms', asyncHandler(async (req: Request<HotelIdParam, {}, {}, PaginationQuery>, res: Response, next: NextFunction) => {
  const { hotelId } = req.params;
  const { page: pageQuery, limit: limitQuery } = req.query;
  const page = parseInt(pageQuery || '1');
  const limit = parseInt(limitQuery || '20');
  const offset = (page - 1) * limit;

  if (isNaN(page) || page < 1) return next(new ValidationError('Invalid page number', [{field: 'page', message: 'Must be a positive integer'}]));
  if (isNaN(limit) || limit < 1 || limit > 100) return next(new ValidationError('Invalid limit value', [{field: 'limit', message: 'Must be between 1 and 100'}]));

  const rooms = await db.select({
    roomid: room.roomid,
    hotelid: room.hotelid,
    roomnumber: room.roomnumber,
    type: room.type,
    status: room.status,
    floor: room.floor,
    buildingid: room.buildingid
  })
    .from(room)
    .where(eq(room.hotelid, hotelId))
    .orderBy(desc(room.roomnumber))
    .limit(limit)
    .offset(offset);
  
  const countResult = await db
    .select({ count: sql<number>`count(${room.roomid})`.mapWith(Number) })
    .from(room)
    .where(eq(room.hotelid, hotelId));
  
  const totalCount = countResult[0]?.count ?? 0;
  const totalPages = Math.ceil(totalCount / limit);
  
  res.json({ 
    data: rooms,
    pagination: {
      page,
      limit,
      total: totalCount,
      totalPages
    }
  });
}));

// Create new room
router.post('/:hotelId/rooms', asyncHandler(async (req: Request<HotelIdParam>, res: Response, next: NextFunction) => {
  const { hotelId } = req.params;
  const { 
      roomnumber, 
      type, 
      status, 
      floor, 
      buildingid 
  } = req.body as Partial<typeof room.$inferInsert>; 

  if (!roomnumber) {
      return next(new ValidationError('Missing required field: roomnumber', [{ field: 'roomnumber', message: 'Required' }]));
  }
  if (!buildingid) {
      return next(new ValidationError('Missing required field: buildingid', [{ field: 'buildingid', message: 'Required' }]));
  }

  if (status && !roomStatusEnum.enumValues.includes(status as typeof roomStatusEnum.enumValues[number])) {
      return next(new ValidationError('Invalid room status provided.', [{ field: 'status', message: `Valid statuses are: ${roomStatusEnum.enumValues.join(', ')}` }]));
  }

  const roomData: typeof room.$inferInsert = {
    roomid: uuidv4(),
    hotelid: hotelId,
    roomnumber: roomnumber, 
    type: type,        
    status: status,      
    floor: floor,        
    buildingid: buildingid,
  };
  
  const [createdRoom] = await db.insert(room).values(roomData).returning({ 
      roomid: room.roomid,
      hotelid: room.hotelid,
      roomnumber: room.roomnumber,
      type: room.type,
      status: room.status,
      floor: room.floor,
      buildingid: room.buildingid,
      createdat: room.createdat
  }); 
  
  if (!createdRoom) {
      return next(new DatabaseError('Failed to create room'));
  }
  res.status(201).json({ data: createdRoom });
}));

// Update room
router.put('/:hotelId/rooms/:roomId', asyncHandler(async (req: Request<RoomParams>, res: Response, next: NextFunction) => {
  const { hotelId, roomId } = req.params;
  const { 
      roomnumber, 
      type, 
      status, 
      floor, 
      buildingid 
  } = req.body as Partial<typeof room.$inferInsert>;

  if (status && !roomStatusEnum.enumValues.includes(status as typeof roomStatusEnum.enumValues[number])) {
      return next(new ValidationError('Invalid room status provided.', [{ field: 'status', message: `Valid statuses are: ${roomStatusEnum.enumValues.join(', ')}` }]));
  }
  if (roomnumber !== undefined && roomnumber.trim() === '' && roomnumber !== null) {
       return next(new ValidationError('Room number cannot be empty if provided for update.', [{ field: 'roomnumber', message: 'Cannot be empty' }]));
  }

  const updateData: Partial<Omit<typeof room.$inferInsert, 'roomid' | 'hotelid' | 'createdat'>> = {};
  if (roomnumber !== undefined) updateData.roomnumber = roomnumber;
  if (type !== undefined) updateData.type = type;
  if (status !== undefined) updateData.status = status;
  if (floor !== undefined) updateData.floor = floor;
  if (buildingid !== undefined) updateData.buildingid = buildingid;

  if (Object.keys(updateData).length === 0) {
      return next(new ValidationError('No valid fields provided for update.', []));
  }

  const [updatedRoom] = await db.update(room)
    .set(updateData)
    .where(and(eq(room.roomid, roomId), eq(room.hotelid, hotelId))) 
    .returning({ 
      roomid: room.roomid,
      hotelid: room.hotelid,
      roomnumber: room.roomnumber,
      type: room.type,
      status: room.status,
      floor: room.floor,
      buildingid: room.buildingid,
      updatedat: room.updatedat
  }); 
  
  if (!updatedRoom) {
    return next(new NotFoundError('Room not found or update failed'));
  }
  
  res.json({ data: updatedRoom });
}));

// Delete room
router.delete('/:hotelId/rooms/:roomId', asyncHandler(async (req: Request<RoomParams>, res: Response, next: NextFunction) => {
  const { hotelId, roomId } = req.params;
  
  const [roomExists] = await db.select({id: room.roomid}).from(room)
                            .where(and(eq(room.roomid, roomId), eq(room.hotelid, hotelId)));
  
  if (!roomExists) {
      return next(new NotFoundError('Room to delete not found or does not belong to this hotel'));
  }

  await db.delete(room)
    .where(and(eq(room.roomid, roomId), eq(room.hotelid, hotelId)));
  
  res.status(200).json({ message: 'Room deleted successfully' });
}));

// HOTEL RESTAURANTS

// Get all restaurants for a hotel
router.get('/:hotelId/restaurants', asyncHandler(async (req: Request<HotelIdParam>, res: Response, next: NextFunction) => {
  const { hotelId } = req.params;
  const restaurants = await db.select({
    restaurantid: restaurant.restaurantid,
    hotelid: restaurant.hotelid,
    name: restaurant.name,
    description: restaurant.description,
    phone: restaurant.phone,
    email: restaurant.email,
    capacity: restaurant.capacity,
    link: restaurant.link,
    menucount: restaurant.menucount,
    headerphoto: restaurant.headerphoto,
    addressid: restaurant.addressid
  })
    .from(restaurant)
    .where(eq(restaurant.hotelid, hotelId));
      
  res.json({ data: restaurants });
}));

// Create new restaurant
router.post('/:hotelId/restaurants', asyncHandler(async (req: Request<HotelIdParam>, res: Response, next: NextFunction) => {
  const { hotelId } = req.params;
  const { 
      name,
      description,
      addressid,
      phone,
      email,
      capacity,
      link,
      headerphoto,
  } = req.body as Partial<typeof restaurant.$inferInsert>; 

  if (!name) {
      return next(new ValidationError('Missing required field: name', [{ field: 'name', message: 'Required' }]));
  }
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (email && !emailRegex.test(email)) {
      return next(new ValidationError('Invalid email format provided.', [{ field: 'email', message: 'Invalid format' }]));
  }
  let validatedCapacity: number | undefined = undefined;
  if (capacity !== undefined) {
      validatedCapacity = parseInt(String(capacity), 10);
      if (isNaN(validatedCapacity) || validatedCapacity < 0) {
          return next(new ValidationError('Capacity must be a non-negative integer if provided.', [{ field: 'capacity', message: 'Invalid number' }]));
      }
  }

  const restaurantData: typeof restaurant.$inferInsert = {
    restaurantid: uuidv4(),
    hotelid: hotelId,
    name: name,
    description: description,
    addressid: addressid,
    phone: phone,
    email: email,
    capacity: validatedCapacity,
    link: link,
    headerphoto: headerphoto,
  };
  
  const [createdRestaurant] = await db.insert(restaurant).values(restaurantData).returning({ 
      restaurantid: restaurant.restaurantid,
      hotelid: restaurant.hotelid,
      name: restaurant.name,
      description: restaurant.description,
      addressid: restaurant.addressid,
      phone: restaurant.phone,
      email: restaurant.email,
      capacity: restaurant.capacity,
      link: restaurant.link,
      menucount: restaurant.menucount,
      headerphoto: restaurant.headerphoto,
      createdat: restaurant.createdat
  });
  
  if (!createdRestaurant) {
      return next(new DatabaseError('Failed to create restaurant'));
  }
  res.status(201).json({ data: createdRestaurant });
}));

// Update restaurant
router.put('/:hotelId/restaurants/:restaurantId', asyncHandler(async (req: Request<RestaurantParams>, res: Response, next: NextFunction) => {
  const { hotelId, restaurantId } = req.params;
  const { 
      name,
      description,
      addressid,
      phone,
      email,
      capacity,
      link,
      headerphoto
  } = req.body as Partial<typeof restaurant.$inferInsert>;

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (email && !emailRegex.test(email)) {
      return next(new ValidationError('Invalid email format provided for update.', [{ field: 'email', message: 'Invalid format' }]));
  }
  let validatedCapacity: number | undefined = undefined;
  if (capacity !== undefined) {
      validatedCapacity = parseInt(String(capacity), 10);
      if (isNaN(validatedCapacity) || validatedCapacity < 0) {
          return next(new ValidationError('Capacity must be a non-negative integer if provided for update.', [{ field: 'capacity', message: 'Invalid number' }]));
      }
  }
  if (name !== undefined && name.trim() === '' && name !== null) {
       return next(new ValidationError('Restaurant name cannot be empty if provided for update.', [{ field: 'name', message: 'Cannot be empty' }]));
  }

  const updateData: Partial<Omit<typeof restaurant.$inferInsert, 'restaurantid' | 'hotelid' | 'createdat' | 'menucount'>> = {};
  if (name !== undefined) updateData.name = name;
  if (description !== undefined) updateData.description = description;
  if (addressid !== undefined) updateData.addressid = addressid;
  if (phone !== undefined) updateData.phone = phone;
  if (email !== undefined) updateData.email = email;
  if (validatedCapacity !== undefined) updateData.capacity = validatedCapacity;
  if (link !== undefined) updateData.link = link;
  if (headerphoto !== undefined) updateData.headerphoto = headerphoto;

  if (Object.keys(updateData).length === 0) {
      return next(new ValidationError('No valid fields provided for update.', []));
  }

  updateData.updatedat = new Date().toISOString();

  const [updatedRestaurant] = await db.update(restaurant)
    .set(updateData)
    .where(and(eq(restaurant.restaurantid, restaurantId), eq(restaurant.hotelid, hotelId)))
    .returning({ 
      restaurantid: restaurant.restaurantid,
      hotelid: restaurant.hotelid,
      name: restaurant.name,
      description: restaurant.description,
      addressid: restaurant.addressid,
      phone: restaurant.phone,
      email: restaurant.email,
      capacity: restaurant.capacity,
      link: restaurant.link,
      menucount: restaurant.menucount,
      headerphoto: restaurant.headerphoto,
      updatedat: restaurant.updatedat
    });
  
  if (!updatedRestaurant) {
    return next(new NotFoundError('Restaurant not found or update failed'));
  }
  res.json({ data: updatedRestaurant });
}));

// Delete restaurant
router.delete('/:hotelId/restaurants/:restaurantId', asyncHandler(async (req: Request<RestaurantParams>, res: Response, next: NextFunction) => {
  const { hotelId, restaurantId } = req.params;
  
  const [restaurantExists] = await db.select({id: restaurant.restaurantid}).from(restaurant)
                                    .where(and(eq(restaurant.restaurantid, restaurantId), eq(restaurant.hotelid, hotelId)));

  if (!restaurantExists) {
      return next(new NotFoundError('Restaurant to delete not found or does not belong to this hotel'));
  }

  await db.delete(restaurant)
    .where(and(eq(restaurant.restaurantid, restaurantId), eq(restaurant.hotelid, hotelId)));
  
  res.status(200).json({ message: 'Restaurant deleted successfully' });
}));

// RESTAURANT MENUS

// Get all menus for a restaurant
router.get('/:hotelId/restaurants/:restaurantId/menus', asyncHandler(async (req: Request<RestaurantParams>, res: Response, next: NextFunction) => {
  const { hotelId, restaurantId } = req.params;
  const menus = await db.select({
    restaurantmenuid: restaurantmenu.restaurantmenuid,
    restaurantid: restaurantmenu.restaurantid,
    menuname: restaurantmenu.menuname,
    description: restaurantmenu.description,
    isactive: restaurantmenu.isactive
  })
    .from(restaurantmenu)
    .where(eq(restaurantmenu.restaurantid, restaurantId));

  res.json({ data: menus });
}));

// Create new menu for a restaurant
router.post('/:hotelId/restaurants/:restaurantId/menus', asyncHandler(async (req: Request<RestaurantParams>, res: Response, next: NextFunction) => {
  const { hotelId, restaurantId } = req.params;
  const { 
      menuname, 
      description,
      isactive,
  } = req.body as Partial<typeof restaurantmenu.$inferInsert>; 

  if (!menuname) { 
      return next(new ValidationError('Missing required field: menuname', [{ field: 'menuname', message: 'Required' }]));
  }
  if (isactive !== undefined && typeof isactive !== 'boolean') {
      return next(new ValidationError('Invalid value for isactive, must be boolean.', [{ field: 'isactive', message: 'Must be boolean' }]));
  }

  const menuData: typeof restaurantmenu.$inferInsert = {
    restaurantmenuid: uuidv4(),
    restaurantid: restaurantId, 
    menuname: menuname,
    description: description,
    isactive: isactive,
  };
  
  const [createdMenu] = await db.insert(restaurantmenu).values(menuData).returning({ 
      restaurantmenuid: restaurantmenu.restaurantmenuid,
      restaurantid: restaurantmenu.restaurantid,
      menuname: restaurantmenu.menuname,
      description: restaurantmenu.description,
      isactive: restaurantmenu.isactive,
      createdat: restaurantmenu.createdat
  });
  
  if (!createdMenu) {
      return next(new DatabaseError('Failed to create restaurant menu'));
  }
  res.status(201).json({ data: createdMenu });
}));

// Update restaurant menu
router.put('/:hotelId/restaurants/:restaurantId/menus/:menuId', asyncHandler(async (req: Request<MenuParams>, res: Response, next: NextFunction) => {
  const { hotelId, restaurantId, menuId } = req.params;
  const { 
      menuname,
      description,
      isactive,
  } = req.body as Partial<typeof restaurantmenu.$inferInsert>;

  if (menuname !== undefined && menuname !== null && menuname.trim() === '') {
       return next(new ValidationError('Menu name (menuname) cannot be empty if provided for update.', [{ field: 'menuname', message: 'Cannot be empty' }]));
  }
  if (isactive !== undefined && typeof isactive !== 'boolean') {
      return next(new ValidationError('Invalid value for isactive, must be boolean if provided.', [{ field: 'isactive', message: 'Must be boolean' }]));
  }

  const updateData: Partial<Omit<typeof restaurantmenu.$inferInsert, 'restaurantmenuid' | 'restaurantid' | 'createdat'>> = {};
  if (menuname !== undefined) updateData.menuname = menuname;
  if (description !== undefined) updateData.description = description;
  if (isactive !== undefined) updateData.isactive = isactive;

  if (Object.keys(updateData).length === 0) {
      return next(new ValidationError('No valid fields provided for update.', []));
  }

  updateData.updatedat = new Date().toISOString();

  const [updatedMenu] = await db.update(restaurantmenu)
    .set(updateData)
    .where(and(eq(restaurantmenu.restaurantmenuid, menuId), eq(restaurantmenu.restaurantid, restaurantId))) 
    .returning();
  
  if (!updatedMenu) {
    return next(new NotFoundError('Restaurant menu not found or update failed'));
  }
  res.json({ data: updatedMenu });
}));

// Delete restaurant menu
router.delete('/:hotelId/restaurants/:restaurantId/menus/:menuId', asyncHandler(async (req: Request<MenuParams>, res: Response, next: NextFunction) => {
  const { hotelId, restaurantId, menuId } = req.params;
  
  const [menuExists] = await db.select({id: restaurantmenu.restaurantmenuid}).from(restaurantmenu)
                                .where(and(eq(restaurantmenu.restaurantmenuid, menuId), eq(restaurantmenu.restaurantid, restaurantId)));

  if (!menuExists) {
      return next(new NotFoundError('Menu to delete not found or does not belong to this restaurant'));
  }

  await db.delete(restaurantmenu)
    .where(and(eq(restaurantmenu.restaurantmenuid, menuId), eq(restaurantmenu.restaurantid, restaurantId)));
  
  res.status(200).json({ message: 'Restaurant menu deleted successfully' });
}));

// MENU ITEMS

// Get all menu items for a menu
router.get('/:hotelId/restaurants/:restaurantId/menus/:menuId/items', asyncHandler(async (req: Request<MenuParams, {}, {}, CategoryQuery>, res: Response, next: NextFunction) => {
  const { hotelId, restaurantId, menuId } = req.params;
  const { category } = req.query;
  
  const conditions = [eq(menuitem.restaurantmenuid, menuId)];
  if (category) {
    conditions.push(eq(menuitem.category, category));
  }

  const items = await db.select({
    menuitemid: menuitem.menuitemid,
    restaurantmenuid: menuitem.restaurantmenuid,
    hotelid: menuitem.hotelid,
    itemname: menuitem.itemname,
    description: menuitem.description,
    category: menuitem.category,
    photo: menuitem.photo,
    ingredients: menuitem.ingredients,
    spicelevel: menuitem.spicelevel,
    isspecial: menuitem.isspecial,
    specialstartdate: menuitem.specialstartdate,
    specialenddate: menuitem.specialenddate,
    mastersection: menuitem.mastersection,
    createdat: menuitem.createdat,
    updatedat: menuitem.updatedat,
    priceId: menuitem.price,
    priceAmount: priceTable.amount,
    priceCurrencyCode: currency.code,
    priceType: priceTable.pricetype,
    priceDescription: priceTable.description
  })
    .from(menuitem)
    .leftJoin(priceTable, eq(menuitem.price, priceTable.priceid))
    .leftJoin(currency, eq(priceTable.currencyid, currency.currencyid))
    .where(and(...conditions));
      
  const formattedItems = items.map(item => ({
      menuitemid: item.menuitemid,
      restaurantmenuid: item.restaurantmenuid,
      hotelid: item.hotelid,
      itemname: item.itemname,
      description: item.description,
      category: item.category,
      photo: item.photo,
      ingredients: item.ingredients,
      spicelevel: item.spicelevel,
      isspecial: item.isspecial,
      specialstartdate: item.specialstartdate,
      specialenddate: item.specialenddate,
      mastersection: item.mastersection,
      price: item.priceId && item.priceAmount !== null ? {
          priceId: item.priceId,
          amount: item.priceAmount,
          currencyCode: item.priceCurrencyCode,
          type: item.priceType,
          description: item.priceDescription
      } : null,
      createdat: item.createdat,
      updatedat: item.updatedat
  }));

  res.json({ data: formattedItems });
}));

// Create new menu item
router.post('/:hotelId/restaurants/:restaurantId/menus/:menuId/items', asyncHandler(async (req: Request<MenuParams>, res: Response, next: NextFunction) => {
  const { hotelId, restaurantId, menuId } = req.params;
  const { 
      itemname, 
      description,
      priceAmount, 
      currencyCode, 
      priceType,
      priceDescription,
      category,
      photo, 
      ingredients,
      isspecial,
      specialstartdate,
      specialenddate,
      spicelevel,
      mastersection
  } = req.body as Partial<Omit<typeof menuitem.$inferInsert, 'price'>> & { priceAmount?: number | string, currencyCode?: string, priceType?: string, priceDescription?: string }; 

  if (!itemname) { 
      return next(new ValidationError('Missing required field: itemname', [{ field: 'itemname', message: 'Required' }]));
  }
  if (priceAmount === undefined || priceAmount === null) {
      return next(new ValidationError('Missing required field: priceAmount', [{ field: 'priceAmount', message: 'Required' }]));
  }
  if (!currencyCode) {
      return next(new ValidationError('Missing required field: currencyCode', [{ field: 'currencyCode', message: 'Required' }]));
  }
  const numericPrice = parseFloat(String(priceAmount));
  if (isNaN(numericPrice) || numericPrice < 0) {
      return next(new ValidationError('Price amount must be a non-negative number.', [{ field: 'priceAmount', message: 'Invalid number' }]));
  }
  
  const [currencyRec] = await db.select({ id: currency.currencyid }).from(currency).where(eq(currency.code, currencyCode.toUpperCase())).limit(1);
  if (!currencyRec) {
      return next(new ValidationError('Invalid currency code provided.', [{ field: 'currencyCode', message: `Invalid code: ${currencyCode}` }]));
  }
  const currencyId = currencyRec.id;

  if (isspecial !== undefined && typeof isspecial !== 'boolean') {
      return next(new ValidationError('Invalid value for isspecial, must be boolean.', [{ field: 'isspecial', message: 'Must be boolean' }]));
  }
  if ((specialstartdate && !specialenddate) || (!specialstartdate && specialenddate)) {
      return next(new ValidationError('Both specialstartdate and specialenddate must be provided together.', [{ field: 'specialDates', message: 'Pair required' }]));
  }
  if (specialstartdate && specialenddate && new Date(specialstartdate) > new Date(specialenddate)) {
      return next(new ValidationError('specialstartdate must be before or the same as specialenddate.', [{ field: 'specialDates', message: 'Invalid range' }]));
  }

  const newItemId = uuidv4();
  const newPriceId = uuidv4();

  let createdItem: (typeof menuitem.$inferSelect) | null = null;

  await db.transaction(async (tx) => {
      await tx.insert(priceTable).values({
          priceid: newPriceId,
          hotelid: hotelId,
          amount: numericPrice.toString(),
          currencyid: currencyId,
          pricetype: priceType,
          description: priceDescription,
      });

      const itemData: typeof menuitem.$inferInsert = {
        menuitemid: newItemId,
        restaurantmenuid: menuId,
        hotelid: hotelId, 
        itemname: itemname,
        description: description,
        price: newPriceId,
        category: category,
        photo: photo,
        ingredients: ingredients,
        isspecial: isspecial,
        specialstartdate: specialstartdate ? new Date(specialstartdate).toISOString().split('T')[0] : undefined, 
        specialenddate: specialenddate ? new Date(specialenddate).toISOString().split('T')[0] : undefined, 
        spicelevel: spicelevel,
        mastersection: mastersection,
      };
      const insertResult = await tx.insert(menuitem).values(itemData).returning();
      createdItem = insertResult[0] ?? null;
  });
  
  if (!createdItem || !createdItem.menuitemid) {
      return next(new DatabaseError('Failed to create menu item or retrieve confirmation after transaction.'));
  }

  const [createdItemWithDetails] = await db.select({
        menuitemid: menuitem.menuitemid,
        restaurantmenuid: menuitem.restaurantmenuid,
        hotelid: menuitem.hotelid,
        itemname: menuitem.itemname,
        description: menuitem.description,
        category: menuitem.category,
        photo: menuitem.photo,
        ingredients: menuitem.ingredients,
        spicelevel: menuitem.spicelevel,
        isspecial: menuitem.isspecial,
        specialstartdate: menuitem.specialstartdate,
        specialenddate: menuitem.specialenddate,
        mastersection: menuitem.mastersection,
        createdat: menuitem.createdat,
        updatedat: menuitem.updatedat
    })
    .from(menuitem)
    .leftJoin(priceTable, eq(menuitem.price, priceTable.priceid))
    .leftJoin(currency, eq(priceTable.currencyid, currency.currencyid))
    .where(eq(menuitem.menuitemid, createdItem.menuitemid));

  const formattedItem = createdItemWithDetails ? {
      menuitemid: createdItemWithDetails.menuitemid,
      restaurantmenuid: createdItemWithDetails.restaurantmenuid,
      hotelid: createdItemWithDetails.hotelid,
      itemname: createdItemWithDetails.itemname,
      description: createdItemWithDetails.description,
      category: createdItemWithDetails.category,
      photo: createdItemWithDetails.photo,
      ingredients: createdItemWithDetails.ingredients,
      spicelevel: createdItemWithDetails.spicelevel,
      isspecial: createdItemWithDetails.isspecial,
      specialstartdate: createdItemWithDetails.specialstartdate,
      specialenddate: createdItemWithDetails.specialenddate,
      mastersection: createdItemWithDetails.mastersection,
      price: createdItemWithDetails.priceId && createdItemWithDetails.priceAmount !== null ? {
          priceId: createdItemWithDetails.priceId,
          amount: createdItemWithDetails.priceAmount,
          currencyCode: createdItemWithDetails.priceCurrencyCode,
          type: createdItemWithDetails.priceType,
          description: createdItemWithDetails.priceDescription
      } : null,
      createdat: createdItemWithDetails.createdat,
      updatedat: createdItemWithDetails.updatedat
  } : null;

  res.status(201).json({ data: formattedItem }); 
}));

// Update menu item
router.put('/:hotelId/restaurants/:restaurantId/menus/:menuId/items/:itemId', asyncHandler(async (req: Request<MenuItemParams>, res: Response, next: NextFunction) => {
  const { hotelId, restaurantId, menuId, itemId } = req.params;
  const { 
      itemname,
      description,
      priceAmount,
      currencyCode,
      priceType,
      priceDescription,
      category,
      photo,
      ingredients,
      isspecial,
      specialstartdate,
      specialenddate,
      spicelevel,
      mastersection
  } = req.body as Partial<Omit<typeof menuitem.$inferInsert, 'price'>> & { priceAmount?: number | string, currencyCode?: string, priceType?: string, priceDescription?: string };

  let numericPrice: number | undefined = undefined;
  if (priceAmount !== undefined && priceAmount !== null) {
      numericPrice = parseFloat(String(priceAmount));
      if (isNaN(numericPrice) || numericPrice < 0) {
          return next(new ValidationError('Price amount must be a non-negative number if provided.', [{ field: 'priceAmount', message: 'Invalid number' }]));
      }
  }
  
  let currencyId: string | undefined = undefined;
  if (currencyCode) {
      const [currencyRec] = await db.select({ id: currency.currencyid }).from(currency).where(eq(currency.code, currencyCode.toUpperCase())).limit(1);
      if (!currencyRec) {
          return next(new ValidationError('Invalid currency code provided for update.', [{ field: 'currencyCode', message: `Invalid code: ${currencyCode}` }]));
      }
      currencyId = currencyRec.id;
  }

  if (itemname !== undefined && itemname !== null && itemname.trim() === '') {
       return next(new ValidationError('Item name (itemname) cannot be empty if provided for update.', [{ field: 'itemname', message: 'Cannot be empty' }]));
  }
  if (isspecial !== undefined && typeof isspecial !== 'boolean') {
      return next(new ValidationError('Invalid value for isspecial, must be boolean if provided.', [{ field: 'isspecial', message: 'Must be boolean' }]));
  }
  if ((specialstartdate && !specialenddate) || (!specialstartdate && specialenddate)) {
       return next(new ValidationError('Both specialstartdate and specialenddate must be provided together if updating special dates.', [{ field: 'specialDates', message: 'Pair required' }]));
  }
  if (specialstartdate && specialenddate && new Date(specialstartdate) > new Date(specialenddate)) {
      return next(new ValidationError('specialstartdate must be before or the same as specialenddate.', [{ field: 'specialDates', message: 'Invalid range' }]));
  }

  const [existingItem] = await db.select({ priceId: menuitem.price }).from(menuitem).where(eq(menuitem.menuitemid, itemId));
  if (!existingItem) {
      return next(new NotFoundError('Menu Item to update'));
  }
  const existingPriceId = existingItem.priceId;

  const updateItemData: Partial<Omit<typeof menuitem.$inferInsert, 'menuitemid' | 'restaurantmenuid' | 'hotelid' | 'createdat' | 'price'>> = {};
  if (itemname !== undefined) updateItemData.itemname = itemname;
  if (description !== undefined) updateItemData.description = description;
  if (category !== undefined) updateItemData.category = category;
  if (photo !== undefined) updateItemData.photo = photo;
  if (ingredients !== undefined) updateItemData.ingredients = ingredients;
  if (isspecial !== undefined) updateItemData.isspecial = isspecial;
  if (specialstartdate !== undefined) updateItemData.specialstartdate = specialstartdate ? new Date(specialstartdate).toISOString().split('T')[0] : null;
  if (specialenddate !== undefined) updateItemData.specialenddate = specialenddate ? new Date(specialenddate).toISOString().split('T')[0] : null;
  if (spicelevel !== undefined) updateItemData.spicelevel = spicelevel;
  if (mastersection !== undefined) updateItemData.mastersection = mastersection;

  if (Object.keys(updateItemData).length === 0) {
      return next(new ValidationError('No valid fields provided for update.', []));
  }

  let updatedItem: (typeof menuitem.$inferSelect) | null = null;

  await db.transaction(async (tx) => {
      if (numericPrice !== undefined && existingPriceId) {
          await tx.update(priceTable).set({
              amount: numericPrice.toString(),
              currencyid: currencyId,
              pricetype: priceType,
              description: priceDescription
          }).where(eq(priceTable.priceid, existingPriceId));
      } else if (numericPrice !== undefined && !existingPriceId) {
          throw new DatabaseError('Cannot update price details for an item that does not have an existing price ID.');
      }

      if (Object.keys(updateItemData).length > 0) {
          [updatedItem] = await tx.update(menuitem)
            .set(updateItemData)
            .where(eq(menuitem.menuitemid, itemId))
            .returning();
      } else {
          [updatedItem] = await tx.select().from(menuitem).where(eq(menuitem.menuitemid, itemId));
      }
  });

  if (!updatedItem) {
      return next(new DatabaseError('Menu item update failed or item not found after transaction.'));
  }

  const [finalItemData] = await db.select({
        menuitemid: menuitem.menuitemid,
        restaurantmenuid: menuitem.restaurantmenuid,
        hotelid: menuitem.hotelid,
        itemname: menuitem.itemname,
        description: menuitem.description,
        category: menuitem.category,
        photo: menuitem.photo,
        ingredients: menuitem.ingredients,
        spicelevel: menuitem.spicelevel,
        isspecial: menuitem.isspecial,
        specialstartdate: menuitem.specialstartdate,
        specialenddate: menuitem.specialenddate,
        mastersection: menuitem.mastersection,
        createdat: menuitem.createdat,
        updatedat: menuitem.updatedat
    })
    .from(menuitem)
    .leftJoin(priceTable, eq(menuitem.price, priceTable.priceid))
    .leftJoin(currency, eq(priceTable.currencyid, currency.currencyid))
    .where(eq(menuitem.menuitemid, itemId));

  const formattedItem = finalItemData ? {
      menuitemid: finalItemData.menuitemid,
      restaurantmenuid: finalItemData.restaurantmenuid,
      hotelid: finalItemData.hotelid,
      itemname: finalItemData.itemname,
      description: finalItemData.description,
      category: finalItemData.category,
      photo: finalItemData.photo,
      ingredients: finalItemData.ingredients,
      spicelevel: finalItemData.spicelevel,
      isspecial: finalItemData.isspecial,
      specialstartdate: finalItemData.specialstartdate,
      specialenddate: finalItemData.specialenddate,
      mastersection: finalItemData.mastersection,
      price: finalItemData.priceId && finalItemData.priceAmount !== null ? {
          priceId: finalItemData.priceId,
          amount: finalItemData.priceAmount,
          currencyCode: finalItemData.priceCurrencyCode,
          type: finalItemData.priceType,
          description: finalItemData.priceDescription
      } : null,
      createdat: finalItemData.createdat,
      updatedat: finalItemData.updatedat
  } : null;

  res.json({ data: formattedItem });
}));

// Delete menu item
router.delete('/:hotelId/restaurants/:restaurantId/menus/:menuId/items/:itemId', asyncHandler(async (req: Request<MenuItemParams>, res: Response, next: NextFunction) => {
  const { hotelId, restaurantId, menuId, itemId } = req.params;
  
  const [itemExists] = await db.select({ id: menuitem.menuitemid, priceId: menuitem.price }).from(menuitem)
                                .where(and(eq(menuitem.menuitemid, itemId), eq(menuitem.restaurantmenuid, menuId)));

  if (!itemExists) {
      return next(new NotFoundError('Menu item to delete not found or does not belong to this menu'));
  }

  const priceIdToDelete = itemExists.priceId;

  await db.transaction(async (tx) => {
      await tx.delete(menuitem)
        .where(and(eq(menuitem.menuitemid, itemId), eq(menuitem.restaurantmenuid, menuId)));
      
      if (priceIdToDelete) {
          await tx.delete(priceTable).where(eq(priceTable.priceid, priceIdToDelete));
      }
  });
  
  res.status(200).json({ message: 'Menu item and associated price deleted successfully' });
}));

// RESTAURANT MENU SCHEDULES (using menuoperatingschedule)

// Get all schedules for a menu
router.get('/:hotelId/restaurants/:restaurantId/menus/:menuId/schedules', asyncHandler(async (req: Request<MenuParams, {}, {}, DayOfWeekQuery>, res: Response, next: NextFunction) => {
  const { hotelId, restaurantId, menuId } = req.params;
  const { dayOfWeek } = req.query;
  
  const conditions = [eq(menuoperatingschedule.restaurantmenuid, menuId)]; 
  if (dayOfWeek) {
    const validDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday', 'All', 'Weekdays', 'Weekends'];
    if (!validDays.includes(dayOfWeek)) {
         return next(new ValidationError(`Invalid dayofweek query parameter: ${dayOfWeek}. Must be one of ${validDays.join(', ')}`, [{ field: 'dayOfWeek', message: 'Invalid value' }]));
    }
    conditions.push(eq(menuoperatingschedule.dayofweek, dayOfWeek));
  }

  const schedules = await db.select({ 
    menuoperatingscheduleid: menuoperatingschedule.menuoperatingscheduleid,
    restaurantmenuid: menuoperatingschedule.restaurantmenuid,
    intervalid: menuoperatingschedule.intervalid,
    dayofweek: menuoperatingschedule.dayofweek,
    scheduletype: menuoperatingschedule.scheduletype,
    isactive: menuoperatingschedule.isactive,
    notes: menuoperatingschedule.notes,
    startTime: scheduleinterval.starttime,
    endTime: scheduleinterval.endtime,
    intervalDescription: scheduleinterval.description
  })
    .from(menuoperatingschedule)
    .leftJoin(scheduleinterval, eq(menuoperatingschedule.intervalid, scheduleinterval.intervalid))
    .where(and(...conditions));
      
  res.json({ data: schedules });
}));

// Create new schedule for a menu
router.post('/:hotelId/restaurants/:restaurantId/menus/:menuId/schedules', asyncHandler(async (req: Request<MenuParams>, res: Response, next: NextFunction) => {
  const { hotelId, restaurantId, menuId } = req.params; 
  const { 
      intervalid, 
      dayofweek, 
      scheduletype, 
      isactive, 
      notes 
  } = req.body as Partial<typeof menuoperatingschedule.$inferInsert>; 

  if (!intervalid || !dayofweek) {
      return next(new ValidationError('Missing required fields: intervalid and dayofweek', [
          { field: 'intervalid', message: 'Required' }, 
          { field: 'dayofweek', message: 'Required' }
      ]));
  }
  const [intervalExists] = await db.select({id: scheduleinterval.intervalid}).from(scheduleinterval).where(eq(scheduleinterval.intervalid, intervalid));
  if (!intervalExists) {
      return next(new ValidationError('Invalid intervalid provided', [{ field: 'intervalid', message: `Invalid ID: ${intervalid}` }]));
  }
  const validDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday', 'All', 'Weekdays', 'Weekends'];
  if (!validDays.includes(dayofweek)) {
      return next(new ValidationError(`Invalid dayofweek: ${dayofweek}. Must be one of ${validDays.join(', ')}`, [{ field: 'dayofweek', message: 'Invalid value' }]));
  }
  if (isactive !== undefined && typeof isactive !== 'boolean') {
      return next(new ValidationError('Invalid value for isactive, must be boolean.', [{ field: 'isactive', message: 'Must be boolean' }]));
  }
  
  const pk_id = uuidv4();
  const scheduleData: typeof menuoperatingschedule.$inferInsert = {
    menuoperatingscheduleid: pk_id, 
    restaurantmenuid: menuId, 
    intervalid: intervalid,
    dayofweek: dayofweek,
    scheduletype: scheduletype ?? 'Availability', 
    isactive: isactive,
    notes: notes,
  };
  
  const [createdScheduleRecord] = await db.insert(menuoperatingschedule).values(scheduleData).returning();
  
  res.status(201).json({ data: createdScheduleRecord }); 
}));

// Update menu schedule
router.put('/:hotelId/restaurants/:restaurantId/menus/:menuId/schedules/:scheduleId', asyncHandler(async (req: Request<ScheduleParams>, res: Response, next: NextFunction) => {
  const { hotelId, restaurantId, menuId, scheduleId } = req.params; 
  const { 
      intervalid, 
      dayofweek, 
      scheduletype, 
      isactive, 
      notes 
  } = req.body as Partial<typeof menuoperatingschedule.$inferInsert>;

  if (intervalid) {
      const [intervalExists] = await db.select({id: scheduleinterval.intervalid}).from(scheduleinterval).where(eq(scheduleinterval.intervalid, intervalid));
      if (!intervalExists) {
           return next(new ValidationError('Invalid intervalid provided for update', [{ field: 'intervalid', message: `Invalid ID: ${intervalid}` }]));
      }
  }
  const validDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday', 'All', 'Weekdays', 'Weekends'];
  if (dayofweek && !validDays.includes(dayofweek)) {
      return next(new ValidationError(`Invalid dayofweek: ${dayofweek}. Must be one of ${validDays.join(', ')}`, [{ field: 'dayofweek', message: 'Invalid value' }]));
  }
  if (isactive !== undefined && typeof isactive !== 'boolean') {
      return next(new ValidationError('Invalid value for isactive, must be boolean.', [{ field: 'isactive', message: 'Must be boolean' }]));
  }

  const updateData: Partial<Omit<typeof menuoperatingschedule.$inferInsert, 'menuoperatingscheduleid' | 'restaurantmenuid' | 'createdat'>> = {};
  if (intervalid !== undefined) updateData.intervalid = intervalid;
  if (dayofweek !== undefined) updateData.dayofweek = dayofweek;
  if (scheduletype !== undefined) updateData.scheduletype = scheduletype;
  if (isactive !== undefined) updateData.isactive = isactive;
  if (notes !== undefined) updateData.notes = notes;

  if (Object.keys(updateData).length === 0) {
      return next(new ValidationError('No valid fields provided for update.', []));
  }

  updateData.updatedat = new Date().toISOString(); 

  const [updatedScheduleRecord] = await db.update(menuoperatingschedule) 
    .set(updateData)
    .where(and(eq(menuoperatingschedule.menuoperatingscheduleid, scheduleId), eq(menuoperatingschedule.restaurantmenuid, menuId))) 
    .returning();
  
  if (!updatedScheduleRecord) {
      return next(new NotFoundError('Menu operating schedule not found or update failed.'));
  }
  
  res.json({ data: updatedScheduleRecord });
}));

// Delete menu schedule
router.delete('/:hotelId/restaurants/:restaurantId/menus/:menuId/schedules/:scheduleId', asyncHandler(async (req: Request<ScheduleParams>, res: Response, next: NextFunction) => {
  const { hotelId, restaurantId, menuId, scheduleId } = req.params;

  const [scheduleExists] = await db.select({id: menuoperatingschedule.menuoperatingscheduleid})
                                    .from(menuoperatingschedule)
                                    .where(and(eq(menuoperatingschedule.menuoperatingscheduleid, scheduleId), eq(menuoperatingschedule.restaurantmenuid, menuId)));
                                      
  if (!scheduleExists) {
      return next(new NotFoundError('Menu schedule to delete not found or does not belong to this menu')); 
  }                                  
  
  await db.delete(menuoperatingschedule) 
    .where(and(eq(menuoperatingschedule.menuoperatingscheduleid, scheduleId), eq(menuoperatingschedule.restaurantmenuid, menuId)));
      
  res.status(200).json({ message: 'Menu schedule deleted successfully' });
}));

// RESTAURANT OPERATING SCHEDULES (using restaurantoperatingschedule)

// Get all schedules for a restaurant
router.get('/:hotelId/restaurants/:restaurantId/schedules', asyncHandler(async (req: Request<RestaurantParams, {}, {}, DayOfWeekQuery>, res: Response, next: NextFunction) => {
  const { hotelId, restaurantId } = req.params;
  const { dayOfWeek } = req.query;
  
  const conditions = [eq(restaurantoperatingschedule.restaurantid, restaurantId)]; 
  if (dayOfWeek) {
    const validDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday', 'All', 'Weekdays', 'Weekends'];
    if (!validDays.includes(dayOfWeek)) {
      return next(new ValidationError(`Invalid dayofweek query parameter: ${dayOfWeek}. Must be one of ${validDays.join(', ')}`, [{ field: 'dayOfWeek', message: 'Invalid value' }]));
    }
    conditions.push(eq(restaurantoperatingschedule.dayofweek, dayOfWeek));
  }

  const schedules = await db.select({ 
    restaurantopscheduleid: restaurantoperatingschedule.restaurantopscheduleid,
    restaurantid: restaurantoperatingschedule.restaurantid,
    intervalid: restaurantoperatingschedule.intervalid,
    dayofweek: restaurantoperatingschedule.dayofweek,
    scheduletype: restaurantoperatingschedule.scheduletype,
    isactive: restaurantoperatingschedule.isactive,
    notes: restaurantoperatingschedule.notes,
    startTime: scheduleinterval.starttime,
    endTime: scheduleinterval.endtime,
    intervalDescription: scheduleinterval.description
  })
    .from(restaurantoperatingschedule)
    .leftJoin(scheduleinterval, eq(restaurantoperatingschedule.intervalid, scheduleinterval.intervalid))
    .where(and(...conditions));
      
  res.json({ data: schedules });
}));

// Create new schedule for a restaurant
router.post('/:hotelId/restaurants/:restaurantId/schedules', asyncHandler(async (req: Request<RestaurantParams>, res: Response, next: NextFunction) => {
  const { hotelId, restaurantId } = req.params; 
  const { 
      intervalid, 
      dayofweek, 
      scheduletype, 
      isactive, 
      notes 
  } = req.body as Partial<typeof restaurantoperatingschedule.$inferInsert>; 

  if (!intervalid || !dayofweek) {
      return next(new ValidationError('Missing required fields: intervalid and dayofweek', [
          { field: 'intervalid', message: 'Required' }, 
          { field: 'dayofweek', message: 'Required' }
      ]));
  }
  const [intervalExists] = await db.select({id: scheduleinterval.intervalid}).from(scheduleinterval).where(eq(scheduleinterval.intervalid, intervalid));
  if (!intervalExists) {
      return next(new ValidationError('Invalid intervalid provided', [{ field: 'intervalid', message: `Invalid ID: ${intervalid}` }]));
  }
  const validDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday', 'All', 'Weekdays', 'Weekends'];
  if (!validDays.includes(dayofweek)) {
      return next(new ValidationError(`Invalid dayofweek: ${dayofweek}. Must be one of ${validDays.join(', ')}`, [{ field: 'dayofweek', message: 'Invalid value' }]));
  }
  if (isactive !== undefined && typeof isactive !== 'boolean') {
      return next(new ValidationError('Invalid value for isactive, must be boolean.', [{ field: 'isactive', message: 'Must be boolean' }]));
  }
  
  const pk_id = uuidv4();
  const scheduleData: typeof restaurantoperatingschedule.$inferInsert = {
    restaurantopscheduleid: pk_id, 
    restaurantid: restaurantId, 
    intervalid: intervalid,
    dayofweek: dayofweek,
    scheduletype: scheduletype ?? 'OperatingHours', 
    isactive: isactive,
    notes: notes,
  };
  
  const [createdScheduleRecord] = await db.insert(restaurantoperatingschedule).values(scheduleData).returning();
  res.status(201).json({ data: createdScheduleRecord });
}));

// Update restaurant schedule
router.put('/:hotelId/restaurants/:restaurantId/schedules/:scheduleId', asyncHandler(async (req: Request<RestaurantScheduleParams>, res: Response, next: NextFunction) => {
  const { hotelId, restaurantId, scheduleId } = req.params; 
  const { 
      intervalid, 
      dayofweek, 
      scheduletype, 
      isactive, 
      notes 
  } = req.body as Partial<typeof restaurantoperatingschedule.$inferInsert>;

  if (intervalid) {
      const [intervalExists] = await db.select({id: scheduleinterval.intervalid}).from(scheduleinterval).where(eq(scheduleinterval.intervalid, intervalid));
      if (!intervalExists) {
           return next(new ValidationError('Invalid intervalid provided for update', [{ field: 'intervalid', message: `Invalid ID: ${intervalid}` }]));
      }
  }
  const validDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday', 'All', 'Weekdays', 'Weekends'];
  if (dayofweek && !validDays.includes(dayofweek)) {
      return next(new ValidationError(`Invalid dayofweek: ${dayofweek}. Must be one of ${validDays.join(', ')}`, [{ field: 'dayofweek', message: 'Invalid value' }]));
  }
  if (isactive !== undefined && typeof isactive !== 'boolean') {
      return next(new ValidationError('Invalid value for isactive, must be boolean.', [{ field: 'isactive', message: 'Must be boolean' }]));
  }

  const updateData: Partial<Omit<typeof restaurantoperatingschedule.$inferInsert, 'restaurantopscheduleid' | 'restaurantid' | 'createdat'>> = {};
  if (intervalid !== undefined) updateData.intervalid = intervalid;
  if (dayofweek !== undefined) updateData.dayofweek = dayofweek;
  if (scheduletype !== undefined) updateData.scheduletype = scheduletype;
  if (isactive !== undefined) updateData.isactive = isactive;
  if (notes !== undefined) updateData.notes = notes;

  if (Object.keys(updateData).length === 0) {
      return next(new ValidationError('No valid fields provided for update.', []));
  }

  updateData.updatedat = new Date().toISOString(); 

  const [updatedScheduleRecord] = await db.update(restaurantoperatingschedule) 
    .set(updateData)
    .where(and(eq(restaurantoperatingschedule.restaurantopscheduleid, scheduleId), eq(restaurantoperatingschedule.restaurantid, restaurantId))) 
    .returning();
  
  if (!updatedScheduleRecord) {
      return next(new NotFoundError('Restaurant operating schedule not found or update failed.'));
  }
  
  res.json({ data: updatedScheduleRecord });
}));

// Delete restaurant schedule
router.delete('/:hotelId/restaurants/:restaurantId/schedules/:scheduleId', asyncHandler(async (req: Request<RestaurantScheduleParams>, res: Response, next: NextFunction) => {
  const { hotelId, restaurantId, scheduleId } = req.params;

  const [scheduleExists] = await db.select({id: restaurantoperatingschedule.restaurantopscheduleid})
                                    .from(restaurantoperatingschedule)
                                    .where(and(eq(restaurantoperatingschedule.restaurantopscheduleid, scheduleId), eq(restaurantoperatingschedule.restaurantid, restaurantId)));
                                      
  if (!scheduleExists) {
      return next(new NotFoundError('Restaurant schedule to delete not found or does not belong to this restaurant')); 
  }                                  
  
  await db.delete(restaurantoperatingschedule) 
    .where(and(eq(restaurantoperatingschedule.restaurantopscheduleid, scheduleId), eq(restaurantoperatingschedule.restaurantid, restaurantId)));
      
  res.status(200).json({ message: 'Restaurant schedule deleted successfully' });
}));

// HOTEL FACILITIES

// Get all facilities for a hotel
router.get('/:hotelId/facilities', asyncHandler(async (req: Request<HotelIdParam, {}, {}, PaginationQuery>, res: Response, next: NextFunction) => {
  const { hotelId } = req.params;
  const { page: pageQuery, limit: limitQuery } = req.query;
  const page = parseInt(pageQuery || '1');
  const limit = parseInt(limitQuery || '20');
  const offset = (page - 1) * limit;
  
  const facilities = await db.select({
    facilityid: facility.facilityid,
    hotelid: facility.hotelid,
    name: facility.name,
    type: facility.type,
    description: facility.description,
    location: facility.location,
    capacity: facility.capacity,
    status: facility.status,
    opentime: facility.opentime,
    closetime: facility.closetime,
    link: facility.link,
    photo: facility.photo,
    additionalinfo: facility.additionalinfo
  })
    .from(facility)
    .where(eq(facility.hotelid, hotelId))
    .limit(limit)
    .offset(offset);
  
  const countResult = await db
    .select({ count: sql<number>`count(${facility.facilityid})`.mapWith(Number) })
    .from(facility)
    .where(eq(facility.hotelid, hotelId));
  
  const totalCount = countResult[0]?.count ?? 0;
  const totalPages = Math.ceil(totalCount / limit);
  
  res.json({ 
    data: facilities,
    pagination: {
      page,
      limit,
      total: totalCount,
      totalPages
    }
  });
}));

// Create facility
router.post('/:hotelId/facilities', asyncHandler(async (req: Request<HotelIdParam>, res: Response, next: NextFunction) => {
  const { hotelId } = req.params;
  const { 
      name,
      type,
      description,
      location,
      capacity,
      status,
      opentime,
      closetime,
      link,
      photo,
      additionalinfo
  } = req.body as Partial<typeof facility.$inferInsert>; 

  if (!name) {
      return next(new ValidationError('Missing required field: name', [{ field: 'name', message: 'Required' }]));
  }
  if (status && !facilityStatusEnum.enumValues.includes(status as typeof facilityStatusEnum.enumValues[number])) {
      return next(new ValidationError('Invalid facility status provided.', [{ field: 'status', message: `Valid statuses are: ${facilityStatusEnum.enumValues.join(', ')}` }]));
  }
  if (capacity !== undefined && (isNaN(parseInt(String(capacity), 10)) || parseInt(String(capacity), 10) < 0)) {
       return next(new ValidationError('Capacity must be a non-negative integer.', [{ field: 'capacity', message: 'Invalid number' }]));
  }
  if ((opentime && !closetime) || (!opentime && closetime)) {
      return next(new ValidationError("Both opentime and closetime must be provided together", [{ field: 'times', message: 'Pair required' }]));
  }
  if (opentime && closetime && opentime >= closetime) { 
       return next(new ValidationError('Opening time must be earlier than closing time.', [{ field: 'times', message: 'Invalid range' }]));
  }

  const facilityData: typeof facility.$inferInsert = {
    facilityid: uuidv4(),
    hotelid: hotelId,
    name: name,
    type: type,
    description: description,
    location: location,
    capacity: capacity !== undefined ? parseInt(String(capacity), 10) : undefined,
    status: status,
    opentime: opentime,
    closetime: closetime,
    link: link,
    photo: photo,
    additionalinfo: additionalinfo
  };
  
  const [createdFacility] = await db.insert(facility).values(facilityData).returning({ 
      facilityid: facility.facilityid,
      hotelid: facility.hotelid,
      name: facility.name,
      type: facility.type,
      description: facility.description,
      location: facility.location,
      capacity: facility.capacity,
      status: facility.status,
      opentime: facility.opentime,
      closetime: facility.closetime,
      link: facility.link,
      photo: facility.photo,
      additionalinfo: facility.additionalinfo,
      createdat: facility.createdat
  });
  
  if (!createdFacility) {
      return next(new DatabaseError('Failed to create facility.'));
  }
  res.status(201).json({ data: createdFacility });
}));

// Update facility
router.put('/:hotelId/facilities/:facilityId', asyncHandler(async (req: Request<FacilityParams>, res: Response, next: NextFunction) => {
  const { hotelId, facilityId } = req.params;
  const { 
      name,
      type,
      description,
      location,
      capacity,
      status,
      opentime,
      closetime,
      link,
      photo,
      additionalinfo
  } = req.body as Partial<typeof facility.$inferInsert>;

  let validatedCapacity: number | undefined = undefined;
  if (capacity !== undefined) {
      validatedCapacity = parseInt(String(capacity), 10);
      if (isNaN(validatedCapacity) || validatedCapacity < 0) {
          return next(new ValidationError('Capacity must be a non-negative integer if provided.', [{ field: 'capacity', message: 'Invalid number' }]));
      }
  }
  if (status && !facilityStatusEnum.enumValues.includes(status as typeof facilityStatusEnum.enumValues[number])) {
    return next(new ValidationError("Invalid status value", [{ field: 'status', message: `Valid statuses are: ${facilityStatusEnum.enumValues.join(', ')}` }]));
  }
  if ((opentime && !closetime) || (!opentime && closetime)) {
    return next(new ValidationError("Both opentime and closetime must be provided together if updating times", [{ field: 'times', message: 'Pair required' }]));
  }
   if (opentime && closetime && opentime >= closetime) {
       return next(new ValidationError('Opening time must be earlier than closing time.', [{ field: 'times', message: 'Invalid range' }]));
  }
  if (name !== undefined && name.trim() === '') {
       return next(new ValidationError('Facility name cannot be empty if provided for update.', [{ field: 'name', message: 'Cannot be empty' }]));
  }

  const updateData: Partial<Omit<typeof facility.$inferInsert, 'facilityid' | 'hotelid' | 'createdat'>> = {};
  if (name !== undefined) updateData.name = name;
  if (type !== undefined) updateData.type = type;
  if (description !== undefined) updateData.description = description;
  if (location !== undefined) updateData.location = location;
  if (validatedCapacity !== undefined) updateData.capacity = validatedCapacity;
  if (status !== undefined) updateData.status = status;
  if (opentime !== undefined) updateData.opentime = opentime;
  if (closetime !== undefined) updateData.closetime = closetime;
  if (link !== undefined) updateData.link = link;
  if (photo !== undefined) updateData.photo = photo;
  if (additionalinfo !== undefined) updateData.additionalinfo = additionalinfo;

  if (Object.keys(updateData).length === 0) {
      return next(new ValidationError('No valid fields provided for update.', []));
  }

  updateData.updatedat = new Date().toISOString();

  const [updatedFacility] = await db.update(facility)
    .set(updateData)
    .where(and(eq(facility.facilityid, facilityId), eq(facility.hotelid, hotelId)))
    .returning({ 
      facilityid: facility.facilityid,
      hotelid: facility.hotelid,
      name: facility.name,
      type: facility.type,
      description: facility.description,
      location: facility.location,
      capacity: facility.capacity,
      status: facility.status,
      opentime: facility.opentime,
      closetime: facility.closetime,
      link: facility.link,
      photo: facility.photo,
      additionalinfo: facility.additionalinfo,
      updatedat: facility.updatedat
    });
  
  if (!updatedFacility) {
    return next(new NotFoundError('Facility not found or update failed'));
  }
  res.json({ data: updatedFacility });
}));

// Delete facility
router.delete('/:hotelId/facilities/:facilityId', asyncHandler(async (req: Request<FacilityParams>, res: Response, next: NextFunction) => {
  const { hotelId, facilityId } = req.params;
  
  const [facilityExists] = await db.select({id: facility.facilityid}).from(facility)
                                    .where(and(eq(facility.facilityid, facilityId), eq(facility.hotelid, hotelId)));

  if (!facilityExists) {
      return next(new NotFoundError('Facility to delete not found or does not belong to this hotel'));
  }

  await db.delete(facility)
    .where(and(eq(facility.facilityid, facilityId), eq(facility.hotelid, hotelId)));
  
  res.status(200).json({ message: 'Facility deleted successfully' });
}));

// ROOM SERVICE MENU MANAGEMENT

// Get all room service menus for a hotel
router.get('/:hotelId/room-service-menus', asyncHandler(async (req: Request<HotelParams>, res: Response, next: NextFunction) => {
  const { hotelId } = req.params;
  
  const menus = await db.select()
    .from(roomservicemenu)
    .where(eq(roomservicemenu.hotelid, hotelId));
      
  res.json({ data: menus });
}));

// Create new room service menu
router.post('/:hotelId/room-service-menus', asyncHandler(async (req: Request<HotelParams>, res: Response, next: NextFunction) => {
  const { hotelId } = req.params; 
  const { 
      menuname, 
      description, 
      isactive = true
  } = req.body as Partial<typeof roomservicemenu.$inferInsert>; 

  if (!menuname) {
      return next(new ValidationError('Menu name is required', [
          { field: 'menuname', message: 'Required' }
      ]));
  }
  
  const menuId = uuidv4();
  const menuData: typeof roomservicemenu.$inferInsert = {
    roomservicemenuid: menuId, 
    hotelid: hotelId, 
    menuname,
    description,
    isactive
  };
  
  const [createdMenuRecord] = await db.insert(roomservicemenu).values(menuData).returning();
  res.status(201).json({ data: createdMenuRecord });
}));

// Update room service menu
router.put('/:hotelId/room-service-menus/:menuId', asyncHandler(async (req: Request<RoomServiceMenuParams>, res: Response, next: NextFunction) => {
  const { hotelId, menuId } = req.params; 
  const { 
      menuname, 
      description, 
      isactive 
  } = req.body as Partial<typeof roomservicemenu.$inferInsert>;

  const updateData: Partial<Omit<typeof roomservicemenu.$inferInsert, 'roomservicemenuid' | 'hotelid' | 'createdat'>> = {};
  if (menuname !== undefined) updateData.menuname = menuname;
  if (description !== undefined) updateData.description = description;
  if (isactive !== undefined) updateData.isactive = isactive;

  if (Object.keys(updateData).length === 0) {
      return next(new ValidationError('No valid fields provided for update.', []));
  }

  updateData.updatedat = new Date().toISOString(); 

  const [updatedMenuRecord] = await db.update(roomservicemenu) 
    .set(updateData)
    .where(and(eq(roomservicemenu.roomservicemenuid, menuId), eq(roomservicemenu.hotelid, hotelId))) 
    .returning();
  
  if (!updatedMenuRecord) {
      return next(new NotFoundError('Room service menu not found or update failed.'));
  }
  
  res.json({ data: updatedMenuRecord });
}));

// Delete room service menu
router.delete('/:hotelId/room-service-menus/:menuId', asyncHandler(async (req: Request<RoomServiceMenuParams>, res: Response, next: NextFunction) => {
  const { hotelId, menuId } = req.params;

  const [menuExists] = await db.select({id: roomservicemenu.roomservicemenuid})
                                .from(roomservicemenu)
                                .where(and(eq(roomservicemenu.roomservicemenuid, menuId), eq(roomservicemenu.hotelid, hotelId)));
                                      
  if (!menuExists) {
      return next(new NotFoundError('Room service menu to delete not found or does not belong to this hotel')); 
  }                                  
  
  await db.transaction(async (tx) => {
    // First delete any items associated with this menu
    await tx.delete(roomserviceitem)
      .where(eq(roomserviceitem.roomservicemenuid, menuId));
    
    // Then delete any schedules associated with this menu
    await tx.delete(roomservicemenuschedule)
      .where(eq(roomservicemenuschedule.roomservicemenuid, menuId));
    
    // Finally delete the menu itself
    await tx.delete(roomservicemenu)
      .where(and(eq(roomservicemenu.roomservicemenuid, menuId), eq(roomservicemenu.hotelid, hotelId)));
  });
      
  res.status(200).json({ message: 'Room service menu deleted successfully' });
}));

// ROOM SERVICE ITEMS MANAGEMENT

// Get all items for a room service menu
router.get('/:hotelId/room-service-menus/:menuId/items', asyncHandler(async (req: Request<RoomServiceMenuParams>, res: Response, next: NextFunction) => {
  const { hotelId, menuId } = req.params;
  
  const items = await db
    .select({
      rsItemId: roomserviceitem.rsItemid,
      menuId: roomserviceitem.roomservicemenuid,
      itemName: roomserviceitem.itemname,
      description: roomserviceitem.description,
      category: roomserviceitem.category,
      photo: roomserviceitem.photo,
      isActive: roomserviceitem.isactive,
      priceId: roomserviceitem.priceid,
      priceAmount: priceTable.amount,
      currencyCode: currency.code,
      createdAt: roomserviceitem.createdat,
      updatedAt: roomserviceitem.updatedat
    })
    .from(roomserviceitem)
    .innerJoin(priceTable, eq(roomserviceitem.priceid, priceTable.priceid))
    .innerJoin(currency, eq(priceTable.currencyid, currency.currencyid))
    .where(eq(roomserviceitem.roomservicemenuid, menuId));
      
  res.json({ data: items });
}));

// Create new room service item
router.post('/:hotelId/room-service-menus/:menuId/items', asyncHandler(async (req: Request<RoomServiceMenuParams>, res: Response, next: NextFunction) => {
  const { hotelId, menuId } = req.params; 
  const { 
      itemname, 
      description, 
      category,
      photo,
      priceAmount,
      currencyCode,
      isactive = true
  } = req.body; 

  if (!itemname || !priceAmount || !currencyCode) {
      return next(new ValidationError('Missing required fields', [
          { field: 'itemname', message: 'Item name is required' },
          { field: 'priceAmount', message: 'Price amount is required' },
          { field: 'currencyCode', message: 'Currency code is required' }
      ]));
  }
  
  // Check if menu exists
  const [menuExists] = await db.select({id: roomservicemenu.roomservicemenuid})
                              .from(roomservicemenu)
                              .where(and(eq(roomservicemenu.roomservicemenuid, menuId), eq(roomservicemenu.hotelid, hotelId)));
  
  if (!menuExists) {
    return next(new NotFoundError('Room service menu not found'));
  }
  
  // Get currency ID from code
  const [currencyRecord] = await db.select({currencyid: currency.currencyid})
                                  .from(currency)
                                  .where(eq(currency.code, currencyCode.toUpperCase()));
  
  if (!currencyRecord) {
    return next(new NotFoundError(`Currency with code ${currencyCode} not found`));
  }

  const itemId = uuidv4();
  const priceId = uuidv4();
  
  await db.transaction(async (tx) => {
    // First create the price
    await tx.insert(priceTable).values({
      priceid: priceId,
      hotelid: hotelId,
      amount: priceAmount.toString(),
      currencyid: currencyRecord.currencyid,
      pricetype: 'RoomServiceItem',
      description: `Price for room service item: ${itemname}`
    });
    
    // Then create the room service item
    await tx.insert(roomserviceitem).values({
      rsItemid: itemId,
      roomservicemenuid: menuId,
      itemname,
      description,
      category,
      photo,
      priceid: priceId,
      isactive
    });
  });
  
  // Fetch the created item with price information
  const [createdItem] = await db
    .select({
      rsItemId: roomserviceitem.rsItemid,
      menuId: roomserviceitem.roomservicemenuid,
      itemName: roomserviceitem.itemname,
      description: roomserviceitem.description,
      category: roomserviceitem.category,
      photo: roomserviceitem.photo,
      isActive: roomserviceitem.isactive,
      priceId: roomserviceitem.priceid,
      priceAmount: priceTable.amount,
      currencyCode: currency.code,
      createdAt: roomserviceitem.createdat,
      updatedAt: roomserviceitem.updatedat
    })
    .from(roomserviceitem)
    .innerJoin(priceTable, eq(roomserviceitem.priceid, priceTable.priceid))
    .innerJoin(currency, eq(priceTable.currencyid, currency.currencyid))
    .where(eq(roomserviceitem.rsItemid, itemId));
  
  res.status(201).json({ data: createdItem });
}));

// Update room service item
router.put('/:hotelId/room-service-menus/:menuId/items/:itemId', asyncHandler(async (req: Request<RoomServiceItemParams>, res: Response, next: NextFunction) => {
  const { hotelId, menuId, itemId } = req.params; 
  const { 
      itemname, 
      description, 
      category,
      photo,
      priceAmount,
      currencyCode,
      isactive
  } = req.body;

  // Check if item exists
  const [itemExists] = await db.select({
    rsItemid: roomserviceitem.rsItemid,
    priceid: roomserviceitem.priceid
  })
    .from(roomserviceitem)
    .where(and(
      eq(roomserviceitem.rsItemid, itemId),
      eq(roomserviceitem.roomservicemenuid, menuId)
    ));
  
  if (!itemExists) {
    return next(new NotFoundError('Room service item not found'));
  }

  const itemUpdateData: Partial<typeof roomserviceitem.$inferInsert> = {};
  if (itemname !== undefined) itemUpdateData.itemname = itemname;
  if (description !== undefined) itemUpdateData.description = description;
  if (category !== undefined) itemUpdateData.category = category;
  if (photo !== undefined) itemUpdateData.photo = photo;
  if (isactive !== undefined) itemUpdateData.isactive = isactive;
  
  let currencyId: string | undefined;
  if (currencyCode) {
    const [currencyRecord] = await db.select({currencyid: currency.currencyid})
                                  .from(currency)
                                  .where(eq(currency.code, currencyCode.toUpperCase()));
    
    if (!currencyRecord) {
      return next(new NotFoundError(`Currency with code ${currencyCode} not found`));
    }
    currencyId = currencyRecord.currencyid;
  }
  
  await db.transaction(async (tx) => {
    // Update the item
    if (Object.keys(itemUpdateData).length > 0) {
      itemUpdateData.updatedat = new Date().toISOString();
      await tx.update(roomserviceitem)
        .set(itemUpdateData)
        .where(eq(roomserviceitem.rsItemid, itemId));
    }
    
    // Update the price if price-related fields were provided
    if (priceAmount !== undefined || currencyId !== undefined) {
      const priceUpdateData: Partial<typeof priceTable.$inferInsert> = {
        updatedat: new Date().toISOString()
      };
      
      if (priceAmount !== undefined) priceUpdateData.amount = priceAmount.toString();
      if (currencyId !== undefined) priceUpdateData.currencyid = currencyId;
      
      await tx.update(priceTable)
        .set(priceUpdateData)
        .where(eq(priceTable.priceid, itemExists.priceid));
    }
  });
  
  // Fetch the updated item with price information
  const [updatedItem] = await db
    .select({
      rsItemId: roomserviceitem.rsItemid,
      menuId: roomserviceitem.roomservicemenuid,
      itemName: roomserviceitem.itemname,
      description: roomserviceitem.description,
      category: roomserviceitem.category,
      photo: roomserviceitem.photo,
      isActive: roomserviceitem.isactive,
      priceId: roomserviceitem.priceid,
      priceAmount: priceTable.amount,
      currencyCode: currency.code,
      createdAt: roomserviceitem.createdat,
      updatedAt: roomserviceitem.updatedat
    })
    .from(roomserviceitem)
    .innerJoin(priceTable, eq(roomserviceitem.priceid, priceTable.priceid))
    .innerJoin(currency, eq(priceTable.currencyid, currency.currencyid))
    .where(eq(roomserviceitem.rsItemid, itemId));
  
  res.json({ data: updatedItem });
}));

// Delete room service item
router.delete('/:hotelId/room-service-menus/:menuId/items/:itemId', asyncHandler(async (req: Request<RoomServiceItemParams>, res: Response, next: NextFunction) => {
  const { hotelId, menuId, itemId } = req.params;

  // Check if item exists and get its price ID
  const [itemExists] = await db
    .select({
      rsItemid: roomserviceitem.rsItemid,
      priceid: roomserviceitem.priceid
    })
    .from(roomserviceitem)
    .where(and(
      eq(roomserviceitem.rsItemid, itemId),
      eq(roomserviceitem.roomservicemenuid, menuId)
    ));
  
  if (!itemExists) {
    return next(new NotFoundError('Room service item not found'));
  }
  
  await db.transaction(async (tx) => {
    // Delete the item
    await tx.delete(roomserviceitem)
      .where(and(eq(roomserviceitem.rsItemid, itemId), eq(roomserviceitem.roomservicemenuid, menuId)));
    
    // Delete the associated price
    if (itemExists.priceid) {
      await tx.delete(priceTable)
        .where(eq(priceTable.priceid, itemExists.priceid));
    }
  });
  
  res.status(200).json({ message: 'Room service item deleted successfully' });
}));

// ROOM SERVICE MENU SCHEDULES

// Get all schedules for a room service menu
router.get('/:hotelId/room-service-menus/:menuId/schedules', asyncHandler(async (req: Request<RoomServiceMenuParams, {}, {}, DayOfWeekQuery>, res: Response, next: NextFunction) => {
  const { hotelId, menuId } = req.params;
  const { dayOfWeek } = req.query;
  
  const conditions = [eq(roomservicemenuschedule.roomservicemenuid, menuId)]; 
  if (dayOfWeek) {
    const validDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday', 'All', 'Weekdays', 'Weekends'];
    if (!validDays.includes(dayOfWeek)) {
      return next(new ValidationError(`Invalid dayofweek query parameter: ${dayOfWeek}. Must be one of ${validDays.join(', ')}`, [{ field: 'dayOfWeek', message: 'Invalid value' }]));
    }
    conditions.push(eq(roomservicemenuschedule.dayofweek, dayOfWeek));
  }

  const schedules = await db.select({ 
    rsmenuscheduleId: roomservicemenuschedule.rsmenuscheduleId,
    roomservicemenuid: roomservicemenuschedule.roomservicemenuid,
    intervalid: roomservicemenuschedule.intervalid,
    dayofweek: roomservicemenuschedule.dayofweek,
    scheduletype: roomservicemenuschedule.scheduletype,
    isactive: roomservicemenuschedule.isactive,
    notes: roomservicemenuschedule.notes,
    startTime: scheduleinterval.starttime,
    endTime: scheduleinterval.endtime,
    intervalDescription: scheduleinterval.description
  })
    .from(roomservicemenuschedule)
    .leftJoin(scheduleinterval, eq(roomservicemenuschedule.intervalid, scheduleinterval.intervalid))
    .where(and(...conditions));
      
  res.json({ data: schedules });
}));

// Create new schedule for a room service menu
router.post('/:hotelId/room-service-menus/:menuId/schedules', asyncHandler(async (req: Request<RoomServiceMenuParams>, res: Response, next: NextFunction) => {
  const { hotelId, menuId } = req.params; 
  const { 
      intervalid, 
      dayofweek, 
      scheduletype, 
      isactive, 
      notes 
  } = req.body as Partial<typeof roomservicemenuschedule.$inferInsert>; 

  if (!intervalid || !dayofweek) {
      return next(new ValidationError('Missing required fields: intervalid and dayofweek', [
          { field: 'intervalid', message: 'Required' }, 
          { field: 'dayofweek', message: 'Required' }
      ]));
  }
  
  // Check if menu exists
  const [menuExists] = await db.select({id: roomservicemenu.roomservicemenuid})
                              .from(roomservicemenu)
                              .where(and(eq(roomservicemenu.roomservicemenuid, menuId), eq(roomservicemenu.hotelid, hotelId)));
  
  if (!menuExists) {
    return next(new NotFoundError('Room service menu not found'));
  }
  
  const [intervalExists] = await db.select({id: scheduleinterval.intervalid})
                                  .from(scheduleinterval)
                                  .where(eq(scheduleinterval.intervalid, intervalid));
  
  if (!intervalExists) {
      return next(new ValidationError('Invalid intervalid provided', [{ field: 'intervalid', message: `Invalid ID: ${intervalid}` }]));
  }
  
  const validDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday', 'All', 'Weekdays', 'Weekends'];
  if (!validDays.includes(dayofweek)) {
      return next(new ValidationError(`Invalid dayofweek: ${dayofweek}. Must be one of ${validDays.join(', ')}`, [{ field: 'dayofweek', message: 'Invalid value' }]));
  }
  
  if (isactive !== undefined && typeof isactive !== 'boolean') {
      return next(new ValidationError('Invalid value for isactive, must be boolean.', [{ field: 'isactive', message: 'Must be boolean' }]));
  }
  
  const pk_id = uuidv4();
  const scheduleData: typeof roomservicemenuschedule.$inferInsert = {
    rsmenuscheduleId: pk_id, 
    roomservicemenuid: menuId, 
    intervalid: intervalid,
    dayofweek: dayofweek,
    scheduletype: scheduletype ?? 'Availability', 
    isactive: isactive,
    notes: notes,
  };
  
  const [createdScheduleRecord] = await db.insert(roomservicemenuschedule).values(scheduleData).returning();
  res.status(201).json({ data: createdScheduleRecord });
}));

// Update room service menu schedule
router.put('/:hotelId/room-service-menus/:menuId/schedules/:scheduleId', asyncHandler(async (req: Request<RoomServiceScheduleParams>, res: Response, next: NextFunction) => {
  const { hotelId, menuId, scheduleId } = req.params; 
  const { 
      intervalid, 
      dayofweek, 
      scheduletype, 
      isactive, 
      notes 
  } = req.body as Partial<typeof roomservicemenuschedule.$inferInsert>;

  if (intervalid) {
      const [intervalExists] = await db.select({id: scheduleinterval.intervalid})
                                    .from(scheduleinterval)
                                    .where(eq(scheduleinterval.intervalid, intervalid));
      if (!intervalExists) {
           return next(new ValidationError('Invalid intervalid provided for update', [{ field: 'intervalid', message: `Invalid ID: ${intervalid}` }]));
      }
  }
  
  const validDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday', 'All', 'Weekdays', 'Weekends'];
  if (dayofweek && !validDays.includes(dayofweek)) {
      return next(new ValidationError(`Invalid dayofweek: ${dayofweek}. Must be one of ${validDays.join(', ')}`, [{ field: 'dayofweek', message: 'Invalid value' }]));
  }
  
  if (isactive !== undefined && typeof isactive !== 'boolean') {
      return next(new ValidationError('Invalid value for isactive, must be boolean.', [{ field: 'isactive', message: 'Must be boolean' }]));
  }

  const updateData: Partial<Omit<typeof roomservicemenuschedule.$inferInsert, 'rsmenuscheduleId' | 'roomservicemenuid' | 'createdat'>> = {};
  if (intervalid !== undefined) updateData.intervalid = intervalid;
  if (dayofweek !== undefined) updateData.dayofweek = dayofweek;
  if (scheduletype !== undefined) updateData.scheduletype = scheduletype;
  if (isactive !== undefined) updateData.isactive = isactive;
  if (notes !== undefined) updateData.notes = notes;

  if (Object.keys(updateData).length === 0) {
      return next(new ValidationError('No valid fields provided for update.', []));
  }

  updateData.updatedat = new Date().toISOString(); 

  const [updatedScheduleRecord] = await db.update(roomservicemenuschedule) 
    .set(updateData)
    .where(and(eq(roomservicemenuschedule.rsmenuscheduleId, scheduleId), eq(roomservicemenuschedule.roomservicemenuid, menuId))) 
    .returning();
  
  if (!updatedScheduleRecord) {
      return next(new NotFoundError('Room service menu schedule not found or update failed.'));
  }
  
  res.json({ data: updatedScheduleRecord });
}));

// Delete room service menu schedule
router.delete('/:hotelId/room-service-menus/:menuId/schedules/:scheduleId', asyncHandler(async (req: Request<RoomServiceScheduleParams>, res: Response, next: NextFunction) => {
  const { hotelId, menuId, scheduleId } = req.params;

  const [scheduleExists] = await db.select({id: roomservicemenuschedule.rsmenuscheduleId})
                                  .from(roomservicemenuschedule)
                                  .where(and(eq(roomservicemenuschedule.rsmenuscheduleId, scheduleId), eq(roomservicemenuschedule.roomservicemenuid, menuId)));
                                      
  if (!scheduleExists) {
      return next(new NotFoundError('Room service menu schedule to delete not found or does not belong to this menu')); 
  }                                  
  
  await db.delete(roomservicemenuschedule) 
    .where(and(eq(roomservicemenuschedule.rsmenuscheduleId, scheduleId), eq(roomservicemenuschedule.roomservicemenuid, menuId)));
      
  res.status(200).json({ message: 'Room service menu schedule deleted successfully' });
}));

export default router; 