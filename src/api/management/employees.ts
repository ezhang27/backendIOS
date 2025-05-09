import express, { Request, Response, RequestHandler, NextFunction } from 'express';
import { db } from '../../config/db';
import { 
  employee,
  role,
  name,
  hotel
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
import { AuthenticatedRequest, requireAuth, linkUserIdentity } from '../../clerk/auth';
import asyncHandler from 'express-async-handler';
import { NotFoundError, ValidationError, DatabaseError } from '../../middleware/errorHandler';

const router = express.Router();

/**
 * Get all employees for a hotel
 * 
 * @route GET /api/management/employees
 * @param {string} hotelId - The hotel ID
 * @param {string} role - (Optional) Filter by role name
 * @param {number} page - (Optional) Page number for pagination
 * @param {number} limit - (Optional) Number of items per page
 * @param {string} search - (Optional) Search by employee name
 */
router.get('/', asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const hotelId = req.query.hotelId as string;
  const roleNameQuery = req.query.role as string;
  const search = req.query.search as string;
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 20;

  if (!hotelId) {
    return next(new ValidationError('Hotel ID is required', [{ field: 'hotelId', message: 'hotelId is required'}]));
  }

  const offset = (page - 1) * limit;

  // Base query setup (moved conditions application later)
  const baseQuery = db
    .select({
      employeeid: employee.employeeid,
      hotelid: employee.hotelid,
      roleid: employee.roleid,
      nameid: employee.nameid,
      userid: employee.userid, // Include userid
      createdat: employee.createdat,
      updatedat: employee.updatedat,
      firstName: name.firstname,
      lastName: name.lastname,
      title: name.title,
      roleName: role.name,
      roleDescription: role.description
    })
    .from(employee)
    .leftJoin(name, eq(employee.nameid, name.nameid))
    .leftJoin(role, eq(employee.roleid, role.roleid));

  let conditions = [eq(employee.hotelid, hotelId)];
  if (roleNameQuery) {
    const roleNameArray = roleNameQuery.split(',').map(r => r.trim()).filter(r => r);
    if (roleNameArray.length > 0) {
      conditions.push(inArray(role.name, roleNameArray));
    }
  }
  if (search) {
    conditions.push(
      or(
        like(name.firstname, `%${search}%`),
        like(name.lastname, `%${search}%`),
        like(employee.userid, `%${search}%`) // Search by userid (e.g., Clerk ID) too
      )
    );
  }

  const combinedWhereClause = and(...conditions);

  const employeesData = await baseQuery
    .where(combinedWhereClause)
    .orderBy(desc(employee.createdat))
    .limit(limit)
    .offset(offset);

  // Count query needs the same joins and conditions
  const countQuery = db
    .select({ count: sql<number>`count(${employee.employeeid})`.mapWith(Number) })
    .from(employee)
    .leftJoin(role, eq(employee.roleid, role.roleid))
    .leftJoin(name, eq(employee.nameid, name.nameid))
    .where(combinedWhereClause);
  
  const countResult = await countQuery;
  const totalCount = countResult[0]?.count ?? 0;
  const totalPages = Math.ceil(totalCount / limit);

  // Format response
  const formattedEmployees = employeesData.map(emp => ({
      employeeId: emp.employeeid,
      userId: emp.userid,
      hotelId: emp.hotelid,
      name: {
          title: emp.title,
          firstName: emp.firstName,
          lastName: emp.lastName,
          fullName: `${emp.title || ''} ${emp.firstName || ''} ${emp.lastName || ''}`.trim()
      },
      role: {
          roleId: emp.roleid,
          name: emp.roleName,
          description: emp.roleDescription
      },
      createdAt: emp.createdat,
      updatedAt: emp.updatedat
  }));

  res.json({
    data: formattedEmployees,
    pagination: {
      total: totalCount,
      page,
      limit,
      totalPages
    }
  });
}));

/**
 * Get a specific employee by ID
 * 
 * @route GET /api/management/employees/:employeeId
 * @param {string} employeeId - The employee ID
 * @param {string} hotelId - The hotel ID for validation
 */
