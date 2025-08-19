import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

//user routes
import userRoutes from "./routes/user.route.js";

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

app.use(cookieParser())

  app.use("/api/v1/user", userRoutes)

export default app;