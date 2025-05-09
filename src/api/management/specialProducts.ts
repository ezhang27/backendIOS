import express, { Request, Response, NextFunction } from 'express';
import { db } from '../../config/db';
import { 
  specialproducts,
  price as priceTable,
  guest,
  name,
  currency,
  hotel,
  // priceTypeEnum
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
 * Get all special products for a hotel
 * 
 * @route GET /api/management/special-products
 * @param {string} hotelId - The hotel ID
 * @param {number} page - (Optional) Page number for pagination
 * @param {number} limit - (Optional) Number of items per page
 */
router.get('/', asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const hotelId = req.query.hotelId as string;
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;
  const offset = (page - 1) * limit;
  const searchTerm = req.query.name as string;
  const isActiveQuery = req.query.isActive as string;
  const priceTypeQuery = req.query.priceType as string;

  if (!hotelId) {
    return next(new ValidationError('Hotel ID is required', [{ field: 'hotelId', message: 'Hotel ID is required'}]));
  }

  const conditions = [eq(specialproducts.hotelid, hotelId)];
  if (searchTerm) {
    conditions.push(like(specialproducts.name, `%${searchTerm}%`));
  }
  if (isActiveQuery !== undefined) {
    conditions.push(eq(specialproducts.isactive, isActiveQuery === 'true'));
  }
  if (priceTypeQuery) {
    const priceTypeArray = priceTypeQuery.split(',').map(pt => pt.trim()).filter(pt => pt);
    if (priceTypeArray.length > 0) {
        conditions.push(inArray(priceTable.pricetype, priceTypeArray));
    } else if (priceTypeArray.length > 0) {
        conditions.push(sql`false`);
    }
  }

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
      priceCurrencyCode: currency.code,
      priceType: priceTable.pricetype,
      priceDescription: priceTable.description
    })
    .from(specialproducts)
    .innerJoin(priceTable, eq(specialproducts.priceid, priceTable.priceid))
    .innerJoin(currency, eq(priceTable.currencyid, currency.currencyid))
    .where(and(...conditions))
    .orderBy(desc(specialproducts.createdat))
    .limit(limit)
    .offset(offset);

  const totalCountResult = await db
    .select({ count: sql<number>`count(${specialproducts.productid})`.mapWith(Number) })
    .from(specialproducts)
    .innerJoin(priceTable, eq(specialproducts.priceid, priceTable.priceid))
    .where(and(...conditions));
  
  const totalCount = totalCountResult[0]?.count ?? 0;
  const totalPages = Math.ceil(totalCount / limit);

  res.json({ 
    data: products,
    meta: {
      page,
      limit,
      totalCount,
      totalPages
    }
  });
}));

/**
 * Get a specific special product by ID
 * 
 * @route GET /api/management/special-products/:productId
 * @param {string} productId - The product ID
 * @param {string} hotelId - The hotel ID for validation
 */
router.get('/:productId', asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const { productId } = req.params;
  const hotelId = req.query.hotelId as string;

  if (!hotelId) {
    return next(new ValidationError('Hotel ID is required as query parameter for validation', [{field: 'hotelId', message: 'Hotel ID query param required'}]));
  }
  if (!productId) {
    return next(new ValidationError('Product ID is required', [{field: 'productId', message: 'Product ID is required'}]));
  }

  const productResult = await db
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
        priceCurrencyCode: currency.code,
        priceType: priceTable.pricetype,
        priceDescription: priceTable.description
    })
    .from(specialproducts)
    .innerJoin(priceTable, eq(specialproducts.priceid, priceTable.priceid))
    .innerJoin(currency, eq(priceTable.currencyid, currency.currencyid))
    .where(and(eq(specialproducts.productid, productId), eq(specialproducts.hotelid, hotelId)));

  if (productResult.length === 0) {
    return next(new NotFoundError('Special product'));
  }
  res.json(productResult[0]);
}));

/**
 * Create a new special product
 * 
 * @route POST /api/management/special-products
 * @param {string} hotelId - The hotel ID
 * @param {string} guestId - The guest ID
 * @param {string} name - Product name
 * @param {number} quantity - Quantity
 * @param {string} description - Product description
 * @param {object} price - Price information
 */
