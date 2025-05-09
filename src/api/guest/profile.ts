import { Router } from 'express';
import { Request, Response, NextFunction } from 'express';
import { eq, and, or, sql, inArray } from 'drizzle-orm';
import { db } from '../../config/db';
import { 
  guest, 
  name, 
  // address, // Will be joined via GuestAddress
  language,
  guestpreference,
  guestdietaryrestriction,
  dietaryrestriction,
  emailaddress, // Corrected case
  phonenumber, // Corrected case
  guestaddress, // Corrected case
  address as AddressTable, // Renamed to avoid conflict with variable name
  state, // New import
  country, // New import
  contacttype, // Corrected case
  addresstype // Corrected case
} from '../../models/schema';
import crypto from 'crypto';
import asyncHandler from 'express-async-handler'; // Import asyncHandler
import { NotFoundError, ValidationError } from '../../middleware/errorHandler'; // Corrected import path

const router = Router();

/**
 * Get guest profile information
 * 
 * @route GET /api/guest/profile
 * @param {string} guestId - The guest ID
 * @returns {object} Guest profile information
 * @throws {NotFoundError} If guest is not found.
 * @throws {ValidationError} If guestId is missing.
 */
router.get('/', asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const guestId = req.query.guestId as string;
  
  if (!guestId) {
    return next(new ValidationError('Missing guestId parameter', [{ field: 'guestId', message: 'Guest ID is required' }]));
  }
  
  const guestDataResult = await db
    .select({
      guestid: guest.guestid,
      hotelid: guest.hotelid, // Keep for context, even if preferences are per hotel
      userid: guest.userid,
      dob: guest.dob,
      gender: guest.gender,
      rewardsinfo: guest.rewardsinfo, // Assuming schema changed 'rewards' to 'rewardsinfo' (JSONB)
      isactive: guest.isactive,
      createdat: guest.createdat,
      updatedat: guest.updatedat,
      nameTitle: name.title,
      firstName: name.firstname,
      middleName: name.middlename,
      lastName: name.lastname,
      langCode: language.languagecode,
      langName: language.name,
    })
    .from(guest)
    .leftJoin(name, eq(guest.nameid, name.nameid))
    .leftJoin(language, eq(guest.languageid, language.languagecode))
    .where(eq(guest.guestid, guestId));
  
  if (!guestDataResult || guestDataResult.length === 0) {
    return next(new NotFoundError('Guest'));
  }
  
  const guestData = guestDataResult[0];

  // Get Email Addresses
  const emails = await db
    .select({
      emailAddressId: emailaddress.emailid,
      emailAddress: emailaddress.address,
      isVerified: emailaddress.isverified,
      isPrimary: emailaddress.isprimary,
      contactTypeId: emailaddress.contacttypeid,
      contactTypeName: contacttype.type,
    })
    .from(emailaddress)
    .leftJoin(contacttype, eq(emailaddress.contacttypeid, contacttype.contacttypeid))
    .where(eq(emailaddress.guestid, guestId));

  // Get Phone Numbers
  const phones = await db
    .select({
      phoneNumberId: phonenumber.numberid,
      phoneNumber: phonenumber.number,
      isVerified: phonenumber.isverified,
      isPrimary: phonenumber.isprimary,
      contactTypeId: phonenumber.contacttypeid,
      contactTypeName: contacttype.type,
    })
    .from(phonenumber)
    .leftJoin(contacttype, eq(phonenumber.contacttypeid, contacttype.contacttypeid))
    .where(eq(phonenumber.guestid, guestId));

  // Get Guest Addresses
  const addressesData = await db
    .select({
      guestAddressId: guestaddress.guestaddressid,
      addressId: guestaddress.addressid,
      line1: AddressTable.line1,
      line2: AddressTable.line2,
      postalCode: AddressTable.postalcode,
      cityName: AddressTable.cityname,
      stateName: state.statename,
      countryName: country.countryname,
      addressTypeName: addresstype.typename,
      isPrimary: guestaddress.isprimary,
    })
    .from(guestaddress)
    .innerJoin(AddressTable, eq(guestaddress.addressid, AddressTable.addressid))
    .innerJoin(state, eq(AddressTable.statecode, state.statecode))
    .innerJoin(country, eq(state.countrycode, country.countrycode))
    .leftJoin(addresstype, eq(guestaddress.addresstypeid, addresstype.addresstypeid))
    .where(eq(guestaddress.guestid, guestId));
  
  // Get guest preferences (all hotels for this guest, or could be filtered by guestData.hotelid if needed)
  const preferences = await db
    .select({
      preferenceid: guestpreference.preferenceid,
      hotelid: guestpreference.hotelid,
      preferencetype: guestpreference.preferencetype,
      preferencevalue: guestpreference.preferencevalue,
      createdat: guestpreference.createdat,
      updatedat: guestpreference.updatedat
    })
    .from(guestpreference)
    .where(eq(guestpreference.guestid, guestId));
  
  const dietaryRestrictions = await db
    .select({
      restrictioncode: guestdietaryrestriction.restrictioncode,
      name: dietaryrestriction.name,
      description: dietaryrestriction.description
    })
    .from(guestdietaryrestriction)
    .leftJoin(dietaryrestriction, eq(guestdietaryrestriction.restrictioncode, dietaryrestriction.code))
    .where(eq(guestdietaryrestriction.guestid, guestId));
  
  const primaryEmail = emails.find(e => e.isPrimary) || (emails.length > 0 ? emails[0] : null);
  const primaryPhone = phones.find(p => p.isPrimary) || (phones.length > 0 ? phones[0] : null);

  const response = {
    guestId: guestData.guestid,
    hotelId: guestData.hotelid, // Current hotel context for the guest record
    userId: guestData.userid,
    name: {
      title: guestData.nameTitle || null,
      firstName: guestData.firstName || null,
      middleName: guestData.middleName || null,
      lastName: guestData.lastName || null,
      fullName: `${guestData.nameTitle ? guestData.nameTitle + ' ' : ''}${guestData.firstName || ''} ${guestData.lastName || ''}`.trim()
    },
    primaryEmail: primaryEmail ? {
      emailAddressId: primaryEmail.emailAddressId,
      emailAddress: primaryEmail.emailAddress,
      isVerified: primaryEmail.isVerified,
      contactTypeId: primaryEmail.contactTypeId,
      contactTypeName: primaryEmail.contactTypeName,
    } : null,
    primaryPhoneNumber: primaryPhone ? {
      phoneNumberId: primaryPhone.phoneNumberId,
      phoneNumber: primaryPhone.phoneNumber,
      isVerified: primaryPhone.isVerified,
      contactTypeId: primaryPhone.contactTypeId,
      contactTypeName: primaryPhone.contactTypeName,
    } : null,
    allEmails: emails.map(e => ({...e})),
    allPhoneNumbers: phones.map(p => ({...p})),
    addresses: addressesData.map(addr => ({
      guestAddressId: addr.guestAddressId,
      addressId: addr.addressId,
      line1: addr.line1,
      line2: addr.line2,
      postalCode: addr.postalCode,
      cityName: addr.cityName,
      stateName: addr.stateName,
      countryName: addr.countryName,
      addressTypeName: addr.addressTypeName,
      isPrimary: addr.isPrimary,
    })),
    language: guestData.langCode ? {
      code: guestData.langCode,
      name: guestData.langName
    } : null,
    personal: {
      dateOfBirth: guestData.dob,
      gender: guestData.gender
    },
    guestPreferences: preferences.map(pref => ({
      preferenceId: pref.preferenceid,
      hotelId: pref.hotelid,
      type: pref.preferencetype,
      value: pref.preferencevalue,
      createdAt: pref.createdat,
      updatedAt: pref.updatedat
    })),
    dietaryRestrictions: dietaryRestrictions.map(restriction => ({
      code: restriction.restrictioncode,
      name: restriction.name,
      description: restriction.description
    })),
    rewardsInfo: guestData.rewardsinfo, // Changed from rewards
    isActive: guestData.isactive,
    createdAt: guestData.createdat,
    updatedAt: guestData.updatedat
  };
  
  res.json(response);
}));

