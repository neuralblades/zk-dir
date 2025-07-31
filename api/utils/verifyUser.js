import jwt from 'jsonwebtoken';
import { errorHandler } from './error.js';

export const verifyToken = (req, res, next) => {
    const token = req.cookies.access_token;
    if (!token) {
        return next(errorHandler(401, 'Unauthorized'));
    }
    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) {
            return next(errorHandler(401, 'Unauthorized'));
        }
        req.user = user;
        next();
    });
};

// Optional token verification - doesn't fail if no token
export const optionalVerifyToken = (req, res, next) => {
    const token = req.cookies.access_token;
    
    if (!token) {
        // No token - continue without setting req.user
        return next();
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) {
            // Invalid token - continue without setting req.user
            return next();
        }
        
        req.user = user;
        next();
    });
};