import { NextFunction, Request, Response } from "express";
import jwt from 'jsonwebtoken'

//extend express request type to include user info
export interface AuthRequest extends Request {
    user?: {
        userId: string,
        role: string
    };
}

export const requireAdmin = (req:AuthRequest, res: Response, next:NextFunction) =>{
    if(req.user?.role !== "admin"){
        return res.status(403).json({message: "Access denied: Admins only"})
    }
    next()
}

export const verifyToken = (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ message: 'No token provided' });
        }

        const token = authHeader.split(' ')[1];

        if (!token) {
            return res.status(401).json({ message: 'No token provided' });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as unknown as {
            userId: string;
            role: string;
        };

        req.user = decoded
        next();

    }
    catch (error) {
        return res.status(401).json({ message: 'Invalid or expired token' });
    }
}