/**
 * Get all preferences for a guest, optionally filtered by hotelId
 * @route GET /api/guest/profile/preferences
 * @param {string} guestId - The guest ID (query param)
 * @param {string} [hotelId] - Optional hotel ID to filter preferences (query param)
 * @returns {object[]} List of guest preferences
 * @throws {ValidationError} If guestId is missing.
 */
router.get('/preferences', asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const guestId = req.query.guestId as string;
  const hotelId = req.query.hotelId as string | undefined;

  if (!guestId) {
    return next(new ValidationError('Missing guestId parameter', [{ field: 'guestId', message: 'Guest ID is required' }]));
  }

  const conditions = [eq(guestpreference.guestid, guestId)];
  if (hotelId) {
    conditions.push(eq(guestpreference.hotelid, hotelId));
  }

  const preferencesResult = await db.select().from(guestpreference).where(and(...conditions));
  res.json(preferencesResult);
}));


/**
 * Update guest preferences for a specific hotel.
 * This will replace all existing preferences for the guest at that hotel.
 * 
 * @route PUT /api/guest/profile/preferences
 * @param {string} guestId - The guest ID
 * @param {string} hotelId - The hotel ID for which preferences are being set
 * @param {Array<{preferenceType: string, preferenceValue: object}>} preferences - Array of preference objects
 * @returns {object[]} Updated list of preferences for the guest at the specified hotel
 * @throws {NotFoundError} If guest or hotel is not found.
 * @throws {ValidationError} If required fields are missing or preferences array is malformed.
 */
