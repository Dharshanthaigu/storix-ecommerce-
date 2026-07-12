import { Router } from "express";
import express from 'express'
import { handlePaymentWebhook } from "../controllers/webhookController";

const router = Router();

router.post("/payment", express.raw({ type: "application/json" }), handlePaymentWebhook);

export default router;