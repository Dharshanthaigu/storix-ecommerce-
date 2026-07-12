import { Response } from "express";
import Address from "../models/Address";
import { createAddressSchema, updateAddressSchema } from "../validators/addressValidator";
import { AuthRequest } from "../middleware/authmiddleware";

export const createAddress = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const parsed = createAddressSchema.safeParse(req.body);
        if (!parsed.success) {
            res.status(400).json({ error: parsed.error.issues[0]?.message })
            return
        }

        if (!req.user?.userId) {
            res.status(401).json({ error: "Unauthorized" });
            return;
        }

        const { fullName, phone, addressLine1, addressLine2, city, state, pincode, isDefault } = parsed.data;

        if (isDefault) {
            await Address.updateMany(
                { user: req.user.userId, isDefault: true },
                { $set: { isDefault: false } }
            );
        }

        const address = await Address.create({
            fullName,
            phone,
            addressLine1,
            city,
            state,
            pincode,
            user: req.user.userId,
            ...(addressLine2 && { addressLine2 }),
            ...(isDefault !== undefined && { isDefault }),
        });

        res.status(201).json({ message: "Address added successfully", address })
    }
    catch (error) {
        req.log.error({ err: error }, "Create address error");
        res.status(500).json({ error: "Something went wrong while adding address" });
    }
}

export const getAddress = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        if (!req.user?.userId) {
            res.status(401).json({ error: "Unauthorized" })
            return
        }

        const address = await Address.find({ user: req.user.userId });
        res.status(200).json({ address })
    }
    catch (error) {
        req.log.error({ err: error }, "Get addresses error");
        res.status(500).json({ error: "Something went wrong while fetching addresses" })
    }
}

export const updateAddress = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const parsed = updateAddressSchema.safeParse(req.body)
        if (!parsed.success) {
            res.status(400).json({ error: parsed.error.issues[0]?.message })
            return;
        }

        if (!req.user?.userId) {
            res.status(401).json({ error: "Unauthorized" })
            return
        }

        const addressId = req.params.id
        if (!addressId) {
            res.status(400).json({ error: "Address ID is required" })
            return
        }

        const address = await Address.findOneAndUpdate(
            { _id: addressId, user: req.user.userId },
            parsed.data,
            { returnDocument: "after" }
        )

        if (!address) {
            res.status(404).json({ error: "Address not found" })
            return
        }
        res.status(200).json({ message: "Address updated successfully", address })

    }
    catch (error) {
        req.log.error({ err: error }, "Update address error");
        res.status(500).json({ error: "Something went wrong while updating address" });
    }
}

export const deleteAddress = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        if (!req.user?.userId) {
            res.status(401).json({ error: "Unauthorized" })
            return
        }

        const addressId = req.params.id
        if (!addressId) {
            res.status(400).json({ error: "Address ID is required" })
            return
        }

        const address = await Address.findOneAndDelete({
            _id: addressId,
            user: req.user.userId
        })

        if (!address) {
            res.status(404).json({ error: "Address not found" })
            return
        }
        res.status(200).json({ message: "Address deleted successfully" })

    }
    catch (error) {
        req.log.error({ err: error }, "Delete address error");
        res.status(500).json({ error: "Something went wrong while deleting address" });
    }
}