router.put('/preferences', asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const { guestId, hotelId, preferences: newPreferencesArray } = req.body;
  
  if (!guestId || !hotelId || !Array.isArray(newPreferencesArray)) {
    return next(new ValidationError('Missing or invalid fields', 
      [{ field: 'guestId', message: 'guestId is required' }, 
       { field: 'hotelId', message: 'hotelId is required' },
       { field: 'preferences', message: 'preferences must be an array' }
      ]));
  }

  for (const pref of newPreferencesArray) {
    if (!pref.preferenceType || typeof pref.preferenceType !== 'string' || typeof pref.preferenceValue === 'undefined') {
      return next(new ValidationError('Invalid preference object format', 
        [{ field: 'preferenceType', message: 'Each preference must have a preferenceType (string)' },
         { field: 'preferenceValue', message: 'Each preference must have a preferenceValue' }
        ]));
    }
  }
  
  const [existingGuest] = await db.select({ guestid: guest.guestid }).from(guest).where(eq(guest.guestid, guestId));
  if (!existingGuest) {
    return next(new NotFoundError('Guest'));
  }

  const now = new Date();

  const results = await db.transaction(async (tx) => {
    await tx.delete(guestpreference).where(
      and(
        eq(guestpreference.guestid, guestId),
        eq(guestpreference.hotelid, hotelId)
      )
    );

    if (newPreferencesArray.length === 0) {
      return [];
    }

    const preferencesToInsert = newPreferencesArray.map(pref => ({
      preferenceid: crypto.randomUUID(),
      guestid: guestId,
      hotelid: hotelId,
      preferencetype: pref.preferenceType,
      preferencevalue: pref.preferenceValue,
      createdat: now.toISOString(),
    }));
    
    const inserted = await tx.insert(guestpreference).values(preferencesToInsert).returning();
    return inserted;
  });
  
  res.status(200).json(results);
}));

/**
 * Update guest dietary restrictions
 * 
 * @route PUT /api/guest/profile/dietary-restrictions
 * @param {string} guestId - The guest ID
 * @param {array} restrictionCodes - Array of dietary restriction codes
 * @returns {object} Updated dietary restrictions
 */
router.put('/dietary-restrictions', asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const { guestId, restrictionCodes } = req.body;
  
  if (!guestId || !Array.isArray(restrictionCodes)) {
    return next(new ValidationError('Missing required fields', 
      [{ field: 'guestId', message: 'guestId is required' }, 
       { field: 'restrictionCodes', message: 'restrictionCodes (array) is required' }]
    ));
  }
  
  const [existingGuest] = await db
    .select({ guestid: guest.guestid }) // Select specific field to check existence
    .from(guest)
    .where(eq(guest.guestid, guestId));
  
  if (!existingGuest) {
    return next(new NotFoundError('Guest'));
  }
  
  if (restrictionCodes.length > 0) { // Only query if there are codes to check
    const validRestrictions = await db
      .select({ code: dietaryrestriction.code })
      .from(dietaryrestriction)
      .where(inArray(dietaryrestriction.code, restrictionCodes as string[])); // Added type assertion for restrictionCodes
    
    if (validRestrictions.length !== restrictionCodes.length) {
      const validDbCodes = validRestrictions.map(r => r.code);
      const invalidCodes = (restrictionCodes as string[]).filter(code => !validDbCodes.includes(code));
      
      return next(new ValidationError('Invalid restriction codes provided', 
        invalidCodes.map(code => ({ field: 'restrictionCodes', message: `Code ${code} is invalid` }))
      ));
    }
  }
  
  await db.transaction(async (tx) => {
    await tx
      .delete(guestdietaryrestriction)
      .where(eq(guestdietaryrestriction.guestid, guestId));
    
    if (restrictionCodes.length > 0) {
      const now = new Date().toISOString();
      const restrictionsToInsert = (restrictionCodes as string[]).map(code => ({
        guestid: guestId,
        restrictioncode: code,
        createdat: now // Assuming updatedat will be handled by db trigger or not needed here
      }));
      await tx
        .insert(guestdietaryrestriction)
        .values(restrictionsToInsert);
    }
  });
  
  const updatedRestrictions = await db
    .select({
      restrictioncode: guestdietaryrestriction.restrictioncode,
      name: dietaryrestriction.name,
      description: dietaryrestriction.description
    })
    .from(guestdietaryrestriction)
    .leftJoin(dietaryrestriction, eq(guestdietaryrestriction.restrictioncode, dietaryrestriction.code))
    .where(eq(guestdietaryrestriction.guestid, guestId));
  
  res.json({
    guestId,
    dietaryRestrictions: updatedRestrictions.map(restriction => ({
      code: restriction.restrictioncode,
      name: restriction.name,
      description: restriction.description
    })),
    message: 'Dietary restrictions updated successfully'
  });
}));

