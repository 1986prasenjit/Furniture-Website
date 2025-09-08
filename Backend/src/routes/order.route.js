import { Router } from "express";
import { createNewOrder } from "../controllers/order.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { validate } from "../middlewares/validator.middleware.js";
import { orderValidator } from "../validators/index.js";

const router = Router();

router
  .route("/new-order")
  .post(orderValidator(), validate, verifyJWT, createNewOrder);

export default router;
