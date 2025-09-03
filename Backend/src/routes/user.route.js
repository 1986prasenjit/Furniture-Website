import { Router } from "express";
import {
  getProfile,
  loginUser,
  logOutUser,
  registerUser,
  verifyEmail,
} from "../controllers/auth.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { validate } from "../middlewares/validator.middleware.js";
import {
  loginUserValidator,
  userRegistrationValidator,
} from "../validators/index.js";

const router = Router();

router
  .route("/register")
  .post(userRegistrationValidator(), validate, registerUser);
router.route("/verify-email/:token").get(verifyEmail);
router.route("/login").post(loginUserValidator(), validate, loginUser);
router.route("/logout").get(verifyJWT, logOutUser);
router.route("/profile").get(verifyJWT, getProfile);
export default router;