/**
 * Update basic guest profile information (name, language, dob, gender, rewards)
 * 
 * @route PUT /api/guest/profile
 * @param {string} guestId - The guest ID (from req.body)
 * @param {object} [name] - Optional name object { title, firstName, middleName, lastName }
 * @param {string} [languageCode] - Optional language code (UUID)
 * @param {string} [gender] - Optional gender string
 * @param {string} [dateOfBirth] - Optional DOB (ISO 8601 string)
 * @param {object} [rewardsInfo] - Optional JSON rewards object
 * @returns {object} Updated core guest profile data
 * @throws {NotFoundError} If guest or related entities (like language) are not found.
 * @throws {ValidationError} If guestId is missing or payload is invalid.
 */
router.put('/', asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const { guestId, name: nameData, languageCode, gender, dateOfBirth, rewardsInfo } = req.body;

  if (!guestId) {
    return next(new ValidationError('guestId is required in the request body', [{ field: 'guestId', message: 'guestId is required'}]));
  }

  const guestRecordQuery = await db.select({ guestid: guest.guestid, nameid: guest.nameid, languageid: guest.languageid }).from(guest).where(eq(guest.guestid, guestId)).limit(1);
  if (guestRecordQuery.length === 0) {
    return next(new NotFoundError('Guest'));
  }
  const currentGuestRecord = guestRecordQuery[0];

  const updateGuestData: Partial<typeof guest.$inferInsert> = { /* updatedat removed */ };
  let updateNameData: Partial<typeof name.$inferInsert> | null = null;

  if (languageCode) {
    const langExists = await db.select({ languagecode: language.languagecode }).from(language).where(eq(language.languagecode, languageCode)).limit(1);
    if (langExists.length === 0) {
      return next(new NotFoundError('Language'));
    }
    updateGuestData.languageid = languageCode;
  }

  if (gender) updateGuestData.gender = gender;
  if (dateOfBirth) updateGuestData.dob = dateOfBirth; // Assuming YYYY-MM-DD string from client
  if (rewardsInfo) updateGuestData.rewardsinfo = rewardsInfo;

  if (nameData) {
    updateNameData = { /* updatedat removed */ };
    if (nameData.title) updateNameData.title = nameData.title;
    if (nameData.firstName) updateNameData.firstname = nameData.firstName;
    if (nameData.middleName) updateNameData.middlename = nameData.middleName;
    if (nameData.lastName) updateNameData.lastname = nameData.lastName;
  }

  await db.transaction(async (tx) => {
    if (Object.keys(updateGuestData).length > 0) { // if not empty after removing updatedat
      await tx.update(guest).set(updateGuestData).where(eq(guest.guestid, guestId));
    }
    if (updateNameData && currentGuestRecord.nameid && Object.keys(updateNameData).length > 0) { // if not empty
      await tx.update(name).set(updateNameData).where(eq(name.nameid, currentGuestRecord.nameid));
    }
  });

  // Refetch more complete data to confirm update
  const guestDataResult = await db
    .select({
      guestid: guest.guestid,
      hotelid: guest.hotelid,
      userid: guest.userid,
      dob: guest.dob,
      gender: guest.gender,
      rewardsinfo: guest.rewardsinfo,
      isactive: guest.isactive,
      createdat: guest.createdat,
      updatedat: guest.updatedat, // This will be the new DB-set updatedat
      nameTitle: name.title,
      firstName: name.firstname,
      middleName: name.middlename,
      lastName: name.lastname,
      langCode: language.languagecode,
      langName: language.name,
    })
    .from(guest)
    .leftJoin(name, eq(guest.nameid, name.nameid))
    .leftJoin(language, eq(guest.languageid, language.languagecode))
    .where(eq(guest.guestid, guestId));
  
  if (!guestDataResult || guestDataResult.length === 0) {
    // Should not happen if update was on an existing guest
    return next(new NotFoundError('Guest after update'));
  }
  
  const updatedGuestData = guestDataResult[0];

  // Optionally, could fetch contacts, addresses etc. as in GET / to make response fully consistent.
  // For now, returning the core updated guest data with name and language.
  const response = {
    guestId: updatedGuestData.guestid,
    hotelId: updatedGuestData.hotelid,
    userId: updatedGuestData.userid,
    name: {
      title: updatedGuestData.nameTitle || null,
      firstName: updatedGuestData.firstName || null,
      middleName: updatedGuestData.middleName || null,
      lastName: updatedGuestData.lastName || null,
      fullName: `${updatedGuestData.nameTitle ? updatedGuestData.nameTitle + ' ' : ''}${updatedGuestData.firstName || ''} ${updatedGuestData.lastName || ''}`.trim()
    },
    language: updatedGuestData.langCode ? {
      code: updatedGuestData.langCode,
      name: updatedGuestData.langName
    } : null,
    personal: {
      dateOfBirth: updatedGuestData.dob,
      gender: updatedGuestData.gender
    },
    rewardsInfo: updatedGuestData.rewardsinfo,
    isActive: updatedGuestData.isactive,
    createdAt: updatedGuestData.createdat,
    updatedAt: updatedGuestData.updatedat // Fresh from DB
  };

  res.json(response);
}));

