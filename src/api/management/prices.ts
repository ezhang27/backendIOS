import { Router, Request, Response, NextFunction } from 'express';
import { db } from '../../config/db';
import { 
  price,
  currency,
  hotel
} from '../../models/schema';
import { 
  eq, 
  and,
  desc,
  sql
} from 'drizzle-orm';
import { v4 as uuidv4 } from 'uuid';
import { asyncHandler, NotFoundError, ValidationError, DatabaseError } from '../../middleware/errorHandler';

const router = Router();

// Interfaces for clarity
interface PriceIdParam { priceId: string; }
interface HotelIdQuery { hotelId: string; }
interface PaginationQuery { page?: string; limit?: string; }

/**
 * Get all prices 
 * 
 * @route GET /api/management/prices
 * @param {string} hotelId - The hotel ID
 * @param {number} page - (Optional) Page number for pagination
 * @param {number} limit - (Optional) Number of items per page
 */
router.get('/', asyncHandler(async (req, res, next) => {
  // Assert query types
  const { hotelId } = req.query as HotelIdQuery;
  const { page: pageQuery, limit: limitQuery } = req.query as PaginationQuery;
  
  const page = parseInt(pageQuery || '1');
  const limit = parseInt(limitQuery || '20');

  if (!hotelId) {
    return next(new ValidationError('Hotel ID is required', [{ field: 'hotelId', message: 'Hotel ID required' }]));
  }
  if (isNaN(page) || page < 1) return next(new ValidationError('Invalid page number', [{ field: 'page', message: 'Must be positive integer' }]));
  if (isNaN(limit) || limit < 1 || limit > 100) return next(new ValidationError('Invalid limit value', [{ field: 'limit', message: 'Must be 1-100' }]));

  const offset = (page - 1) * limit;

  const pricesData = await db
    .select({
      price: {
        priceid: price.priceid,
        hotelid: price.hotelid,
        amount: price.amount,
        currencyid: price.currencyid,
        pricetype: price.pricetype,
        description: price.description,
        createdat: price.createdat,
        updatedat: price.updatedat
      },
      currency: {
        code: currency.code,
        symbol: currency.symbol,
        name: currency.name
      },
      hotel: {
        name: hotel.name
      }
    })
    .from(price)
    .leftJoin(currency, eq(price.currencyid, currency.currencyid))
    .leftJoin(hotel, eq(price.hotelid, hotel.hotelid))
    .where(eq(price.hotelid, hotelId))
    .orderBy(desc(price.createdat))
    .limit(limit)
    .offset(offset);

  const countResult = await db
    .select({ count: sql<number>`count(${price.priceid})`.mapWith(Number) })
    .from(price)
    .where(eq(price.hotelid, hotelId));
  
  const totalCount = countResult[0]?.count ?? 0;
  const totalPages = Math.ceil(totalCount / limit);

  const formattedPrices = pricesData.map(priceData => ({
    priceId: priceData.price.priceid,
    hotelId: priceData.price.hotelid,
    amount: priceData.price.amount,
    currency: priceData.currency ? {
      currencyId: priceData.price.currencyid,
      code: priceData.currency.code,
      symbol: priceData.currency.symbol,
      name: priceData.currency.name
    } : {
      currencyId: priceData.price.currencyid,
      code: 'UNKNOWN',
      symbol: '',
      name: 'Unknown Currency'
    },
    priceType: priceData.price.pricetype,
    description: priceData.price.description,
    createdAt: priceData.price.createdat,
    updatedAt: priceData.price.updatedat
  }));

  res.json({ 
    data: formattedPrices,
    meta: {
      page,
      limit,
      totalCount,
      totalPages
    }
  });
}));

/**
 * Create a new price entry
 * 
 * @route POST /api/management/prices
 * @param {string} hotelId - The hotel ID
 * @param {string} amount - The price amount
 * @param {string} currencyCode - Currency code (e.g., 'USD', 'EUR')
 * @param {string} priceType - (Optional) Type of price
 * @param {string} description - (Optional) Description of price
 */