router.get('/:employeeId', asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const { employeeId } = req.params;
  const hotelId = req.query.hotelId as string;

  if (!hotelId) {
    return next(new ValidationError('Hotel ID query parameter is required for validation', [{ field: 'hotelId', message: 'hotelId required'}]));
  }
  if (!employeeId) {
      return next(new ValidationError('Employee ID parameter is required', [{ field: 'employeeId', message: 'employeeId required'}]));
  }

  const [employeeData] = await db
    .select({
      employeeid: employee.employeeid,
      hotelid: employee.hotelid,
      userid: employee.userid,
      nameid: employee.nameid,
      roleid: employee.roleid,
      createdat: employee.createdat,
      updatedat: employee.updatedat,
      firstName: name.firstname,
      middleName: name.middlename,
      lastName: name.lastname,
      title: name.title,
      suffix: name.suffix,
      roleName: role.name,
      roleDescription: role.description,
      hotelName: hotel.name
    })
    .from(employee)
    .leftJoin(name, eq(employee.nameid, name.nameid))
    .leftJoin(role, eq(employee.roleid, role.roleid))
    .leftJoin(hotel, eq(employee.hotelid, hotel.hotelid))
    .where(and(eq(employee.employeeid, employeeId), eq(employee.hotelid, hotelId)));

  if (!employeeData) {
    return next(new NotFoundError('Employee'));
  }

  const response = {
    employeeId: employeeData.employeeid,
    hotelId: employeeData.hotelid,
    hotelName: employeeData.hotelName,
    userId: employeeData.userid,
    name: {
      title: employeeData.title,
      firstName: employeeData.firstName,
      middleName: employeeData.middleName,
      lastName: employeeData.lastName,
      suffix: employeeData.suffix,
      fullName: [
        employeeData.title,
        employeeData.firstName,
        employeeData.middleName,
        employeeData.lastName,
        employeeData.suffix
      ].filter(Boolean).join(' ')
    },
    role: {
      roleId: employeeData.roleid,
      name: employeeData.roleName,
      description: employeeData.roleDescription
    },
    createdAt: employeeData.createdat,
    updatedAt: employeeData.updatedat
  };

  res.json(response);
}));

/**
 * Update an employee's role
 * 
 * @route PUT /api/management/employees/:employeeId/role
 * @param {string} employeeId - The employee ID
 * @param {string} hotelId - The hotel ID for validation (in body)
 * @param {string} roleId - The new role ID (in body)
 */
router.put('/:employeeId/role', requireAuth, async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const { employeeId } = req.params;
    const { hotelId, roleId } = req.body;

    if (!employeeId) throw new ValidationError('Employee ID parameter is required', [{ field: 'employeeId', message: 'Required' }]);
    if (!hotelId) throw new ValidationError('hotelId body parameter is required', [{ field: 'hotelId', message: 'Required' }]);
    if (!roleId) throw new ValidationError('roleId body parameter is required', [{ field: 'roleId', message: 'Required' }]);

    const [existingEmployee] = await db
      .select({ employeeid: employee.employeeid, currentRoleId: employee.roleid, hotelid: employee.hotelid })
      .from(employee)
      .where(eq(employee.employeeid, employeeId))
      .limit(1);

    if (!existingEmployee) throw new NotFoundError('Employee');
    if (existingEmployee.hotelid !== hotelId) throw new ValidationError('Employee does not belong to this hotel or hotelId mismatch', [{ field: 'hotelId', message: 'Forbidden' }]);

    const [roleExists] = await db.select({ roleid: role.roleid }).from(role).where(eq(role.roleid, roleId)).limit(1);
    if (!roleExists) throw new NotFoundError('Role to assign');

    if (existingEmployee.currentRoleId === roleId) {
      const currentEmployeeData = await db.query.employee.findFirst({
        where: eq(employee.employeeid, employeeId),
        with: { name: true, role: true, hotel: { columns: { name: true }} }
      });
      return res.status(200).json({ message: 'Employee already has this role.', data: currentEmployeeData });
    }

    const [updatedEmployeeRecord] = await db
      .update(employee)
      .set({ roleid: roleId }) // updatedat is handled by DB default
      .where(eq(employee.employeeid, employeeId))
      .returning();
    
    if (!updatedEmployeeRecord) {
        throw new DatabaseError('Failed to update employee role, employee might have been deleted concurrently.');
    }

    const updatedEmployeeDetails = await db.query.employee.findFirst({
        where: eq(employee.employeeid, updatedEmployeeRecord.employeeid),
        with: { name: true, role: true, hotel: { columns: { name: true }} }
    });

    res.status(200).json({ message: 'Employee role updated successfully', data: updatedEmployeeDetails });

  } catch (error) {
    // Forward known custom errors, wrap others
    if (error instanceof ValidationError || error instanceof NotFoundError || error instanceof DatabaseError) {
      next(error);
    } else {
      console.error("Error in PUT /:employeeId/role:", error); // Log unexpected errors
      next(new DatabaseError('Failed to update employee role due to an unexpected issue', error instanceof Error ? error : undefined));
    }
  }
});