/**
 * Get guest contact information (emails and phone numbers)
 * @route GET /api/guest/profile/contact
 * @param {string} guestId - The guest ID (query param)
 * @returns {object} Primary and all email/phone contacts
 * @throws {NotFoundError} If guest is not found.
 * @throws {ValidationError} If guestId is missing.
 */
router.get('/contact', asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const guestId = req.query.guestId as string;
  if (!guestId) {
    return next(new ValidationError('Missing guestId parameter', [{ field: 'guestId', message: 'guestId is required'}]));
  }

  const guestExists = await db.select({ guestid: guest.guestid }).from(guest).where(eq(guest.guestid, guestId)).limit(1);
  if (guestExists.length === 0) {
    return next(new NotFoundError('Guest'));
  }

  const emails = await db
    .select({
      emailAddressId: emailaddress.emailid,
      emailAddress: emailaddress.address,
      isVerified: emailaddress.isverified,
      isPrimary: emailaddress.isprimary,
      contactTypeId: emailaddress.contacttypeid,
      contactTypeName: contacttype.type,
    })
    .from(emailaddress)
    .leftJoin(contacttype, eq(emailaddress.contacttypeid, contacttype.contacttypeid))
    .where(eq(emailaddress.guestid, guestId));

  const phones = await db
    .select({
      phoneNumberId: phonenumber.numberid,
      phoneNumber: phonenumber.number,
      isVerified: phonenumber.isverified,
      isPrimary: phonenumber.isprimary,
      contactTypeId: phonenumber.contacttypeid,
      contactTypeName: contacttype.type,
    })
    .from(phonenumber)
    .leftJoin(contacttype, eq(phonenumber.contacttypeid, contacttype.contacttypeid))
    .where(eq(phonenumber.guestid, guestId));

  res.json({
    primaryEmail: emails.find(e => e.isPrimary) || (emails.length > 0 ? emails[0] : null),
    primaryPhoneNumber: phones.find(p => p.isPrimary) || (phones.length > 0 ? phones[0] : null),
    allEmails: emails,
    allPhoneNumbers: phones,
  });
}));

/**
 * Update guest contact information (emails and phone numbers)
 * This is a full replacement of contacts for the guest based on input.
 * @route PUT /api/guest/profile/contact
 * @param {string} guestId - The guest ID
 * @param {Array} [emails] - Array of email objects { emailAddress, contactTypeId, isPrimary, emailAddressId? }
 * @param {Array} [phoneNumbers] - Array of phone objects { phoneNumber, contactTypeId, isPrimary, phoneNumberId? }
 * @returns {object} Updated contact information
 * @throws {NotFoundError} If guest or contact types are not found.
 * @throws {ValidationError} If payload is invalid.
 */
