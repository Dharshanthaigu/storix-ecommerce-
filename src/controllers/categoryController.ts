import { Request, Response } from "express";
import Category from "../models/Category";
import { createCategorySchema, updateCategorySchema } from "../validators/categoryValidator";

export const createCategory = async (req: Request, res: Response): Promise<void> => {
    try {
        const parsed = createCategorySchema.safeParse(req.body)
        if (!parsed.success) {
            res.status(400).json({ error: parsed.error.issues[0]?.message })
            return;
        }

        const { name, description } = parsed.data

        const existing = await Category.findOne({ name })
        if (existing) {
            res.status(409).json({ error: "Category already exists" });
            return
        }

        const category = await Category.create({ name, ...(description && { description }) });
        res.status(201).json({ message: "Category created successfully", category })
    }
    catch (error) {
        req.log.error({ err: error }, "Create category error");
        res.status(500).json({ error: "Something went wrong while creating category" });
    }
}

export const getCategories = async (req: Request, res: Response): Promise<void> => {
    try {
        const category = await Category.find();
        res.status(200).json({ category });
    }
    catch (error) {
        req.log.error({ err: error }, "Get category error");
        res.status(500).json({ error: "Something went wrong while fetching category" })
    }
}

export const getCategoriesById = async (req: Request, res: Response): Promise<void> => {
    try {
        const categoryId = req.params.id
        if (!categoryId) {
            res.status(400).json({ error: "Category ID is required" })
            return
        }

        const category = await Category.findById(categoryId)
        if (!category) {
            res.status(404).json({ error: "Category not found" })
            return;
        }
        res.status(200).json({ category })
    }
    catch (error) {
        req.log.error({ err: error }, "Get category error");
        res.status(500).json({ error: "Something went wrong while fetching category" })
    }
}

export const updateCategory = async (req: Request, res: Response): Promise<void> => {
    try {
        const parsed = updateCategorySchema.safeParse(req.body)
        if (!parsed.success) {
            res.status(400).json({ error: parsed.error.issues[0]?.message })
            return
        }

        const categoryId = req.params.id
        if (!categoryId) {
            res.status(400).json({ error: "Category ID is required" })
            return
        }

        const category = await Category.findByIdAndUpdate(categoryId, parsed.data, { returnDocument: "after" })
        if (!category) {
            res.status(404).json({ error: "Category not found" })
            return
        }
        res.status(200).json({ message: "Category updated successfully", category })
    }
    catch (error) {
        req.log.error({ err: error }, "Update category error");
        res.status(500).json({ error: "Something went wrong while updating category" })
    }
}

export const deleteCategory = async (req: Request, res: Response): Promise<void> => {
    try {
        const categoryId = req.params.id
        if (!categoryId) {
            res.status(400).json({ error: "Category ID is required" })
            return
        }

        const category = await Category.findByIdAndDelete(categoryId)
        if (!category) {
            res.status(404).json({ error: "Category not found" })
            return
        }
        res.status(200).json({ message: "Category deleted successfully" })
    }
    catch (error) {
        req.log.error({ err: error }, "Delete category error");
        res.status(500).json({ error: "Something went wrong while deleting category" })
    }
}