import { ClerkExpressRequireAuth } from '@clerk/clerk-sdk-node';
import { Request, Response, NextFunction } from 'express';
import { db } from '../config/db';
import { eq, and } from 'drizzle-orm';
import { guest, employee, role as roleTable } from '../models/schema';
// We'll directly reference tables from schema once generated
// For now, we'll use placeholder functions

// Middleware to require authentication via Clerk
export const requireAuth = ClerkExpressRequireAuth({
  // Options
});

// Extended Express request type with user information
export interface AuthenticatedRequest extends Request {
  user?: {
    clerkId: string;
    userId?: string;
    guestId?: string;
    employeeId?: string;
    role?: string;
    hotelId?: string;
    permissions?: string[];
  };
}

// Middleware to link Clerk user to our system
export const linkUserIdentity = async (
  req: AuthenticatedRequest, 
  res: Response, 
  next: NextFunction
) => {
  try {
    // @ts-ignore - Clerk types
    if (!req.auth?.userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    
    // @ts-ignore - Clerk types
    const clerkId = req.auth.userId;
    
    // Get user from database
    const user = await getUserByClerkId(clerkId);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    req.user = {
      clerkId,
      ...user
    };
    
    next();
  } catch (error) {
    console.error('Error linking user identity:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Role-based access control middleware
export const requireRole = (roles: string[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user || !req.user.role || !roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Forbidden' });
    }
    next();
  };
};

// Middleware to require guest role
export const requireGuest = (
  req: AuthenticatedRequest, 
  res: Response, 
  next: NextFunction
) => {
  if (!req.user || req.user.role !== 'guest') {
    return res.status(403).json({ error: 'Access denied: Guest role required' });
  }
  next();
};

// Middleware to automatically populate guestId from authenticated user
export const populateGuestId = (
  req: AuthenticatedRequest, 
  res: Response, 
  next: NextFunction
) => {
  // Skip if guestId is already provided in request
  if (req.query.guestId || req.body.guestId) {
    next();
    return;
  }

  // Add guestId from authenticated user
  if (req.user && req.user.guestId) {
    if (req.method === 'GET') {
      req.query.guestId = req.user.guestId;
    } else {
      req.body.guestId = req.user.guestId;
    }
  }

  next();
};

// Get user from Drizzle database using Clerk ID
async function getUserByClerkId(clerkId: string) {
  try {
    // First check if the user is a guest
    const guestResult = await db.select({
      guestId: guest.guestid,
      hotelId: guest.hotelid,
    })
    .from(guest)
    .where(eq(guest.userid, clerkId))
    .limit(1);
    
    if (guestResult.length > 0) {
      return {
        userId: guestResult[0].guestId,
        guestId: guestResult[0].guestId,
        role: 'guest',
        hotelId: guestResult[0].hotelId,
      };
    }
    
    // If not a guest, check if the user is an employee
    const employeeResult = await db.select({
      employeeId: employee.employeeid,
      hotelId: employee.hotelid,
      roleId: employee.roleid
    })
    .from(employee)
    .where(eq(employee.userid, clerkId))
    .limit(1);
    
    if (employeeResult.length > 0) {
      // Get the employee role
      const roleResult = await db.select({
        name: roleTable.name
      })
      .from(roleTable)
      .where(eq(roleTable.roleid, employeeResult[0].roleId))
      .limit(1);
      
      // Get permissions for the employee's role (would need to implement)
      // This would involve joining with role_permissions and permissions tables
      
      return {
        userId: employeeResult[0].employeeId,
        employeeId: employeeResult[0].employeeId,
        role: roleResult.length > 0 ? roleResult[0].name : 'unknown',
        hotelId: employeeResult[0].hotelId,
        // permissions would be populated from role_permissions
      };
    }
    
    // User not found in our system
    return null;
  } catch (error) {
    console.error('Error finding user by Clerk ID:', error);
    return null;
  }
} 