router.put('/contact', asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const { guestId, emails: emailInputs, phoneNumbers: phoneInputs } = req.body;

  if (!guestId) {
    return next(new ValidationError('guestId is required', [{field: 'guestId', message: 'guestId is required'}]));
  }

  const guestRecord = await db.select({ guestid: guest.guestid }).from(guest).where(eq(guest.guestid, guestId)).limit(1);
  if (guestRecord.length === 0) {
    return next(new NotFoundError('Guest'));
  }
  
  const now = new Date().toISOString();

  await db.transaction(async (tx) => {
    // Handle Emails
    if (emailInputs && Array.isArray(emailInputs)) {
      // Delete existing emails for the guest not in the input list (by ID if provided, else by address+type)
      const existingEmails = await tx.select({ id: emailaddress.emailid, address: emailaddress.address, type: emailaddress.contacttypeid }).from(emailaddress).where(eq(emailaddress.guestid, guestId));
      const inputEmailIds = emailInputs.map(e => e.emailAddressId).filter(id => id);
      const emailsToDelete = existingEmails.filter(ee => 
          !inputEmailIds.includes(ee.id) && 
          !emailInputs.some(ei => ei.emailAddress === ee.address && ei.contactTypeId === ee.type && !ei.emailAddressId)
      ).map(e => e.id);
      if (emailsToDelete.length > 0) {
        await tx.delete(emailaddress).where(and(eq(emailaddress.guestid, guestId), inArray(emailaddress.emailid, emailsToDelete)));
      }

      let primaryEmailSet = false;
      for (const input of emailInputs) {
        if (!input.emailAddress || !input.contactTypeId) {
          throw new ValidationError('Each email must have emailAddress and contactTypeId', []);
        }
        const contactTypeExists = await tx.select({id: contacttype.contacttypeid}).from(contacttype).where(eq(contacttype.contacttypeid, input.contactTypeId)).limit(1);
        if(contactTypeExists.length === 0) throw new NotFoundError(`ContactType ID ${input.contactTypeId}`);

        const isPrimary = input.isPrimary && !primaryEmailSet;
        if (isPrimary) primaryEmailSet = true;

        const emailData = {
          guestid: guestId,
          email: input.emailAddress,
          contacttypeid: input.contactTypeId,
          isprimary: isPrimary,
          isverified: input.isVerified || false,
        };

        if (input.emailAddressId) { // Update existing by ID
          await tx.update(emailaddress).set({...emailData, address: input.emailAddress}).where(and(eq(emailaddress.emailid, input.emailAddressId), eq(emailaddress.guestid, guestId)));
        } else { // Upsert: try to update if address+type match, else insert
          const existing = await tx.select({id: emailaddress.emailid}).from(emailaddress)
            .where(and(eq(emailaddress.guestid, guestId), eq(emailaddress.address, input.emailAddress), eq(emailaddress.contacttypeid, input.contactTypeId)))
            .limit(1);
          if(existing.length > 0){
            await tx.update(emailaddress).set({...emailData, address: input.emailAddress}).where(eq(emailaddress.emailid, existing[0].id));
          } else {
            await tx.insert(emailaddress).values({ ...emailData, address: input.emailAddress, emailid: crypto.randomUUID(), createdat: now });
          }
        }
      }
      // If a primary was set, ensure others are not primary
      if (primaryEmailSet && emailInputs.filter(e=>e.isPrimary).length > 0) {
        const primaryEmailAddress = emailInputs.find(e => e.isPrimary)?.emailAddress;
        await tx.update(emailaddress).set({isprimary: false}).where(and(eq(emailaddress.guestid, guestId), or(...emailInputs.filter(e => e.isPrimary && e.emailAddress !== primaryEmailAddress).map(e => eq(emailaddress.address, e.emailAddress)) ) ));
      }
    }

    // Handle Phone Numbers (similar logic to emails)
    if (phoneInputs && Array.isArray(phoneInputs)) {
      const existingPhones = await tx.select({ id: phonenumber.numberid, number: phonenumber.number, type: phonenumber.contacttypeid }).from(phonenumber).where(eq(phonenumber.guestid, guestId));
      const inputPhoneIds = phoneInputs.map(p => p.phoneNumberId).filter(id => id);
      const phonesToDelete = existingPhones.filter(ep => 
          !inputPhoneIds.includes(ep.id) && 
          !phoneInputs.some(pi => pi.phoneNumber === ep.number && pi.contactTypeId === ep.type && !pi.phoneNumberId)
      ).map(p => p.id);
      if (phonesToDelete.length > 0) {
        await tx.delete(phonenumber).where(and(eq(phonenumber.guestid, guestId), inArray(phonenumber.numberid, phonesToDelete)));
      }

      let primaryPhoneSet = false;
      for (const input of phoneInputs) {
        if (!input.phoneNumber || !input.contactTypeId) {
          throw new ValidationError('Each phone number must have phoneNumber and contactTypeId', []);
        }
        const contactTypeExists = await tx.select({id: contacttype.contacttypeid}).from(contacttype).where(eq(contacttype.contacttypeid, input.contactTypeId)).limit(1);
        if(contactTypeExists.length === 0) throw new NotFoundError(`ContactType ID ${input.contactTypeId}`);
        
        const isPrimary = input.isPrimary && !primaryPhoneSet;
        if (isPrimary) primaryPhoneSet = true;

        const phoneData = {
          guestid: guestId,
          number: input.phoneNumber,
          contacttypeid: input.contactTypeId,
          isprimary: isPrimary,
          isverified: input.isVerified || false,
        };
        if (input.phoneNumberId) {
          await tx.update(phonenumber).set(phoneData).where(and(eq(phonenumber.numberid, input.phoneNumberId), eq(phonenumber.guestid, guestId)));
        } else {
           const existing = await tx.select({id: phonenumber.numberid}).from(phonenumber)
            .where(and(eq(phonenumber.guestid, guestId), eq(phonenumber.number, input.phoneNumber), eq(phonenumber.contacttypeid, input.contactTypeId)))
            .limit(1);
          if(existing.length > 0){
            await tx.update(phonenumber).set(phoneData).where(eq(phonenumber.numberid, existing[0].id));
          } else {
            await tx.insert(phonenumber).values({ ...phoneData, numberid: crypto.randomUUID(), createdat: now });
          }
        }
      }
      if (primaryPhoneSet && phoneInputs.filter(p=>p.isPrimary).length > 0) {
         const primaryPhoneNumberStr = phoneInputs.find(p => p.isPrimary)?.phoneNumber;
        await tx.update(phonenumber).set({isprimary: false}).where(and(eq(phonenumber.guestid, guestId), or(...phoneInputs.filter(p => p.isPrimary && p.phoneNumber !== primaryPhoneNumberStr).map(p => eq(phonenumber.number, p.phoneNumber)) ) ));
      }
    }
  });

  // Refetch contacts
  const updatedEmails = await db.select().from(emailaddress).where(eq(emailaddress.guestid, guestId));
  const updatedPhones = await db.select().from(phonenumber).where(eq(phonenumber.guestid, guestId));

  res.json({ emails: updatedEmails, phoneNumbers: updatedPhones });
}));

