import { Request, Response, NextFunction } from 'express';
import { requireAuth, linkUserIdentity, AuthenticatedRequest } from '../clerk/auth';
import { ApiError } from './errorHandler';

/**
 * Middleware to authenticate guests
 * This combines Clerk authentication with our application-specific guest validation
 */
export const authenticateGuest = [
  requireAuth,
  linkUserIdentity,
  async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      // After Clerk authentication and user linking, verify that the user is a guest
      if (!req.user) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      if (!req.user.guestId) {
        return res.status(403).json({ error: 'Access denied. This endpoint is only for hotel guests.' });
      }

      // If we reach here, the user is authenticated and is a guest
      next();
    } catch (error) {
      console.error('Error in guest authentication middleware:', error);
      next(new ApiError('Authentication error', 500));
    }
  }
];

/**
 * Middleware to authenticate employees
 * This combines Clerk authentication with our application-specific employee validation
 */
export const authenticateEmployee = [
  requireAuth,
  linkUserIdentity,
  async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      // After Clerk authentication and user linking, verify that the user is an employee
      if (!req.user) {
        return res.status(401).json({ error: 'Unauthorized' });
      }
      
      if (!req.user.employeeId) {
        return res.status(403).json({ error: 'Access denied. This endpoint is only for hotel employees.' });
      }
      
      // If we reach here, the user is authenticated and is an employee
      next();
    } catch (error) {
      console.error('Error in employee authentication middleware:', error);
      next(new ApiError('Authentication error', 500));
    }
  }
];

/**
 * Middleware to require specific employee roles
 * @param roles Array of role names that are allowed to access the endpoint
 */
export const requireRoles = (roles: string[]) => {
  return async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      // First make sure the user is an authenticated employee
      if (!req.user || !req.user.employeeId) {
        return res.status(403).json({ error: 'Access denied. This endpoint is only for hotel employees.' });
      }
      
      // Then check if they have the required role
      if (!req.user.role || !roles.includes(req.user.role)) {
        return res.status(403).json({ error: 'Access denied. You do not have the required role.' });
      }
      
      // If we reach here, the user has the required role
      next();
    } catch (error) {
      console.error('Error in role-based authorization middleware:', error);
      next(new ApiError('Authorization error', 500));
    }
  };
}; 