router.post('/', asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const {
    hotelId,
    name: productName,
    description,
    priceAmount,
    priceCurrencyCode,
    priceType,
    priceDescription,
    isActive = true,
  } = req.body;

  if (!hotelId || !productName || priceAmount === undefined || !priceCurrencyCode || !priceType) {
    return next(new ValidationError('Missing required fields', [
      { field: 'hotelId', message: 'hotelId is required' },
      { field: 'name', message: 'name is required' },
      { field: 'priceAmount', message: 'priceAmount is required' },
      { field: 'priceCurrencyCode', message: 'priceCurrencyCode is required' },
      { field: 'priceType', message: 'priceType is required' },
    ]));
  }

  if (typeof priceType !== 'string' || priceType.trim() === '') {
    return next(new ValidationError('Invalid price type', [{field: 'priceType', message: 'Price type must be a non-empty string.'}]));
  }

  const hotelExists = await db.select({id: hotel.hotelid}).from(hotel).where(eq(hotel.hotelid, hotelId)).limit(1);
  if(hotelExists.length === 0) return next(new NotFoundError('Hotel'));

  const currencyRec = await db.select({ id: currency.currencyid }).from(currency).where(eq(currency.code, priceCurrencyCode.toUpperCase())).limit(1);
  if (currencyRec.length === 0) {
    return next(new NotFoundError(`Currency code ${priceCurrencyCode}`));
  }
  const currencyId = currencyRec[0].id;

  // Validate and parse priceAmount
  if (priceAmount === undefined || priceAmount === null) {
    return next(new ValidationError('Missing required field: priceAmount', [{ field: 'priceAmount', message: 'Required' }]));
  }
  const numericPriceAmount = parseFloat(priceAmount as string); // Assuming priceAmount might be string
  if (isNaN(numericPriceAmount) || numericPriceAmount < 0) {
    return next(new ValidationError('priceAmount must be a non-negative number', [{ field: 'priceAmount', message: 'Invalid number' }]));
  }

  const newProductId = uuidv4();
  const newPriceId = uuidv4();

  await db.transaction(async (tx) => {
    await tx.insert(priceTable).values({
      priceid: newPriceId,
      hotelid: hotelId,
      amount: numericPriceAmount.toString(),
      currencyid: currencyId,
      pricetype: priceType,
      description: priceDescription,
    });

    await tx.insert(specialproducts).values({
      productid: newProductId,
      hotelid: hotelId,
      priceid: newPriceId,
      name: productName,
      description: description,
      isactive: isActive,
    });
  });

  const createdProduct = await db
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
        priceCurrencyCode: currency.code,
        priceType: priceTable.pricetype,
        priceDescription: priceTable.description
    })
    .from(specialproducts)
    .innerJoin(priceTable, eq(specialproducts.priceid, priceTable.priceid))
    .innerJoin(currency, eq(priceTable.currencyid, currency.currencyid))
    .where(eq(specialproducts.productid, newProductId));

  res.status(201).json(createdProduct[0]);
}));

/**
 * Update a special product
 * 
 * @route PUT /api/management/special-products/:productId
 * @param {string} productId - The product ID
 * @param {string} hotelId - The hotel ID for validation
 * @param {string} name - (Optional) Product name
 * @param {number} quantity - (Optional) Quantity
 * @param {string} description - (Optional) Product description
 * @param {object} price - (Optional) Price information
 */
