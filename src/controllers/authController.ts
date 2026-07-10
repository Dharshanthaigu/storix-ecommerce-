import { Request, Response } from "express";
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"
import User from "../models/User"
import { registerSchema, loginSchema } from "../validators/authValidator";

export const register = async (req: Request, res: Response): Promise<void> => {
    try {
        const parsed = registerSchema.safeParse(req.body);
        if (!parsed.success) {
            res.status(400).json({ error: parsed.error.issues[0]?.message });
            return;
        }

        const { name, email, password, phone } = parsed.data

        const existingUser = await User.findOne({ email })
        if (existingUser) {
            res.status(409).json({ error: "User with this email already exists" });
            return;
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await User.create({
            name, email, password: hashedPassword, phone
        });

        res.status(201).json({
            message: "User registered successfully",
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
            },
        });

    }
    catch (error) {
        req.log.error({ err: error }, "Register error");
        res.status(500).json({ error: "Something went wrong during registration" })
    }
}

export const login = async (req: Request, res: Response): Promise<void> => {
    try {
        const parsed = loginSchema.safeParse(req.body);
        if (!parsed.success) {
            res.status(400).json({ error: parsed.error.issues[0]?.message });
            return;
        }

        const { email, password } = parsed.data

        const user = await User.findOne({ email })
        if (!user) {
            res.status(401).json({ error: "Invalid email or password" })
            return;
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            res.status(401).json({ error: "Invalid email or password" });
            return;
        }

        const secret = process.env.JWT_SECRET
        if (!secret) {
            res.status(401).json({ error: "JWT_SECRET is not defined in .env" })
            return;
        }

        const token = jwt.sign(
            { userId: user._id.toString(), role: user.role },
            secret,
            { expiresIn: "7d" as any }
        )

        res.status(200).json({
            message: "Login successful",
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        })

    }
    catch (error) {
        req.log.error({ err: error }, "Login error");
        res.status(500).json({ error: "Something went wrong during login" })
    }
}