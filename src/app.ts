import "./loadEnv";
import express from "express";
import cors from "cors";
import authRoutes from "./routes/authRoutes";
import productRoutes from "./routes/productRoutes";
import categoryRoutes from "./routes/categoryRoutes";
import webhookRoutes from "./routes/webhookRoutes";
import ticketRoutes from "./routes/ticketRoutes";
import addressRoutes from "./routes/addressRoutes";
import orderRoutes from "./routes/orderRoutes";
import couponRoutes from "./routes/couponRoutes";
import pinoHttp from "pino-http";
import logger from "./config/logger";
import { randomUUID } from "crypto";


const app = express();

app.use(cors());

app.use(
  pinoHttp({
    logger,
    genReqId: (req) =>(req.headers["x-request-id"] as string) || randomUUID(),
    customLogLevel: (req,res,err) =>{
      if(res.statusCode >= 500 || err) return "error"
      if(res.statusCode >= 400) return "warn"
      return "info"
    }
  })
)

app.use("/api/webhooks", webhookRoutes);
app.use(express.json());

app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok", message: "Storix API is running" });
});

app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/tickets", ticketRoutes);
app.use("/api/addresses", addressRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/coupons", couponRoutes);

export default app;