router.put('/:productId', asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const { productId } = req.params;
  const { 
    hotelId,
    name: productName,
    description,
    isActive,
    priceAmount,
    priceCurrencyCode,
    priceType,
    priceDescription
  } = req.body;

  if (!hotelId) {
    return next(new ValidationError('hotelId is required in body for validation', [{field: 'hotelId', message: 'hotelId required'}]));
  }

  const productRecord = await db.select({ id: specialproducts.productid, hotelid: specialproducts.hotelid, priceid: specialproducts.priceid }).from(specialproducts).where(eq(specialproducts.productid, productId)).limit(1);

  if (productRecord.length === 0) {
    return next(new NotFoundError('Special product'));
  }
  if (productRecord[0].hotelid !== hotelId) {
    return next(new ValidationError('Product does not belong to the specified hotel', [{field: 'hotelId', message: 'Hotel ID mismatch'}]));
  }

  const now = new Date().toISOString();
  const updateProductData: Partial<typeof specialproducts.$inferInsert> = { updatedat: now };
  const updatePriceData: Partial<typeof priceTable.$inferInsert> = { updatedat: now };
  let currencyIdToUpdate: string | undefined = undefined;

  if (productName !== undefined) updateProductData.name = productName;
  if (description !== undefined) updateProductData.description = description;
  if (isActive !== undefined) updateProductData.isactive = isActive;
  
  if (priceAmount !== undefined) {
    if (priceAmount === null) {
        return next(new ValidationError('priceAmount cannot be null if provided for update', [{ field: 'priceAmount', message: 'Cannot be null' }]));
    }
    const numericPriceAmount = parseFloat(priceAmount as string);
    if (isNaN(numericPriceAmount) || numericPriceAmount < 0) {
        return next(new ValidationError('priceAmount must be a non-negative number if provided for update', [{ field: 'priceAmount', message: 'Invalid number' }]));
    }
    updatePriceData.amount = numericPriceAmount.toString();
  }

  if (priceType !== undefined) {
    if (typeof priceType !== 'string' || priceType.trim() === '') {
        return next(new ValidationError('Invalid price type for update', [{field: 'priceType', message: 'Price type must be a non-empty string.'}]));
    }
    updatePriceData.pricetype = priceType;
  }
  if (priceDescription !== undefined) updatePriceData.description = priceDescription;

  if (priceCurrencyCode !== undefined) {
    const currencyRec = await db.select({ id: currency.currencyid }).from(currency).where(eq(currency.code, priceCurrencyCode.toUpperCase())).limit(1);
    if (currencyRec.length === 0) return next(new NotFoundError(`Currency code ${priceCurrencyCode}`));
    currencyIdToUpdate = currencyRec[0].id;
    updatePriceData.currencyid = currencyIdToUpdate;
  }

  await db.transaction(async (tx) => {
    if (Object.keys(updateProductData).length > 1) {
      await tx.update(specialproducts).set(updateProductData).where(eq(specialproducts.productid, productId));
    }
    if (Object.keys(updatePriceData).length > 1 && productRecord[0].priceid) {
      await tx.update(priceTable).set(updatePriceData).where(eq(priceTable.priceid, productRecord[0].priceid));
    }
  });

  const updatedProduct = await db
    .select({
        productId: specialproducts.productid,
        hotelId: specialproducts.hotelid,
        name: specialproducts.name,
        description: specialproducts.description,
        isActive: specialproducts.isactive,
        priceId: specialproducts.priceid,
        priceAmount: priceTable.amount,
        priceCurrencyCode: currency.code,
        priceType: priceTable.pricetype,
        priceDescription: priceTable.description
    })
    .from(specialproducts)
    .innerJoin(priceTable, eq(specialproducts.priceid, priceTable.priceid))
    .innerJoin(currency, eq(priceTable.currencyid, currency.currencyid))
    .where(eq(specialproducts.productid, productId));

  res.json(updatedProduct[0]);
}));

/**
 * Delete a special product
 * 
 * @route DELETE /api/management/special-products/:productId
 * @param {string} productId - The product ID
 * @param {string} hotelId - The hotel ID for validation
 */
router.delete('/:productId', asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const { productId } = req.params;
  const hotelId = req.query.hotelId as string;

  if (!hotelId) {
    return next(new ValidationError('Hotel ID is required as query parameter for validation', [{field: 'hotelId', message: 'Hotel ID query param required'}]));
  }

  const product = await db.select({ productid: specialproducts.productid, hotelid: specialproducts.hotelid, priceid: specialproducts.priceid }).from(specialproducts).where(eq(specialproducts.productid, productId)).limit(1);

  if (product.length === 0) {
    return next(new NotFoundError('Special product'));
  }
  if (product[0].hotelid !== hotelId) {
    return next(new ValidationError('Product does not belong to the specified hotel. Cannot delete.', [{field: 'hotelId', message: 'Hotel ID mismatch'}]));
  }

  const priceIdToDelete = product[0].priceid;

  await db.transaction(async (tx) => {
    await tx.delete(specialproducts).where(eq(specialproducts.productid, productId));
    if (priceIdToDelete) {
        try {
            await tx.delete(priceTable).where(eq(priceTable.priceid, priceIdToDelete));
        } catch (e: any) {
            console.warn(`Could not delete price record ${priceIdToDelete} associated with product ${productId}. It might be in use. Error: ${e.message}`);
        }
    }
  });

  res.status(200).json({ message: 'Special product deleted successfully' });
}));

export default router; 