import { Router, Request, Response, NextFunction } from "express";
import { eq, and, sql, inArray } from "drizzle-orm";
import { hotel, room, hotelevent, restaurant, facility, restaurantmenu, menuitem, specialproducts, housekeepingtype, price as priceTable, currency, roomservicemenu, roomserviceitem, menuoperatingschedule, restaurantoperatingschedule, scheduleinterval, roomservicemenuschedule } from "../../models/schema";
import { db } from "../../config/db";
import { validations } from "../../middleware/validators";
import { ParamsDictionary } from "express-serve-static-core";
import asyncHandler from 'express-async-handler';
import { NotFoundError, ValidationError } from '../../middleware/errorHandler';

const router = Router();

// Define proper interface types for request parameters
interface HotelParams extends ParamsDictionary {
  hotelId: string;
}

interface RestaurantParams extends HotelParams {
  restaurantId: string;
}

interface MenuParams extends RestaurantParams {
  menuId: string;
}

interface FacilityParams extends HotelParams {
  type: string;
}

interface RoomServiceMenuParams extends HotelParams {
  menuId: string;
}

// Get hotel details
router.get("/:hotelId", validations.headers.hotelId, asyncHandler(async (req: Request<HotelParams>, res: Response, next: NextFunction): Promise<void> => {
  const hotelDetails = await db.query.hotel.findFirst({
    where: eq(hotel.hotelid, req.params.hotelId),
  });
  if (!hotelDetails) {
    return next(new NotFoundError('Hotel'));
  }
  res.json(hotelDetails);
}));

// Get hotel events
router.get("/:hotelId/events", validations.headers.hotelId, asyncHandler(async (req: Request<HotelParams>, res: Response, next: NextFunction): Promise<void> => {
  const events = await db.query.hotelevent.findMany({
    where: eq(hotelevent.hotelid, req.params.hotelId),
  });
  res.json(events);
}));

// Get hotel rooms
router.get("/:hotelId/rooms", validations.headers.hotelId, asyncHandler(async (req: Request<HotelParams>, res: Response, next: NextFunction): Promise<void> => {
  const rooms = await db.query.room.findMany({
    where: eq(room.hotelid, req.params.hotelId),
  });
  res.json(rooms);
}));

// Get hotel restaurants (with basic schedule info)
router.get("/:hotelId/restaurants", 
  validations.headers.hotelId, 
  asyncHandler(async (req: Request<HotelParams>, res: Response, next: NextFunction) => {
    const hotelId = req.params.hotelId;

    // Fetch restaurants
    const restaurantsData = await db
      .select()
      .from(restaurant)
      .where(eq(restaurant.hotelid, hotelId));

    // Fetch operating schedule for each restaurant
    const restaurantIds = restaurantsData.map(r => r.restaurantid);
    let schedules: Array<{
      scheduleId: string;
      restaurantId: string;
      dayOfWeek: string;
      scheduleType: string | null;
      isActive: boolean | null;
      startTime: string;
      endTime: string;
      intervalDescription: string | null;
    }> = [];
    
    if (restaurantIds.length > 0) {
       schedules = await db
        .select({
          scheduleId: restaurantoperatingschedule.restaurantopscheduleid,
          restaurantId: restaurantoperatingschedule.restaurantid,
          dayOfWeek: restaurantoperatingschedule.dayofweek,
          scheduleType: restaurantoperatingschedule.scheduletype,
          isActive: restaurantoperatingschedule.isactive,
          startTime: scheduleinterval.starttime,
          endTime: scheduleinterval.endtime,
          intervalDescription: scheduleinterval.description
        })
        .from(restaurantoperatingschedule)
        .innerJoin(scheduleinterval, eq(restaurantoperatingschedule.intervalid, scheduleinterval.intervalid))
        .where(and(
          inArray(restaurantoperatingschedule.restaurantid, restaurantIds),
          eq(restaurantoperatingschedule.isactive, true)
        ));
    }
    
    type ScheduleType = typeof schedules[number];
    const schedulesByRestaurant = schedules.reduce((acc, s) => {
        if(!acc[s.restaurantId]) acc[s.restaurantId] = [];
        acc[s.restaurantId].push(s);
        return acc;
    }, {} as Record<string, ScheduleType[]>);

    const results = restaurantsData.map(r => ({
      ...r,
      operatingSchedule: schedulesByRestaurant[r.restaurantid] || []
    }));
    
    res.json(results);
  })
);