router.post('/', asyncHandler(async (req, res, next) => {
  // Assert body type
  const { 
    hotelId, 
    amount, 
    currencyCode = 'USD',
    priceType,
    description
  } = req.body as { 
    hotelId: string, 
    amount: string, 
    currencyCode?: string, 
    priceType?: string, 
    description?: string 
  };
  
  if (!hotelId) {
    return next(new ValidationError('Missing required field: hotelId', [{ field: 'hotelId', message: 'Required' }]));
  }
  if (amount === undefined || amount === null) {
    return next(new ValidationError('Missing required field: amount', [{ field: 'amount', message: 'Required' }]));
  }
  
  const numericAmount = parseFloat(amount);
  if (isNaN(numericAmount) || numericAmount < 0) {
    return next(new ValidationError('Amount must be a non-negative number', [{ field: 'amount', message: 'Invalid number' }]));
  }
  
  const [hotelExists] = await db.select({ id: hotel.hotelid }).from(hotel).where(eq(hotel.hotelid, hotelId));
  if (!hotelExists) {
    return next(new NotFoundError(`Hotel with ID ${hotelId}`));
  }
  
  const [currencyData] = await db.select({ currencyid: currency.currencyid }).from(currency).where(eq(currency.code, currencyCode.toUpperCase()));
  if (!currencyData) {
    return next(new ValidationError(`Invalid currency code: ${currencyCode}`, [{ field: 'currencyCode', message: 'Invalid code' }]));
  }
  
  if (priceType !== undefined && (typeof priceType !== 'string' || priceType.trim() === '')) {
    return next(new ValidationError('Invalid price type', [{field: 'priceType', message: 'Must be a non-empty string if provided'}]));
  }

  const timestamp = new Date().toISOString();
  const newPriceId = uuidv4();
  
  const priceValues: typeof price.$inferInsert = {
      priceid: newPriceId,
      hotelid: hotelId,
      amount: numericAmount.toString(),
      currencyid: currencyData.currencyid,
      pricetype: priceType,
      description: description,
  };

  const [newPrice] = await db.insert(price).values(priceValues).returning();
  
  if (!newPrice) {
      return next(new DatabaseError('Failed to create price entry after insert.'));
  }

  const [createdPriceData] = await db
      .select({
          price: {
              priceid: price.priceid,
              hotelid: price.hotelid,
              amount: price.amount,
              currencyid: price.currencyid,
              pricetype: price.pricetype,
              description: price.description,
              createdat: price.createdat,
              updatedat: price.updatedat
          },
          currency: {
              code: currency.code,
              symbol: currency.symbol,
              name: currency.name
          }
      })
      .from(price)
      .leftJoin(currency, eq(price.currencyid, currency.currencyid))
      .where(eq(price.priceid, newPrice.priceid));

  if (!createdPriceData) {
      return next(new DatabaseError('Failed to retrieve created price details.'));
  }

  res.status(201).json({
      priceId: createdPriceData.price.priceid,
      hotelId: createdPriceData.price.hotelid,
      amount: createdPriceData.price.amount,
      currency: createdPriceData.currency ? {
          currencyId: createdPriceData.price.currencyid,
          code: createdPriceData.currency.code,
          symbol: createdPriceData.currency.symbol,
          name: createdPriceData.currency.name
      } : {
          currencyId: createdPriceData.price.currencyid,
          code: currencyCode.toUpperCase(),
          symbol: '?',
          name: 'Unknown Currency'
      },
      priceType: createdPriceData.price.pricetype,
      description: createdPriceData.price.description,
      createdAt: createdPriceData.price.createdat,
      updatedAt: createdPriceData.price.updatedat
  });
}));

/**
 * Get a specific price by ID
 * 
 * @route GET /api/management/prices/:priceId
 * @param {string} priceId - The price ID
 * @param {string} hotelId - The hotel ID for validation (query param)
 */
