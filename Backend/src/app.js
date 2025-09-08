import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";
import errorHandleMiddleware from "./middlewares/error.middleware.js";

//user routes
import userRoutes from "./routes/user.route.js";

//product routes
import productRoutes from "./routes/product.route.js";

//order routes
import orderRoutes from "./routes/order.route.js";

const app = express();

app.use(express.json());

app.use(express.urlencoded({ extended: true }));

app.use(
  cors({
    origin: process.env.BASE_URL,
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(cookieParser());

//!user routes
app.use("/api/v1/user", userRoutes);

//!product routes
app.use("/api/v1/product", productRoutes);

//!order routes
app.use("/api/v1/order", orderRoutes);

app.use(errorHandleMiddleware);
export default app;