// Get hotel facilities
router.get("/:hotelId/facilities", 
  validations.headers.hotelId, 
  asyncHandler(async (req: Request<HotelParams>, res: Response, next: NextFunction) => {
    const facilitiesDetails = await db.query.facility.findMany({
      where: eq(facility.hotelid, req.params.hotelId),
    });
    res.json(facilitiesDetails);
}));

// Get restaurant menus
router.get("/:hotelId/restaurants/:restaurantId/menus", 
  validations.headers.hotelId, // Assuming middleware checks params
  asyncHandler(async (req: Request<RestaurantParams>, res: Response, next: NextFunction) => {
    const { restaurantId } = req.params;
    if (!restaurantId) {
      return next(new ValidationError('Restaurant ID is required', [{field:'restaurantId', message: 'Restaurant ID missing'}]));
    }
    const menus = await db
      .select()
      .from(restaurantmenu)
      .where(and(
          eq(restaurantmenu.restaurantid, restaurantId),
          eq(restaurantmenu.isactive, true) // Only active menus
      ));
    res.json(menus);
}));

// Get restaurant menu items
router.get("/:hotelId/restaurants/:restaurantId/menus/:menuId/items", 
  validations.headers.hotelId, // Assuming middleware checks params
  asyncHandler(async (req: Request<MenuParams>, res: Response, next: NextFunction) => {
    const { menuId } = req.params;
    if (!menuId) {
      return next(new ValidationError('Menu ID is required', [{field:'menuId', message: 'Menu ID missing'}]));
    }
    const items = await db
      .select({
        menuItemId: menuitem.menuitemid,
        restaurantMenuId: menuitem.restaurantmenuid,
        itemName: menuitem.itemname,
        description: menuitem.description,
        category: menuitem.category,
        photo: menuitem.photo,
        ingredients: menuitem.ingredients,
        spiceLevel: menuitem.spicelevel,
        isSpecial: menuitem.isspecial,
        createdAt: menuitem.createdat,
        updatedAt: menuitem.updatedat,
        priceId: menuitem.price,
        priceAmount: priceTable.amount,
        priceCurrencyId: priceTable.currencyid,
        priceCurrencyCode: currency.code,
        priceType: priceTable.pricetype,
        priceDescription: priceTable.description
      })
      .from(menuitem)
      .leftJoin(priceTable, eq(menuitem.price, priceTable.priceid))
      .leftJoin(currency, eq(priceTable.currencyid, currency.currencyid))
      .where(eq(menuitem.restaurantmenuid, menuId));
      
    const formattedItems = items.map(item => ({
      menuItemId: item.menuItemId,
      restaurantMenuId: item.restaurantMenuId,
      itemName: item.itemName,
      description: item.description,
      category: item.category,
      photo: item.photo,
      ingredients: item.ingredients,
      spiceLevel: item.spiceLevel,
      isSpecial: item.isSpecial,
      price: item.priceId && item.priceAmount !== null ? {
        priceId: item.priceId,
        amount: item.priceAmount,
        currencyCode: item.priceCurrencyCode,
        type: item.priceType,
        description: item.priceDescription
      } : null,
      createdAt: item.createdAt,
      updatedAt: item.updatedAt
    }));

    res.json(formattedItems);
  })
);