/**
 * Get guest addresses
 * @route GET /api/guest/profile/address
 * @param {string} guestId - The guest ID (query param)
 * @returns {Array<object>} List of guest addresses
 * @throws {NotFoundError} If guest is not found.
 * @throws {ValidationError} If guestId is missing.
 */
router.get('/address', asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const guestId = req.query.guestId as string;
  if (!guestId) {
    return next(new ValidationError('Missing guestId parameter', [{field: 'guestId', message: 'guestId is required'}]));
  }
  const guestExists = await db.select({ guestid: guest.guestid }).from(guest).where(eq(guest.guestid, guestId)).limit(1);
  if (guestExists.length === 0) {
    return next(new NotFoundError('Guest'));
  }

  const addresses = await db
    .select({
      guestAddressId: guestaddress.guestaddressid,
      addressId: guestaddress.addressid,
      line1: AddressTable.line1,
      line2: AddressTable.line2,
      postalCode: AddressTable.postalcode,
      cityName: AddressTable.cityname,
      stateName: state.statename,
      countryName: country.countryname,
      addressTypeName: addresstype.typename,
      isPrimary: guestaddress.isprimary,
      notes: guestaddress.notes
    })
    .from(guestaddress)
    .innerJoin(AddressTable, eq(guestaddress.addressid, AddressTable.addressid))
    .innerJoin(state, eq(AddressTable.statecode, state.statecode))
    .innerJoin(country, eq(state.countrycode, country.countrycode))
    .leftJoin(addresstype, eq(guestaddress.addresstypeid, addresstype.addresstypeid))
    .where(eq(guestaddress.guestid, guestId));
  res.json(addresses);
}));

/**
 * Update guest addresses. This is a full replacement of addresses for the guest.
 * @route PUT /api/guest/profile/address
 * @param {string} guestId - The guest ID
 * @param {Array<object>} addresses - Array of address objects
 * @returns {Array<object>} Updated list of guest addresses
 * @throws {NotFoundError} If guest or related entities are not found.
 * @throws {ValidationError} If payload is invalid.
 */