router.get('/:priceId', asyncHandler(async (req, res, next) => {
  const { priceId } = req.params as PriceIdParam;
  const { hotelId } = req.query as HotelIdQuery;

  if (!priceId) {
    return next(new ValidationError('Price ID parameter is required', [{ field: 'priceId', message: 'Required' }]));
  }
  if (!hotelId) {
    return next(new ValidationError('Hotel ID query parameter is required for validation', [{ field: 'hotelId', message: 'Required' }]));
  }

  const [priceData] = await db
    .select({
      price: {
        priceid: price.priceid,
        hotelid: price.hotelid,
        amount: price.amount,
        currencyid: price.currencyid,
        pricetype: price.pricetype,
        description: price.description,
        createdat: price.createdat,
        updatedat: price.updatedat
      },
      currency: {
        code: currency.code,
        symbol: currency.symbol,
        name: currency.name
      }
    })
    .from(price)
    .leftJoin(currency, eq(price.currencyid, currency.currencyid))
    .where(and(eq(price.priceid, priceId), eq(price.hotelid, hotelId)));

  if (!priceData) {
    return next(new NotFoundError(`Price with ID ${priceId} not found for hotel ${hotelId}`));
  }

  const formattedPrice = {
    priceId: priceData.price.priceid,
    hotelId: priceData.price.hotelid,
    amount: priceData.price.amount,
    currency: priceData.currency ? {
        currencyId: priceData.price.currencyid,
        code: priceData.currency.code,
        symbol: priceData.currency.symbol,
        name: priceData.currency.name
    } : {
        currencyId: priceData.price.currencyid,
        code: 'UNKNOWN',
        symbol: '',
        name: 'Unknown Currency'
    },
    priceType: priceData.price.pricetype,
    description: priceData.price.description,
    createdAt: priceData.price.createdat,
    updatedAt: priceData.price.updatedat
  };

  res.json(formattedPrice);
}));

/**
 * Update a price entry
 * 
 * @route PUT /api/management/prices/:priceId
 * @param {string} priceId - The price ID
 * @param {string} hotelId - The hotel ID for validation (in body)
 * @param {string} amount - The new amount (in body)
 * @param {string} currencyCode - (Optional) The currency code (in body)
 * @param {string} priceType - (Optional) The price type (in body)
 * @param {string} description - (Optional) The description (in body)
 */