/**
 * Update employee profile information
 * 
 * @route PUT /api/management/employees/:employeeId/profile
 * @param {string} employeeId - The employee ID
 * @param {string} hotelId - The hotel ID for validation
 * @param {object} name - The employee's updated name information
 */
router.put('/:employeeId/profile', requireAuth, async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const { employeeId } = req.params;
    const { hotelId, name: nameData } = req.body;

    if (!employeeId) throw new ValidationError('Employee ID parameter is required', []);
    if (!hotelId) throw new ValidationError('hotelId body parameter is required', []);

    if (!nameData || (!nameData.firstName && !nameData.lastName && !nameData.title && !nameData.middleName && !nameData.suffix)) {
      throw new ValidationError('At least one name field must be provided to update', []);
    }

    const empRecord = await db.select({ 
      employeeid: employee.employeeid, 
      nameid: employee.nameid,
      hotelid: employee.hotelid
    }).from(employee).where(eq(employee.employeeid, employeeId)).limit(1);

    if (empRecord.length === 0) throw new NotFoundError('Employee');
    if (empRecord[0].hotelid !== hotelId) throw new ValidationError('Hotel ID mismatch', []);

    const nameId = empRecord[0].nameid;
    const updateNameData: Partial<typeof name.$inferInsert> = { updatedat: new Date().toISOString() };
    let hasNameUpdates = false;

    if (nameData.firstName !== undefined) { updateNameData.firstname = nameData.firstName; hasNameUpdates = true; }
    if (nameData.lastName !== undefined) { updateNameData.lastname = nameData.lastName; hasNameUpdates = true; }
    if (nameData.middleName !== undefined) { updateNameData.middlename = nameData.middleName; hasNameUpdates = true; }
    if (nameData.title !== undefined) { updateNameData.title = nameData.title; hasNameUpdates = true; }
    if (nameData.suffix !== undefined) { updateNameData.suffix = nameData.suffix; hasNameUpdates = true; }

    if (hasNameUpdates && nameId) {
      await db.update(name).set(updateNameData).where(eq(name.nameid, nameId));
    } else if (hasNameUpdates && !nameId) {
      throw new DatabaseError('Employee name record not found, cannot update.');
    }

    await db.update(employee).set({ updatedat: new Date().toISOString() }).where(eq(employee.employeeid, employeeId));

    const updatedEmployee = await db.query.employee.findFirst({
      where: eq(employee.employeeid, employeeId),
      with: { name: true, role: true }
    });

    if (!updatedEmployee) throw new DatabaseError('Failed to retrieve updated employee data.');
    res.status(200).json(updatedEmployee);

  } catch (error) {
    console.error("Error in PUT /:employeeId:", error);
    if (error instanceof ValidationError || error instanceof NotFoundError || error instanceof DatabaseError) {
      next(error);
    } else {
      next(new DatabaseError('Failed to update employee', error instanceof Error ? error : undefined));
    }
  }
});

