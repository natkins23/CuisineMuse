import rateLimit from 'express-rate-limit';
import { Request } from 'express';

// Extend the Request type to include the user property
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: number | string;
        [key: string]: any;
      };
    }
  }
}

// Base rate limiter configuration
const baseRateLimiter = {
  windowMs: 15 * 60 * 1000, // 15 minutes
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  message: 'Too many requests, please try again after some time',
};

// Default API rate limiter - allows 60 requests per 15 minute window
export const defaultLimiter = rateLimit({
  ...baseRateLimiter,
  max: 60, // Limit each IP to 60 requests per window
});

// Stricter rate limiter for AI endpoints - allows 10 requests per 15 minute window
export const aiLimiter = rateLimit({
  ...baseRateLimiter,
  max: 10, // Limit each IP to 10 requests per window
  message: 'AI query limit reached. Please try again in a few minutes.',
});

// Very strict rate limiter for auth endpoints - helps prevent brute force attacks
export const authLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour window
  max: 5, // Limit each IP to 5 failed requests per hour
  skipSuccessfulRequests: true, // Only count failed requests
  standardHeaders: true,
  legacyHeaders: false,
  message: 'Too many login attempts, please try again after an hour',
});

// For authenticated users, we can implement more sophisticated limiting
// This is a basic example but would need to be expanded for production use
export function createUserBasedLimiter(getUserQuota: (userId: string) => number) {
  return rateLimit({
    ...baseRateLimiter,
    max: (req: Request, _res) => {
      // If user is authenticated, apply user-specific quota
      const userId = req.user?.id;
      if (userId) {
        return getUserQuota(userId.toString());
      }
      // Default quota for non-authenticated users
      return 5;
    },
  });
}