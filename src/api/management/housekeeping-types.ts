import express, { Request, Response, NextFunction } from 'express';
import { db } from '../../config/db';
import { housekeepingtype } from '../../models/schema';
import { eq, and, sql, ne } from 'drizzle-orm';
import { v4 as uuidv4 } from 'uuid';
import { asyncHandler, NotFoundError, ValidationError, DatabaseError } from '../../middleware/errorHandler';

const router = express.Router();

/**
 * Get all housekeeping types for a hotel
 * 
 * @route GET /api/management/housekeeping/types
 * @param {string} hotelId - The hotel ID
 */
router.get('/', asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const hotelId = req.query.hotelId as string;

  if (!hotelId) {
    return next(new ValidationError('Hotel ID is required', [{ field: 'hotelId', message: 'Hotel ID is required' }]));
  }

  const housekeepingTypes = await db
    .select({
      housekeepingtypeid: housekeepingtype.housekeepingtypeid,
      hotelid: housekeepingtype.hotelid,
      type: housekeepingtype.type,
      description: housekeepingtype.description,
      urgency: housekeepingtype.urgency,
      createdat: housekeepingtype.createdat,
      updatedat: housekeepingtype.updatedat
    })
    .from(housekeepingtype)
    .where(eq(housekeepingtype.hotelid, hotelId))
    .orderBy(housekeepingtype.type);

  const countResult = await db
    .select({ count: sql<number>`count(${housekeepingtype.housekeepingtypeid})`.mapWith(Number) })
    .from(housekeepingtype)
    .where(eq(housekeepingtype.hotelid, hotelId));

  const totalCount = countResult[0]?.count ?? 0;

  const formattedTypes = housekeepingTypes.map(type => ({
    id: type.housekeepingtypeid,
    hotelId: type.hotelid,
    type: type.type,
    description: type.description,
    urgency: type.urgency,
    createdAt: type.createdat,
    updatedAt: type.updatedat
  }));

  res.json({
    data: formattedTypes,
    meta: {
      totalCount
    }
  });
}));

/**
 * Get a specific housekeeping type by ID
 * 
 * @route GET /api/management/housekeeping/types/:typeId
 * @param {string} typeId - The housekeeping type ID
 * @param {string} hotelId - The hotel ID for validation
 */
router.get('/:typeId', asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const { typeId } = req.params;
  const hotelId = req.query.hotelId as string;

  if (!hotelId) {
    return next(new ValidationError('Hotel ID is required', [{ field: 'hotelId', message: 'Hotel ID is required' }]));
  }
  if (!typeId) {
    return next(new ValidationError('Type ID is required', [{ field: 'typeId', message: 'Type ID is required' }]));
  }

  const [housekeepingTypeData] = await db
    .select()
    .from(housekeepingtype)
    .where(
      and(
        eq(housekeepingtype.housekeepingtypeid, typeId),
        eq(housekeepingtype.hotelid, hotelId)
      )
    );

  if (!housekeepingTypeData) {
    return next(new NotFoundError('Housekeeping type'));
  }

  const formattedType = {
    id: housekeepingTypeData.housekeepingtypeid,
    hotelId: housekeepingTypeData.hotelid,
    type: housekeepingTypeData.type,
    description: housekeepingTypeData.description,
    urgency: housekeepingTypeData.urgency,
    createdAt: housekeepingTypeData.createdat,
    updatedAt: housekeepingTypeData.updatedat
  };

  res.json({ data: formattedType });
}));

/**
 * Create a new housekeeping type
 * 
 * @route POST /api/management/housekeeping/types
 * @param {string} hotelId - The hotel ID
 * @param {string} type - The type name
 * @param {string} description - Description of the type
 * @param {number} urgency - Urgency level (1-5)
 */
router.post('/', asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const { hotelId, type, description, urgency } = req.body;

  if (!hotelId) {
    return next(new ValidationError('Hotel ID is required', [{ field: 'hotelId', message: 'Hotel ID is required' }]));
  }
  if (!type) {
    return next(new ValidationError('Type name is required', [{ field: 'type', message: 'Type name is required' }]));
  }
  if (urgency !== undefined && (typeof urgency !== 'number' || urgency < 1 || urgency > 5)) {
    return next(new ValidationError('Urgency must be a number between 1 and 5', [{ field: 'urgency', message: 'Urgency must be a number between 1 and 5' }]));
  }

  const existingType = await db
    .select({ housekeepingtypeid: housekeepingtype.housekeepingtypeid })
    .from(housekeepingtype)
    .where(
      and(
        eq(housekeepingtype.hotelid, hotelId),
        eq(housekeepingtype.type, type)
      )
    )
    .limit(1);

  if (existingType.length > 0) {
    return next(new ValidationError('A housekeeping type with this name already exists for this hotel', [{ field: 'type', message: 'Conflict' }]));
  }

  const newTypeId = uuidv4();
  const valuesToInsert: typeof housekeepingtype.$inferInsert = {
    housekeepingtypeid: newTypeId,
    hotelid: hotelId,
    type,
    description,
  };
  if (urgency !== undefined) {
    valuesToInsert.urgency = urgency;
  }

  const [createdTypeRecord] = await db.insert(housekeepingtype).values(valuesToInsert).returning();

  if (!createdTypeRecord) {
    return next(new DatabaseError('Failed to create housekeeping type.'));
  }
  
  const formattedType = {
    id: createdTypeRecord.housekeepingtypeid,
    hotelId: createdTypeRecord.hotelid,
    type: createdTypeRecord.type,
    description: createdTypeRecord.description,
    urgency: createdTypeRecord.urgency,
    createdAt: createdTypeRecord.createdat,
    updatedAt: createdTypeRecord.updatedat
  };

  res.status(201).json({ 
    message: 'Housekeeping type created successfully',
    data: formattedType
  });
}));