/**
 * Create a new employee
 * 
 * @route POST /api/management/employees
 * @param {string} hotelId - The hotel ID
 * @param {string} userId - The user ID (e.g., from authentication service)
 * @param {string} roleId - The role ID
 * @param {object} name - The employee's name information
 */
router.post('/', requireAuth, async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const { 
      hotelId, 
      roleId, 
      userId, // Clerk User ID
      title,
      firstName,
      lastName,
      middleName = null,
      suffix = null
    } = req.body;
    
    if (!hotelId || !roleId || !userId || !firstName || !lastName) {
      throw new ValidationError('Missing required fields', [
        {field: 'hotelId', message: 'Required'},
        {field: 'roleId', message: 'Required'},
        {field: 'userId', message: 'Required (Clerk User ID)'},
        {field: 'firstName', message: 'Required'},
        {field: 'lastName', message: 'Required'},
      ]);
    }

    const hotelExists = await db.select({id: hotel.hotelid}).from(hotel).where(eq(hotel.hotelid, hotelId)).limit(1);
    if (hotelExists.length === 0) throw new NotFoundError('Hotel');
    const roleExists = await db.select({id: role.roleid}).from(role).where(eq(role.roleid, roleId)).limit(1);
    if (roleExists.length === 0) throw new NotFoundError('Role');

    const existingEmployee = await db.select({id: employee.employeeid}).from(employee).where(and(eq(employee.userid, userId), eq(employee.hotelid, hotelId))).limit(1);
    if (existingEmployee.length > 0) {
      throw new ValidationError('Employee with this User ID already exists for this hotel', [{field: 'userId', message: 'Duplicate employee'}]);
    }

    const newEmployeeId = uuidv4();
    const newNameId = uuidv4();
    const now = new Date().toISOString();
    let createdEmployee: any = null;

    await db.transaction(async (tx) => {
      await tx.insert(name).values({
        nameid: newNameId,
        title: title,
        firstname: firstName,
        middlename: middleName,
        lastname: lastName,
        suffix: suffix,
        createdat: now,
        updatedat: now
      });

      await tx.insert(employee).values({
        employeeid: newEmployeeId,
        hotelid: hotelId,
        userid: userId,
        nameid: newNameId,
        roleid: roleId,
        createdat: now,
        updatedat: now
      });
    });

    createdEmployee = await db.query.employee.findFirst({
      where: eq(employee.employeeid, newEmployeeId),
      with: { name: true, role: true }
    });

    if (!createdEmployee) throw new DatabaseError('Failed to retrieve created employee after transaction.');
    res.status(201).json(createdEmployee);

  } catch (error) {
    console.error("Error in POST /:", error);
    if (error instanceof ValidationError || error instanceof NotFoundError || error instanceof DatabaseError) {
      next(error);
    } else {
      next(new DatabaseError('Failed to create employee', error instanceof Error ? error : undefined));
    }
  }
});

/**
 * Remove an employee
 * 
 * @route DELETE /api/management/employees/:employeeId
 * @param {string} employeeId - The employee ID
 * @param {string} hotelId - The hotel ID for validation
 */
router.delete('/:employeeId', requireAuth, async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const { employeeId } = req.params;
    const { hotelId } = req.body;

    if (!employeeId) throw new ValidationError('Employee ID parameter is required', []);
    if (!hotelId) throw new ValidationError('hotelId body parameter is required for verification', []);

    const empRecord = await db.select({ 
      employeeid: employee.employeeid,
      nameid: employee.nameid, 
      hotelid: employee.hotelid
    }).from(employee).where(eq(employee.employeeid, employeeId)).limit(1);

    if (empRecord.length === 0) throw new NotFoundError('Employee');
    if (empRecord[0].hotelid !== hotelId) throw new ValidationError('Hotel ID mismatch. Cannot delete employee from this hotel.', []);

    const nameIdToDelete = empRecord[0].nameid;
    
    await db.transaction(async (tx) => {
      await tx.delete(employee).where(eq(employee.employeeid, employeeId));
      if (nameIdToDelete) {
        await tx.delete(name).where(eq(name.nameid, nameIdToDelete));
      }
    });
    res.status(200).json({ message: 'Employee deleted successfully', employeeId });

  } catch (error) {
    console.error(`Failed to delete employee ${employeeId}:`, error);
    return next(new DatabaseError('Failed to delete employee. Check dependencies.'));
  }
});