router.put('/address', asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const { guestId, addresses: addressInputs } = req.body;

  if (!guestId || !Array.isArray(addressInputs)) {
    return next(new ValidationError('guestId and addresses array are required', [{field: 'guestId', message: 'guestId required'}, {field: 'addresses', message: 'addresses array required'}]));
  }

  const guestRecord = await db.select({ guestid: guest.guestid }).from(guest).where(eq(guest.guestid, guestId)).limit(1);
  if (guestRecord.length === 0) {
    return next(new NotFoundError('Guest'));
  }

  const now = new Date().toISOString();
  let primaryAddressSet = false;

  await db.transaction(async (tx) => {
    // Get existing guest addresses to determine which to delete
    const existingGuestAddresses = await tx.select({ guestaddressid: guestaddress.guestaddressid, addressid: guestaddress.addressid }).from(guestaddress).where(eq(guestaddress.guestid, guestId));
    const inputGuestAddressIds = addressInputs.map(a => a.guestAddressId).filter(id => id);
    
    const guestAddressesToDelete = existingGuestAddresses.filter(ega => !inputGuestAddressIds.includes(ega.guestaddressid)).map(ga => ga.guestaddressid);
    if(guestAddressesToDelete.length > 0){
        await tx.delete(guestaddress).where(and(eq(guestaddress.guestid, guestId), inArray(guestaddress.guestaddressid, guestAddressesToDelete)));
        // Note: This does not delete from the base 'address' table, only unlinks.
        // Deleting from 'address' table would require checking if other entities reference it.
    }

    for (const input of addressInputs) {
      if (!input.line1 || !input.postalCode || !input.cityName || !input.stateCode || !input.addressTypeId) {
        throw new ValidationError('Address input missing required fields (line1, postalCode, cityName, stateCode, addressTypeId)', []);
      }
      const stateExists = await tx.select({statecode: state.statecode}).from(state).where(eq(state.statecode, input.stateCode)).limit(1);
      if(stateExists.length === 0) throw new NotFoundError(`State code ${input.stateCode}`);
      const addressTypeExists = await tx.select({id: addresstype.addresstypeid}).from(addresstype).where(eq(addresstype.addresstypeid, input.addressTypeId)).limit(1);
      if(addressTypeExists.length === 0) throw new NotFoundError(`AddressType ID ${input.addressTypeId}`);

      const isPrimary = input.isPrimary && !primaryAddressSet;
      if (isPrimary) primaryAddressSet = true;

      let currentAddressId = input.addressId;

      // Create or Update AddressTable entry
      if (currentAddressId) { // If addressId is provided, update that address
        await tx.update(AddressTable).set({
          line1: input.line1,
          line2: input.line2,
          postalcode: input.postalCode,
          cityname: input.cityName,
          statecode: input.stateCode,
        }).where(eq(AddressTable.addressid, currentAddressId));
      } else { // No addressId, create new address record
        const newAddressResult = await tx.insert(AddressTable).values({
          addressid: crypto.randomUUID(),
          line1: input.line1,
          line2: input.line2,
          postalcode: input.postalCode,
          cityname: input.cityName,
          statecode: input.stateCode,
        }).returning({ addressid: AddressTable.addressid });
        currentAddressId = newAddressResult[0].addressid;
      }

      // Create or Update GuestAddress link
      const guestAddressData = {
        guestid: guestId,
        addressid: currentAddressId,
        addresstypeid: input.addressTypeId,
        isprimary: isPrimary,
        notes: input.notes,
      };

      if (input.guestAddressId) { // If guestAddressId provided, update that link
        await tx.update(guestaddress).set(guestAddressData).where(eq(guestaddress.guestaddressid, input.guestAddressId));
      } else { // No guestAddressId, create new link (or update if one exists for this addressId for this guest - less likely for full replacement strategy)
        // For full replacement, we assume new links are being made for new/updated addresses not matched by guestAddressId.
         await tx.insert(guestaddress).values({ ...guestAddressData, guestaddressid: crypto.randomUUID(), createdat: now });
      }
    }
    // If a primary was set, ensure others are not primary
    if (primaryAddressSet && addressInputs.filter(a => a.isPrimary).length > 0) {
      const primaryGuestAddress = addressInputs.find(a => a.isPrimary);
      // This logic might need refinement based on how guestAddressId vs addressId is handled for identifying the primary
      // For now, assume we find the guestAddressId of the one marked primary, or the addressId if guestAddressId is new
      const primaryIdToExclude = primaryGuestAddress?.guestAddressId || 
                                (primaryGuestAddress?.addressId ? 
                                  (await tx.select({id: guestaddress.guestaddressid}).from(guestaddress).where(and(eq(guestaddress.guestid, guestId), eq(guestaddress.addressid, primaryGuestAddress.addressId), eq(guestaddress.isprimary, true))).limit(1))[0]?.id 
                                  : null);
      if (primaryIdToExclude) {
        await tx.update(guestaddress).set({isprimary: false}).where(and(eq(guestaddress.guestid, guestId), sql`${guestaddress.guestaddressid} != ${primaryIdToExclude}`));
      }
    }

  });

  const updatedAddresses = await db.select().from(guestaddress)
                            .innerJoin(AddressTable, eq(guestaddress.addressid, AddressTable.addressid))
                            .innerJoin(state, eq(AddressTable.statecode, state.statecode))
                            .innerJoin(country, eq(state.countrycode, country.countrycode))
                            .leftJoin(addresstype, eq(guestaddress.addresstypeid, addresstype.addresstypeid))
                            .where(eq(guestaddress.guestid, guestId));
  res.json(updatedAddresses.map(ua => ({ ...ua.guestaddress, addressDetails: ua.address, stateDetails: ua.state, countryDetails: ua.country, addressTypeDetails: ua.addresstype })));
}));

export default router; 