// Get room service menus and their items
router.get("/:hotelId/room-service", 
  validations.headers.hotelId, 
  asyncHandler(async (req: Request<HotelParams>, res: Response, next: NextFunction) => {
    const hotelId = req.params.hotelId;

    const menus = await db
      .select()
      .from(roomservicemenu)
      .where(and(
        eq(roomservicemenu.hotelid, hotelId),
        eq(roomservicemenu.isactive, true)
      ));

    if (!menus || menus.length === 0) {
      res.json([]);
      return;
    }

    const menuIds = menus.map(m => m.roomservicemenuid);

    // Fetch items for these menus, including price details
    const items = await db
      .select({
        roomServiceItemId: roomserviceitem.rsItemid,
        menuId: roomserviceitem.roomservicemenuid,
        itemName: roomserviceitem.itemname,
        description: roomserviceitem.description,
        category: roomserviceitem.category,
        imageUrl: roomserviceitem.photo,
        priceId: roomserviceitem.priceid,
        priceAmount: priceTable.amount,
        priceCurrencyCode: currency.code,
        createdAt: roomserviceitem.createdat,
        updatedAt: roomserviceitem.updatedat
      })
      .from(roomserviceitem)
      .innerJoin(priceTable, eq(roomserviceitem.priceid, priceTable.priceid))
      .innerJoin(currency, eq(priceTable.currencyid, currency.currencyid))
      .where(inArray(roomserviceitem.roomservicemenuid, menuIds));

    // Group items by menuId
    const itemsByMenuId = items.reduce((acc, item) => {
      const menuId = item.menuId;
      if (!acc[menuId]) {
        acc[menuId] = [];
      }
      acc[menuId].push(item);
      return acc;
    }, {} as Record<string, typeof items>);

    // Combine menus with their items
    const result = menus.map(menu => ({
      roomServiceMenuId: menu.roomservicemenuid,
      hotelId: menu.hotelid,
      menuName: menu.menuname,
      description: menu.description,
      isActive: menu.isactive,
      createdAt: menu.createdat,
      updatedAt: menu.updatedat,
      items: itemsByMenuId[menu.roomservicemenuid] || []
    }));

    res.json(result);
  })
);

// Get schedule for a specific room service menu
router.get("/:hotelId/room-service/:menuId/schedule", 
  validations.headers.hotelId, 
  asyncHandler(async (req: Request<RoomServiceMenuParams>, res: Response, next: NextFunction) => {
    const { hotelId, menuId } = req.params;

    if (!menuId) {
      return next(new ValidationError('Room Service Menu ID is required', [{ field: 'menuId', message: 'Menu ID required'}]));
    }

    // Fetch schedules joining with intervals for times
    const schedules = await db
      .select({
        scheduleId: roomservicemenuschedule.rsMenuscheduleid,
        menuId: roomservicemenuschedule.roomservicemenuid,
        intervalId: roomservicemenuschedule.intervalid,
        dayOfWeek: roomservicemenuschedule.dayofweek,
        isActive: roomservicemenuschedule.isactive,
        startTime: scheduleinterval.starttime,
        endTime: scheduleinterval.endtime,
        intervalDescription: scheduleinterval.description
      })
      .from(roomservicemenuschedule)
      .innerJoin(scheduleinterval, eq(roomservicemenuschedule.intervalid, scheduleinterval.intervalid))
      .where(and(
        eq(roomservicemenuschedule.roomservicemenuid, menuId),
        eq(roomservicemenuschedule.isactive, true) 
      ));

    if (schedules.length === 0) {
      const menuExists = await db.select({id: roomservicemenu.roomservicemenuid})
                               .from(roomservicemenu)
                               .where(eq(roomservicemenu.roomservicemenuid, menuId))
                               .limit(1);
      if(menuExists.length === 0){
        return next(new NotFoundError('Room Service Menu'));
      }
    }

    res.json(schedules);
  })
);

// Get menu schedule for a specific restaurant menu
router.get("/:hotelId/restaurants/:restaurantId/menus/:menuId/schedule", 
  validations.headers.hotelId, 
  asyncHandler(async (req: Request<MenuParams>, res: Response, next: NextFunction) => {
    const { menuId } = req.params;

    if (!menuId) {
      return next(new ValidationError('Menu ID is required', [{ field: 'menuId', message: 'Menu ID required'}]));
    }

    // Fetch schedules joining with intervals for times
    const schedules = await db
      .select({
        menuOperatingScheduleId: menuoperatingschedule.menuoperatingscheduleid,
        menuId: menuoperatingschedule.restaurantmenuid,
        intervalId: menuoperatingschedule.intervalid,
        dayOfWeek: menuoperatingschedule.dayofweek,
        scheduleType: menuoperatingschedule.scheduletype,
        isActive: menuoperatingschedule.isactive,
        notes: menuoperatingschedule.notes,
        startTime: scheduleinterval.starttime,
        endTime: scheduleinterval.endtime,
        intervalDescription: scheduleinterval.description
      })
      .from(menuoperatingschedule)
      .innerJoin(scheduleinterval, eq(menuoperatingschedule.intervalid, scheduleinterval.intervalid))
      .where(and(
        eq(menuoperatingschedule.restaurantmenuid, menuId),
        eq(menuoperatingschedule.isactive, true) 
      ));

    if (schedules.length === 0) {
       const menuExists = await db.select({id: restaurantmenu.restaurantmenuid}).from(restaurantmenu).where(eq(restaurantmenu.restaurantmenuid, menuId)).limit(1);
       if(menuExists.length === 0){
          return next(new NotFoundError('Restaurant Menu'));
       }
    }

    res.json(schedules);
  })
);