/**
 * Update a housekeeping type
 * 
 * @route PUT /api/management/housekeeping/types/:typeId
 * @param {string} typeId - The housekeeping type ID
 * @param {string} hotelId - The hotel ID for validation
 * @param {string} type - The type name
 * @param {string} description - Description of the type
 * @param {number} urgency - Urgency level (1-5)
 */
router.put('/:typeId', asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const { typeId } = req.params;
  const { hotelId, type, description, urgency } = req.body;

  if (!hotelId) {
    return next(new ValidationError('Hotel ID is required for update', [{ field: 'hotelId', message: 'Hotel ID is required' }]));
  }
  if (!type && description === undefined && urgency === undefined) {
    return next(new ValidationError('No update data provided.', []));
  }
  if (type !== undefined && typeof type !== 'string'){
    return next(new ValidationError('Type name must be a string', [{field: 'type', message: 'Must be string'}]));
  }
  if (urgency !== undefined && (typeof urgency !== 'number' || urgency < 1 || urgency > 5)) {
    return next(new ValidationError('Urgency must be a number between 1 and 5', [{ field: 'urgency', message: 'Urgency must be a number between 1 and 5' }]));
  }

  const [existingTypeCheck] = await db
    .select({ housekeepingtypeid: housekeepingtype.housekeepingtypeid })
    .from(housekeepingtype)
    .where(and(eq(housekeepingtype.housekeepingtypeid, typeId), eq(housekeepingtype.hotelid, hotelId)))
    .limit(1);

  if (!existingTypeCheck) {
    return next(new NotFoundError('Housekeeping type to update'));
  }

  if (type) {
    const duplicateType = await db
      .select({ housekeepingtypeid: housekeepingtype.housekeepingtypeid })
      .from(housekeepingtype)
      .where(
        and(
          eq(housekeepingtype.hotelid, hotelId),
          eq(housekeepingtype.type, type),
          ne(housekeepingtype.housekeepingtypeid, typeId)
        )
      )
      .limit(1);

    if (duplicateType.length > 0) {
      return next(new ValidationError('Another housekeeping type with this name already exists for this hotel', [{ field: 'type', message: 'Conflict' }]));
    }
  }

  const updateValues: Partial<typeof housekeepingtype.$inferInsert> = {};
  if (type !== undefined) updateValues.type = type;
  if (description !== undefined) updateValues.description = description;
  if (urgency !== undefined) updateValues.urgency = urgency;

  const [updatedTypeRecord] = await db
    .update(housekeepingtype)
    .set(updateValues)
    .where(and(eq(housekeepingtype.housekeepingtypeid, typeId), eq(housekeepingtype.hotelid, hotelId)))
    .returning();
  
  if (!updatedTypeRecord) {
    return next(new DatabaseError('Failed to update housekeeping type or type not found.'));
  }

  const formattedType = {
    id: updatedTypeRecord.housekeepingtypeid,
    hotelId: updatedTypeRecord.hotelid,
    type: updatedTypeRecord.type,
    description: updatedTypeRecord.description,
    urgency: updatedTypeRecord.urgency,
    createdAt: updatedTypeRecord.createdat,
    updatedAt: updatedTypeRecord.updatedat
  };

  res.json({ 
    message: 'Housekeeping type updated successfully',
    data: formattedType
  });
}));

/**
 * Delete a housekeeping type
 * 
 * @route DELETE /api/management/housekeeping/types/:typeId
 * @param {string} typeId - The housekeeping type ID
 * @param {string} hotelId - The hotel ID for validation
 */
router.delete('/:typeId', asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const { typeId } = req.params;
  const hotelId = req.query.hotelId as string;

  if (!hotelId) {
    return next(new ValidationError('Hotel ID query parameter is required for validation', [{ field: 'hotelId', message: 'Hotel ID is required' }]));
  }
  if (!typeId) {
    return next(new ValidationError('Type ID is required', [{ field: 'typeId', message: 'Type ID is required' }]));
  }

  const [existingType] = await db
    .select({ housekeepingtypeid: housekeepingtype.housekeepingtypeid })
    .from(housekeepingtype)
    .where(
      and(
        eq(housekeepingtype.housekeepingtypeid, typeId),
        eq(housekeepingtype.hotelid, hotelId)
      )
    )
    .limit(1);

  if (!existingType) {
    return next(new NotFoundError('Housekeeping type to delete'));
  }

  const result = await db
    .delete(housekeepingtype)
    .where(and(eq(housekeepingtype.housekeepingtypeid, typeId), eq(housekeepingtype.hotelid, hotelId)));
  
  res.status(200).json({ message: 'Housekeeping type deleted successfully' });
}));

export default router; 