/**
 * Get all available roles
 * 
 * @route GET /api/management/employees/roles
 */
router.get('/roles/all', async (req: Request, res: Response) => {
  try {
    const roles = await db
      .select({
        roleid: role.roleid,
        name: role.name,
        description: role.description,
        createdat: role.createdat
      })
      .from(role)
      .orderBy(role.name);

    res.json({ data: roles });
  } catch (error: any) {
    console.error('Error fetching roles:', error);
    res.status(500).json({ message: 'Error fetching roles', error: error.message });
  }
});

/**
 * Get the current employee based on authentication
 * 
 * @route GET /api/management/employees/me
 * @requires Authentication
 */
router.get('/me', requireAuth, linkUserIdentity, (async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user || !req.user.clerkId) {
      return res.status(401).json({ message: 'Not authenticated' });
    }
    
    const clerkId = req.user.clerkId;
    
    // Get the employee with detailed information
    const employeeResults = await db
      .select({
        employee: {
          employeeid: employee.employeeid,
          hotelid: employee.hotelid,
          userid: employee.userid,
          nameid: employee.nameid,
          roleid: employee.roleid,
          createdat: employee.createdat,
          updatedat: employee.updatedat
        },
        name: {
          firstname: name.firstname,
          middlename: name.middlename,
          lastname: name.lastname,
          title: name.title,
          suffix: name.suffix
        },
        role: {
          roleid: role.roleid,
          name: role.name,
          description: role.description
        },
        hotel: {
          hotelid: hotel.hotelid,
          name: hotel.name,
          logo: hotel.logo,
          timezone: hotel.timezone
        }
      })
      .from(employee)
      .leftJoin(name, eq(employee.nameid, name.nameid))
      .leftJoin(role, eq(employee.roleid, role.roleid))
      .leftJoin(hotel, eq(employee.hotelid, hotel.hotelid))
      .where(eq(employee.userid, clerkId));

    if (!employeeResults.length) {
      return res.status(404).json({ message: 'Employee record not found for authenticated user' });
    }

    const employeeData = employeeResults[0];

    // Format the response
    const response = {
      employeeId: employeeData.employee.employeeid,
      hotelId: employeeData.employee.hotelid,
      hotel: {
        id: employeeData.hotel?.hotelid,
        name: employeeData.hotel?.name,
        logo: employeeData.hotel?.logo,
        timezone: employeeData.hotel?.timezone
      },
      userId: employeeData.employee.userid, // Clerk ID
      name: {
        title: employeeData.name?.title,
        firstName: employeeData.name?.firstname,
        middleName: employeeData.name?.middlename,
        lastName: employeeData.name?.lastname,
        suffix: employeeData.name?.suffix,
        fullName: [
          employeeData.name?.title,
          employeeData.name?.firstname,
          employeeData.name?.middlename,
          employeeData.name?.lastname,
          employeeData.name?.suffix
        ].filter(Boolean).join(' ')
      },
      role: {
        roleId: employeeData.role?.roleid,
        name: employeeData.role?.name,
        description: employeeData.role?.description
      },
      createdAt: employeeData.employee.createdat,
      updatedAt: employeeData.employee.updatedat
    };

    res.json(response);
  } catch (error) {
    console.error('Error fetching current employee:', error);
    res.status(500).json({ 
      message: 'Error fetching current employee', 
      error: error instanceof Error ? error.message : String(error) 
    });
  }
}) as RequestHandler);

export default router; 