// Get specific facility type (spa, gym, pool, etc.)
router.get("/:hotelId/facilities/:type", 
  validations.headers.hotelId, 
  asyncHandler(async (req: Request<FacilityParams>, res: Response, next: NextFunction) => {
    const { hotelId, type } = req.params;
    if (!type) {
      return next(new ValidationError('Facility type is required', [{field:'type', message:'Facility type missing'}]));
    }
    const facilitiesResult = await db.query.facility.findMany({
      where: and(
        eq(facility.hotelid, hotelId),
        eq(facility.type, type.toUpperCase())
      ),
    });
    
    // Note: Returning empty array is acceptable if no facilities match type
    // A 404 would only be appropriate if the HOTEL wasn't found (handled earlier)
    res.json(facilitiesResult);
}));

// Get housekeeping types
router.get("/:hotelId/housekeeping-types", 
  validations.headers.hotelId, 
  asyncHandler(async (req: Request<HotelParams>, res: Response, next: NextFunction) => {
    const types = await db.query.housekeepingtype.findMany({
      where: eq(housekeepingtype.hotelid, req.params.hotelId),
    });
    res.json(types);
}));

// Get special products for a hotel
router.get("/:hotelId/special-products", 
  validations.headers.hotelId, 
  asyncHandler(async (req: Request<HotelParams>, res: Response, next: NextFunction) => {
    const hotelId = req.params.hotelId;

    const products = await db
      .select({
        productId: specialproducts.productid,
        hotelId: specialproducts.hotelid,
        name: specialproducts.name,
        description: specialproducts.description,
        isActive: specialproducts.isactive,
        createdAt: specialproducts.createdat,
        updatedAt: specialproducts.updatedat,
        priceId: specialproducts.priceid,
        priceAmount: priceTable.amount,
        priceCurrencyId: priceTable.currencyid,
        priceCurrencyCode: currency.code,
        priceType: priceTable.pricetype,
        priceDescription: priceTable.description
      })
      .from(specialproducts)
      .innerJoin(priceTable, eq(specialproducts.priceid, priceTable.priceid))
      .innerJoin(currency, eq(priceTable.currencyid, currency.currencyid))
      .where(and(
        eq(specialproducts.hotelid, hotelId),
        eq(specialproducts.isactive, true) 
      ));
    
    res.json(products);
  })
);

// Add a new endpoint to get a specific restaurant's operating schedule
router.get("/:hotelId/restaurants/:restaurantId/schedule", 
  validations.headers.hotelId, 
  asyncHandler(async (req: Request<RestaurantParams>, res: Response, next: NextFunction) => {
    const { hotelId, restaurantId } = req.params;

    if (!restaurantId) {
      return next(new ValidationError('Restaurant ID is required', [{ field: 'restaurantId', message: 'Restaurant ID required'}]));
    }

    // Fetch schedules joining with intervals for times
    const schedules = await db
      .select({
        scheduleId: restaurantoperatingschedule.restaurantopscheduleid,
        restaurantId: restaurantoperatingschedule.restaurantid,
        intervalId: restaurantoperatingschedule.intervalid,
        dayOfWeek: restaurantoperatingschedule.dayofweek,
        scheduleType: restaurantoperatingschedule.scheduletype,
        isActive: restaurantoperatingschedule.isactive,
        notes: restaurantoperatingschedule.notes,
        startTime: scheduleinterval.starttime,
        endTime: scheduleinterval.endtime,
        intervalDescription: scheduleinterval.description
      })
      .from(restaurantoperatingschedule)
      .innerJoin(scheduleinterval, eq(restaurantoperatingschedule.intervalid, scheduleinterval.intervalid))
      .where(and(
        eq(restaurantoperatingschedule.restaurantid, restaurantId),
        eq(restaurantoperatingschedule.isactive, true) 
      ));

    if (schedules.length === 0) {
       const restaurantExists = await db.select({id: restaurant.restaurantid}).from(restaurant).where(eq(restaurant.restaurantid, restaurantId)).limit(1);
       if(restaurantExists.length === 0){
          return next(new NotFoundError('Restaurant'));
       }
    }

    res.json(schedules);
  })
);

export default router; 