router.put('/:priceId', asyncHandler(async (req, res, next) => {
  const { priceId } = req.params as PriceIdParam;
  const { 
    hotelId, 
    amount, 
    currencyCode,
    priceType,
    description
  } = req.body as { 
      hotelId: string, 
      amount?: string,
      currencyCode?: string, 
      priceType?: string, 
      description?: string 
  };

  if (!hotelId) {
    return next(new ValidationError('hotelId in body is required for validation', [{ field: 'hotelId', message: 'Required' }]));
  }
  if (!priceId) {
    return next(new ValidationError('Price ID parameter is required', [{ field: 'priceId', message: 'Required' }]));
  }

  if (amount === undefined && currencyCode === undefined && priceType === undefined && description === undefined) {
      return next(new ValidationError('No update data provided.', []));
  }

  let numericAmount: number | undefined = undefined;
  if (amount !== undefined) {
      numericAmount = parseFloat(amount);
      if (isNaN(numericAmount) || numericAmount < 0) {
          return next(new ValidationError('Amount must be a non-negative number if provided', [{ field: 'amount', message: 'Invalid number' }]));
      }
  }

  if (priceType !== undefined && (typeof priceType !== 'string' || priceType.trim() === '')) {
    return next(new ValidationError('Invalid price type', [{field: 'priceType', message: 'Must be a non-empty string if provided'}]));
  }

  const [existingPrice] = await db.select({ currentCurrencyId: price.currencyid })
      .from(price)
      .where(and(eq(price.priceid, priceId), eq(price.hotelid, hotelId)));

  if (!existingPrice) {
    return next(new NotFoundError(`Price with ID ${priceId} not found for hotel ${hotelId}`));
  }

  const priceUpdateData: Partial<typeof price.$inferInsert> = { updatedat: new Date().toISOString() };

  if (numericAmount !== undefined) {
      priceUpdateData.amount = numericAmount.toString();
  }
  if (priceType !== undefined) {
      priceUpdateData.pricetype = priceType;
  }
  if (description !== undefined) {
      priceUpdateData.description = description;
  }

  if (currencyCode !== undefined) {
    const [currencyData] = await db.select({ currencyid: currency.currencyid }).from(currency).where(eq(currency.code, currencyCode.toUpperCase()));
    if (!currencyData) {
      return next(new ValidationError(`Invalid currency code: ${currencyCode}`, [{ field: 'currencyCode', message: 'Invalid code' }]));
    }
    priceUpdateData.currencyid = currencyData.currencyid;
  }

  const [updatedPrice] = await db.update(price)
    .set(priceUpdateData)
    .where(and(eq(price.priceid, priceId), eq(price.hotelid, hotelId)))
    .returning();

  if (!updatedPrice) {
      return next(new DatabaseError(`Failed to update price ${priceId}.`));
  }

  const [priceWithCurrency] = await db
    .select({
      price: {
        priceid: price.priceid,
        hotelid: price.hotelid,
        amount: price.amount,
        currencyid: price.currencyid,
        pricetype: price.pricetype,
        description: price.description,
        createdat: price.createdat,
        updatedat: price.updatedat
      },
      currency: {
        code: currency.code,
        symbol: currency.symbol,
        name: currency.name
      }
    })
    .from(price)
    .leftJoin(currency, eq(price.currencyid, currency.currencyid))
    .where(eq(price.priceid, priceId));
    
  if (!priceWithCurrency) {
      return next(new DatabaseError('Failed to retrieve updated price details.'));
  }

  res.json({
    priceId: priceWithCurrency.price.priceid,
    hotelId: priceWithCurrency.price.hotelid,
    amount: priceWithCurrency.price.amount,
    currency: priceWithCurrency.currency ? {
        currencyId: priceWithCurrency.price.currencyid,
        code: priceWithCurrency.currency.code,
        symbol: priceWithCurrency.currency.symbol,
        name: priceWithCurrency.currency.name
    } : {
        currencyId: priceWithCurrency.price.currencyid,
        code: currencyCode?.toUpperCase() || 'UNKNOWN',
        symbol: '?',
        name: 'Unknown Currency'
    },
    priceType: priceWithCurrency.price.pricetype,
    description: priceWithCurrency.price.description,
    createdAt: priceWithCurrency.price.createdat,
    updatedAt: priceWithCurrency.price.updatedat
  });
}));

/**
 * Delete a price entry
 * 
 * @route DELETE /api/management/prices/:priceId
 * @param {string} priceId - The price ID
 * @param {string} hotelId - The hotel ID for validation (query param)
 */
router.delete('/:priceId', asyncHandler(async (req, res, next) => {
  const { priceId } = req.params as PriceIdParam;
  const { hotelId } = req.query as HotelIdQuery;
  
  if (!priceId) {
    return next(new ValidationError('Price ID parameter is required', [{ field: 'priceId', message: 'Required' }]));
  }
  if (!hotelId) {
    return next(new ValidationError('Hotel ID query parameter is required for validation', [{ field: 'hotelId', message: 'Required' }]));
  }
  
  const [existingPrice] = await db.select({ priceid: price.priceid })
      .from(price)
      .where(and(eq(price.priceid, priceId), eq(price.hotelid, hotelId)));
      
  if (!existingPrice) {
    return next(new NotFoundError(`Price with ID ${priceId} not found for hotel ${hotelId}`));
  }
  
  const result = await db.delete(price)
                      .where(and(eq(price.priceid, priceId), eq(price.hotelid, hotelId)));

  res.status(200).json({ message: `Price ID ${priceId} deleted successfully` });
}));

export default router; 